from django.contrib import admin
from django.utils.html import format_html

from .models import Blog


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_published", "featured", "read_time", "created_at", "thumb_preview")
    list_filter = ("category", "is_published", "featured", "created_at")
    search_fields = ("title", "content", "seo_description")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("tags",)
    list_editable = ("is_published", "featured")
    list_per_page = 20
    date_hierarchy = "created_at"
    actions = ["publish_posts", "unpublish_posts", "mark_as_featured"]
    
    # Page-based help
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['title'].help_text = '📝 BLOG PAGE - Blog post title'
        form.base_fields['is_published'].help_text = '📝 BLOG PAGE - Only published posts appear on site'
        form.base_fields['featured'].help_text = '📝 BLOG PAGE - Show in featured section'
        return form
    
    def publish_posts(self, request, queryset):
        updated = queryset.update(is_published=True)
        self.message_user(request, f"{updated} post(s) published.")
    publish_posts.short_description = "✅ Publish selected posts"
    
    def unpublish_posts(self, request, queryset):
        updated = queryset.update(is_published=False)
        self.message_user(request, f"{updated} post(s) unpublished.")
    unpublish_posts.short_description = "❌ Unpublish selected posts"
    
    def mark_as_featured(self, request, queryset):
        updated = queryset.update(featured=True)
        self.message_user(request, f"{updated} post(s) marked as featured.")
    mark_as_featured.short_description = "✨ Mark as featured"
    
    fieldsets = (
        ("Basic Information", {
            "fields": ("title", "slug", "category")
        }),
        ("Content", {
            "fields": ("content",),
            "classes": ("wide",),
            "description": "Main blog content"
        }),
        ("Media", {
            "fields": ("thumbnail",),
        }),
        ("Organization", {
            "fields": ("tags",),
            "description": "Categorize your blog post"
        }),
        ("Publishing", {
            "fields": ("is_published", "featured", "read_time"),
            "classes": ("wide",)
        }),
        ("SEO", {
            "fields": ("seo_description",),
            "classes": ("collapse",),
            "description": "Search Engine Optimization settings"
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    readonly_fields = ("created_at", "updated_at")
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related("tags")

    @admin.display(description="Thumbnail")
    def thumb_preview(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" width="50" height="50" style="object-fit:cover;border-radius:6px;" />', obj.thumbnail.url)
        return format_html('<span style="color: #ef4444;">No image</span>')
