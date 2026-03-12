from django.contrib import admin
from django.utils.html import format_html

from .models import Hero


@admin.register(Hero)
class HeroAdmin(admin.ModelAdmin):
    list_display = ("name", "background_type", "is_active", "updated_at", "profile_preview")
    list_filter = ("is_active", "background_type")
    search_fields = ("name", "tagline", "short_bio")
    list_editable = ("is_active",)
    
    # Page-based help
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['name'].help_text = '🏠 HOME PAGE - Main heading on hero section'
        form.base_fields['tagline'].help_text = '🏠 HOME PAGE - Animated typing text below name'
        form.base_fields['short_bio'].help_text = '🏠 HOME PAGE - Short introduction paragraph'
        form.base_fields['is_active'].help_text = '⚠️ Only ONE hero should be active (shown on home page)'
        return form
    
    fieldsets = (
        ("Personal Information", {
            "fields": ("name", "tagline", "short_bio", "profile_image")
        }),
        ("Background Settings", {
            "fields": ("background_type",),
            "description": "Choose background type (gradient, image, or video)"
        }),
        ("Status", {
            "fields": ("is_active",),
            "description": "Only one hero section should be active at a time"
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    readonly_fields = ("created_at", "updated_at")

    @admin.display(description="Profile Image")
    def profile_preview(self, obj):
        if obj.profile_image:
            return format_html(
                '<img src="{}" width="60" height="60" style="object-fit:cover;border-radius:50%;border: 2px solid #22d3ee;" />',
                obj.profile_image.url
            )
        return format_html('<span style="color: #ef4444;">No image</span>')
