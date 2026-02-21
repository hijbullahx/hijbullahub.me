from django.contrib import admin
from django.utils.html import format_html

from .models import Experience


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ("role", "organization", "duration", "highlight", "logo_preview", "created_at")
    list_filter = ("highlight", "created_at")
    search_fields = ("role", "organization", "description")
    list_per_page = 20
    
    fieldsets = (
        ("Position Details", {
            "fields": ("role", "organization", "duration", "logo")
        }),
        ("Description", {
            "fields": ("description",),
            "classes": ("wide",)
        }),
        ("Settings", {
            "fields": ("highlight",),
            "description": "Check to feature this experience"
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    readonly_fields = ("created_at", "updated_at")

    @admin.display(description="Company Logo")
    def logo_preview(self, obj):
        if obj.logo:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit:contain;border-radius:6px;background:#f1f5f9;padding:4px;" />',
                obj.logo.url
            )
        return format_html('<span style="color: #94a3b8;">No logo</span>')
