from apps.hero.models import Hero
from apps.site_settings.models import SiteSetting


def global_site_context(request):
    """Provides global site data including dynamic favicon and hero image to all templates."""
    hero = Hero.objects.filter(is_active=True).first()
    site_setting = SiteSetting.objects.first()

    favicon_url = None
    if hero and hero.profile_image:
        try:
            favicon_url = hero.profile_image.url
        except Exception:
            favicon_url = None

    return {
        "global_hero": hero,
        "global_site_setting": site_setting,
        "dynamic_favicon_url": favicon_url,
    }
