from django.contrib import admin
from django.utils.html import format_html

from .models import Skill


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "level_bar", "display_order", "updated_at")
    list_filter = ("category",)
    search_fields = ("name", "category")
    list_editable = ("display_order",)
    ordering = ("display_order", "category", "name")
    list_per_page = 30
    
    # Page-based help
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['name'].help_text = '🏠 HOME PAGE - Skill name shown in Skills section'
        form.base_fields['level'].help_text = '🏠 HOME PAGE - Proficiency percentage (0-100)'
        form.base_fields['display_order'].help_text = '🏠 HOME PAGE - Lower numbers appear first'
        return form
    
    fieldsets = (
        ("Skill Information", {
            "fields": ("name", "category", "level", "icon", "display_order")
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    readonly_fields = ("created_at", "updated_at")
    
    def level_bar(self, obj):
        percentage = obj.level
        if percentage >= 90:
            color = "#10b981"  # Emerald
        elif percentage >= 70:
            color = "#22d3ee"  # Cyan
        elif percentage >= 50:
            color = "#f59e0b"  # Amber
        else:
            color = "#ef4444"  # Red
        
        return format_html(
            '<div style="width:100px; height:20px; background:#1e293b; border-radius:10px; overflow:hidden; position:relative;">' + \
            '<div style="width:{}%; height:100%; background:{}; border-radius:10px;"></div>' + \
            '<span style="position:absolute; top:0; left:0; right:0; bottom:0; display:flex; align-items:center; justify-content:center; color:white; font-size:11px; font-weight:bold;">{}%</span>' + \
            '</div>',
            percentage, color, percentage
        )
    level_bar.short_description = "Proficiency"
    level_bar.admin_order_field = "level"
