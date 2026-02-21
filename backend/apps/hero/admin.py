from django.contrib import admin
from django.utils.html import format_html

from .models import Hero


@admin.register(Hero)
class HeroAdmin(admin.ModelAdmin):
    list_display = ("name", "background_type", "is_active", "updated_at", "profile_preview")
    list_filter = ("is_active", "background_type")
    search_fields = ("name", "tagline", "short_bio")

    @admin.display(description="Profile")
    def profile_preview(self, obj):
        if obj.profile_image:
            return format_html('<img src="{}" width="45" height="45" style="object-fit:cover;border-radius:6px;" />', obj.profile_image.url)
        return "-"
