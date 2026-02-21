from django.contrib import admin
from django.utils.html import format_html

from .models import Achievement


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ("title", "issuer", "date", "cert_link", "badge_preview")
    search_fields = ("title", "issuer")
    list_filter = ("date", "issuer")
    list_per_page = 20
    date_hierarchy = "date"
    ordering = ("-date",)
    
    fieldsets = (
        ("Achievement Details", {
            "fields": ("title", "issuer", "date")
        }),
        ("Media", {
            "fields": ("badge_image", "certificate_link"),
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    readonly_fields = ("created_at", "updated_at")
    
    def cert_link(self, obj):
        if obj.certificate_link:
            return format_html(
                '<a href="{}" target="_blank" style="color: #22d3ee; font-weight: bold;">View</a>',
                obj.certificate_link
            )
        return format_html('<span style="color: #94a3b8;">N/A</span>')
    cert_link.short_description = "Certificate"

    @admin.display(description="Badge/Certificate")
    def badge_preview(self, obj):
        if obj.badge_image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit:cover;border-radius:8px;border: 2px solid #f59e0b;" />',
                obj.badge_image.url
            )
        return format_html('<span style="color: #64748b;">No badge</span>')
