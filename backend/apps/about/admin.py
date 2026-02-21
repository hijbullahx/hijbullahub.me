from django.contrib import admin
from django.utils.html import format_html

from .models import About


@admin.register(About)
class AboutAdmin(admin.ModelAdmin):
    list_display = ("id", "short_preview", "updated_at", "image_preview")
    search_fields = ("mission_statement", "long_bio", "vision_2030", "quote")
    
    # Page-based help
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['mission_statement'].help_text = '🏠 HOME PAGE - Appears in About section'
        form.base_fields['long_bio'].help_text = '🏠 HOME PAGE - Full biography text'
        form.base_fields['vision_2030'].help_text = '🏠 HOME PAGE - Future goals section'
        return form
    
    fieldsets = (
        ("Biography", {
            "fields": ("long_bio", "mission_statement"),
            "classes": ("wide",)
        }),
        ("Vision & Quote", {
            "fields": ("vision_2030", "quote"),
            "classes": ("collapse",)
        }),
        ("Media", {
            "fields": ("image",)
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    readonly_fields = ("created_at", "updated_at")
    
    def has_add_permission(self, request):
        # Only allow one About instance
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)
    
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion
        return False
    
    def short_preview(self, obj):
        if obj.mission_statement:
            preview = obj.mission_statement[:60] + "..." if len(obj.mission_statement) > 60 else obj.mission_statement
            return format_html('<span style="color: #64748b;">{}</span>', preview)
        return format_html('<span style="color: #94a3b8;">No mission statement</span>')
    short_preview.short_description = "Mission"

    @admin.display(description="About Image")
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="60" height="60" style="object-fit:cover;border-radius:8px;" />',
                obj.image.url
            )
        return format_html('<span style="color: #94a3b8;">No image</span>')
