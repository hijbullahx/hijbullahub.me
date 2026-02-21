from django.contrib import admin
from django.utils.html import format_html

from .models import Blog


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_published", "featured", "created_at", "thumb_preview")
    list_filter = ("category", "is_published", "featured")
    search_fields = ("title", "content", "seo_description")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("tags",)

    @admin.display(description="Thumbnail")
    def thumb_preview(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" width="50" height="50" style="object-fit:cover;border-radius:6px;" />', obj.thumbnail.url)
        return "-"
