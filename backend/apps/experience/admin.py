from django.contrib import admin
from django.utils.html import format_html

from .models import Experience


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ("role", "organization", "duration", "highlight", "logo_preview")
    list_filter = ("highlight",)
    search_fields = ("role", "organization", "description")

    @admin.display(description="Logo")
    def logo_preview(self, obj):
        if obj.logo:
            return format_html('<img src="{}" width="45" height="45" style="object-fit:cover;border-radius:6px;" />', obj.logo.url)
        return "-"
