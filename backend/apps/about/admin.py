from django.contrib import admin
from django.utils.html import format_html

from .models import About


@admin.register(About)
class AboutAdmin(admin.ModelAdmin):
    list_display = ("id", "updated_at", "image_preview")
    search_fields = ("mission_statement", "long_bio", "vision_2030", "quote")

    @admin.display(description="Image")
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="45" height="45" style="object-fit:cover;border-radius:6px;" />', obj.image.url)
        return "-"
