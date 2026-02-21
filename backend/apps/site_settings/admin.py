from django.contrib import admin

from .models import SiteSetting


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ("site_title", "email", "github_username", "updated_at")
    search_fields = ("site_title", "meta_description", "email", "github_username")
