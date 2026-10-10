from apps.hero.models import Hero
from apps.site_settings.models import SiteSetting
from apps.contact.models import ContactProfile


def global_site_context(request):
    """Provides global site data including dynamic favicon, hero image, and active channels to all templates."""
    hero = Hero.objects.filter(is_active=True).first()
    site_setting = SiteSetting.objects.first()
    active_channels = ContactProfile.objects.filter(is_active=True).order_by("display_order", "created_at")

    favicon_url = None
    if hero and hero.profile_image:
        favicon_url = "/favicon.png"

    return {
        "global_hero": hero,
        "global_site_setting": site_setting,
        "global_active_channels": active_channels,
        "dynamic_favicon_url": favicon_url,
    }
