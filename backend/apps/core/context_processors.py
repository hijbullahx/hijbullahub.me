from apps.hero.models import Hero
from apps.site_settings.models import SiteSetting
from apps.contact.models import ContactProfile, get_active_primary_email


def global_site_context(request):
    """Provides global site data including dynamic favicon, hero image, active channels, and active email to all templates."""
    hero = Hero.objects.filter(is_active=True).first()
    site_setting = SiteSetting.objects.first()
    active_channels = ContactProfile.objects.filter(is_active=True).order_by("display_order", "created_at")
    primary_email = get_active_primary_email()

    favicon_url = None
    if hero and hero.profile_image:
        favicon_url = "/favicon.png"

    return {
        "global_hero": hero,
        "global_site_setting": site_setting,
        "global_active_channels": active_channels,
        "global_primary_email": primary_email,
        "primary_email": primary_email,
        "dynamic_favicon_url": favicon_url,
    }
