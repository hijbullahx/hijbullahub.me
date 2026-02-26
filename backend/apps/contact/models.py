from django.db import models

from apps.core.models import TimeStampedModel


class Contact(TimeStampedModel):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

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

    def __str__(self):
        return self.title


class Feedback(TimeStampedModel):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]

    name = models.CharField(max_length=120)
    email = models.EmailField(blank=True, default="")
    profession = models.CharField(max_length=120, blank=True, default="")
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES, default=5)
    comment = models.TextField(blank=True, default="")
    is_visible = models.BooleanField(default=True, help_text="Show publicly on site")
    display_order = models.PositiveIntegerField(default=0, help_text="Lower = shown first in public card deck")

    class Meta:
        ordering = ["display_order", "-created_at"]
        verbose_name = "Feedback"
        verbose_name_plural = "Feedbacks"

    def __str__(self):
        return f"{self.name} — {self.rating}★"
