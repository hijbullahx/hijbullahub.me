import re

from django.db import models

from apps.core.models import TimeStampedModel


class Contact(TimeStampedModel):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    admin_reply = models.TextField(blank=True, default="", help_text="Sent reply to sender")
    replied_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.name} - {self.subject}"


class ContactProfile(TimeStampedModel):
    ICON_CHOICES = [
        ("gmail", "Gmail"),
        ("github", "GitHub"),
        ("linkedin", "LinkedIn"),
        ("twitter", "Twitter / X"),
        ("whatsapp", "WhatsApp"),
        ("telegram", "Telegram"),
        ("phone", "Phone"),
        ("website", "Website"),
        ("custom", "Custom (use image only)"),
    ]

    title = models.CharField(max_length=60)
    link = models.CharField(max_length=300, help_text="URL or mailto: or tel:")
    icon_type = models.CharField(max_length=20, choices=ICON_CHOICES, default="custom")
    color_from = models.CharField(max_length=40, default="cyan-500", help_text="Tailwind color e.g. cyan-500")
    color_to = models.CharField(max_length=40, default="emerald-500", help_text="Tailwind color e.g. emerald-500")
    profile_image = models.ImageField(upload_to="contact_profiles/", blank=True, null=True, help_text="Background watermark image")
    image_opacity = models.FloatField(default=0.2, help_text="Watermark opacity 0.0 – 1.0")
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["display_order", "title"]
        verbose_name = "Contact Profile"
        verbose_name_plural = "Contact Profiles"

    @property
    def display_phone_number(self):
        """Extracts and formats a clean phone number if this profile represents a phone or WhatsApp channel."""
        raw = (self.link or "").strip()
        is_phone_type = self.icon_type in ("phone", "whatsapp") or raw.startswith(("tel:", "https://wa.me/", "http://wa.me/", "wa.me/"))
        if not is_phone_type:
            return None

        clean_link = raw.split("?")[0].split("#")[0]
        digits = re.sub(r"[^\d+]", "", clean_link)
        if not digits or len(digits.replace("+", "")) < 7:
            digits = re.sub(r"[^\d+]", "", self.title or "")

        clean_digits = digits.replace("+", "")
        if len(clean_digits) < 7:
            return None

        # Bangladesh mobile numbers (e.g. 8801748470965 or 01748470965)
        if clean_digits.startswith("880") and len(clean_digits) == 13:
            return f"+880 {clean_digits[3:7]}-{clean_digits[7:]}"
        elif clean_digits.startswith("01") and len(clean_digits) == 11:
            return f"+880 {clean_digits[1:5]}-{clean_digits[5:]}"
        elif digits.startswith("+"):
            return digits
        elif len(clean_digits) >= 10:
            return f"+{clean_digits}"
        return digits

    @property
    def extracted_email(self):
        """Extracts clean email address if this profile represents an email channel."""
        title_val = (self.title or "").strip()
        link_val = (self.link or "").replace("mailto:", "").split("?")[0].strip()

        # If title contains an email (e.g. user updated title in admin), prioritize it
        if "@" in title_val and "." in title_val:
            return title_val
        if "@" in link_val:
            return link_val
        if "@" in title_val:
            return title_val
        if self.icon_type == "gmail":
            return link_val or title_val
        return None

    @property
    def formatted_link(self):
        url = (self.link or "").strip()
        if not url:
            return ""
        if self.icon_type == "phone" and not url.startswith(("tel:", "http://", "https://")):
            clean_digits = re.sub(r"[^\d+]", "", url)
            return f"tel:{clean_digits}"
        if self.icon_type == "whatsapp" and not url.startswith(("http://", "https://")):
            clean_digits = re.sub(r"[^\d+]", "", url).replace("+", "")
            return f"https://wa.me/{clean_digits}"
        if self.icon_type == "gmail":
            email_val = self.extracted_email
            if email_val:
                return f"mailto:{email_val}"
        if (self.icon_type == "gmail" or "@" in url) and not url.startswith(("http://", "https://", "mailto:")):
            if "@" in url:
                return f"mailto:{url}"
        if not url.startswith(("http://", "https://", "mailto:", "tel:", "#", "/")):
            return f"https://{url}"
        return url

    def save(self, *args, **kwargs):
        if self.icon_type == "gmail":
            email_val = self.extracted_email
            if email_val:
                self.link = f"mailto:{email_val}"
                if "@" in (self.title or ""):
                    self.title = email_val
        elif self.link:
            val = self.link.strip()
            if self.icon_type == "phone" and not val.startswith(("tel:", "http://", "https://")):
                pass
            elif self.icon_type == "whatsapp" and not val.startswith(("http://", "https://")):
                pass
            elif "@" in val and not val.startswith(("http://", "https://", "mailto:")):
                self.link = f"mailto:{val}"
            elif val and not val.startswith(("http://", "https://", "mailto:", "tel:", "#", "/")):
                self.link = f"https://{val}"
        super().save(*args, **kwargs)

        # Synchronize SiteSetting.email when an email profile is saved
        if self.is_active and self.extracted_email:
            try:
                from apps.site_settings.models import SiteSetting
                setting = SiteSetting.objects.first()
                if setting and setting.email != self.extracted_email:
                    setting.email = self.extracted_email
                    setting.save(update_fields=["email"])
            except Exception:
                pass

    def __str__(self):
        return self.title


def get_active_primary_email():
    """
    Returns the email from active ContactProfiles (Active Channels & Profiles)
    as the primary single source of truth across the entire site.
    Falls back to SiteSetting or default.
    """
    try:
        active_email_prof = ContactProfile.objects.filter(is_active=True).filter(
            models.Q(icon_type="gmail") | models.Q(link__icontains="mailto:") | models.Q(link__icontains="@") | models.Q(title__icontains="@")
        ).order_by("display_order", "id").first()
        if active_email_prof and active_email_prof.extracted_email:
            return active_email_prof.extracted_email
    except Exception:
        pass

    try:
        from apps.site_settings.models import SiteSetting
        setting = SiteSetting.objects.first()
        if setting and setting.email:
            return setting.email.strip()
    except Exception:
        pass

    return "info@hijbullah.me"



class Feedback(TimeStampedModel):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]

    name = models.CharField(max_length=120)
    email = models.EmailField(blank=True, default="")
    profession = models.CharField(max_length=120, blank=True, default="")
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES, default=5)
    comment = models.TextField(blank=True, default="")
    admin_reply = models.TextField(blank=True, null=True, help_text="Admin reply to this feedback")
    is_visible = models.BooleanField(default=True, help_text="Show publicly on site")
    display_order = models.PositiveIntegerField(default=0, help_text="Lower = shown first in public card deck")

    class Meta:
        ordering = ["display_order", "-created_at"]
        verbose_name = "Feedback"
        verbose_name_plural = "Feedbacks"

    def __str__(self):
        return f"{self.name} — {self.rating}★"
