from django.contrib import admin
from django.utils.html import format_html

from .models import SiteSetting


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ("site_title", "email", "github_username", "linkedin_url_short", "updated_at")
    search_fields = ("site_title", "meta_description", "email", "github_username")
    
    fieldsets = (
        ("Site Information", {
            "fields": ("site_title", "meta_description"),
            "description": "Basic site information and SEO"
        }),
        ("Contact Details", {
            "fields": ("email",),
        }),
        ("Social Media", {
            "fields": ("github_username", "linkedin_url", "social_links"),
            "description": "Social links stored as JSON"
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    readonly_fields = ("created_at", "updated_at")
    
    def has_add_permission(self, request):
        # Only allow one site setting instance
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)
    
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion of site settings
        return False
    
    def linkedin_url_short(self, obj):
        if obj.linkedin_url:
            return format_html(
                '<a href="{}" target="_blank" style="color: #22d3ee;">View Profile</a>',
                obj.linkedin_url
            )
        return "-"
    linkedin_url_short.short_description = "LinkedIn"
