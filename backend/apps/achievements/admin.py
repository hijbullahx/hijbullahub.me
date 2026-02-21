from django.contrib import admin
from django.utils.html import format_html

from .models import Achievement


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ("title", "issuer", "date", "badge_preview")
    search_fields = ("title", "issuer")
    list_filter = ("date",)

    @admin.display(description="Badge")
    def badge_preview(self, obj):
        if obj.badge_image:
            return format_html('<img src="{}" width="45" height="45" style="object-fit:cover;border-radius:6px;" />', obj.badge_image.url)
        return "-"
