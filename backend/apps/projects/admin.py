from django.contrib import admin
from django.utils.html import format_html

from .models import Project, ProjectImage, Tag, ProjectAcquisition


class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1
    fields = ("image", "caption", "display_order")
    readonly_fields = ("preview_inline",)
    
    def preview_inline(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="80" height="80" style="object-fit:cover;border-radius:8px;" />', obj.image.url)
        return "-"
    preview_inline.short_description = "Preview"


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "usage_count")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("name",)
    
    def usage_count(self, obj):
        return obj.project_set.count()
    usage_count.short_description = "Projects Using"


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "featured", "display_order", "tech_count", "image_count", "created_at")
    list_filter = ("status", "featured", "created_at")
    search_fields = ("title", "short_description", "full_description")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [ProjectImageInline]
    filter_horizontal = ("tech_stack",)
    list_editable = ("featured", "display_order")
    list_per_page = 20
    date_hierarchy = "created_at"
    actions = ["mark_as_featured", "mark_as_completed"]
    
    # Page-based help
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['title'].help_text = '📁 PROJECTS PAGE - Project name'
        form.base_fields['featured'].help_text = '🏠 HOME PAGE + 📁 PROJECTS PAGE - Show in featured section'
        form.base_fields['display_order'].help_text = '📁 PROJECTS PAGE - Lower numbers appear first'
        return form
    
    def mark_as_featured(self, request, queryset):
        updated = queryset.update(featured=True)
        self.message_user(request, f"{updated} project(s) marked as featured.")
    mark_as_featured.short_description = "✨ Mark selected as featured"
    
    def mark_as_completed(self, request, queryset):
        updated = queryset.update(status="completed")
        self.message_user(request, f"{updated} project(s) marked as completed.")
    mark_as_completed.short_description = "✅ Mark selected as completed"
    
    fieldsets = (
        ("Basic Information", {
            "fields": ("title", "slug", "status", "featured", "display_order")
        }),
        ("Description", {
            "fields": ("short_description", "full_description", "problem_statement", "architecture_overview"),
            "classes": ("wide",)
        }),
        ("Research", {
            "fields": ("research_direction",),
            "classes": ("collapse",)
        }),
        ("Technologies", {
            "fields": ("tech_stack",),
            "description": "Select the technologies used in this project"
        }),
        ("Links", {
            "fields": ("github_link", "live_link", "demo_video_url"),
            "classes": ("collapse",)
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
            "description": "Automatically managed timestamps"
        }),
    )
    
    readonly_fields = ("created_at", "updated_at")
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related("tech_stack", "images")
    
    def tech_count(self, obj):
        return obj.tech_stack.count()
    tech_count.short_description = "Technologies"
    
    def image_count(self, obj):
        count = obj.images.count()
        if count > 0:
            return format_html('<span style="color: #10b981;">{} images</span>', count)
        return format_html('<span style="color: #ef4444;">No images</span>')
    image_count.short_description = "Images"


@admin.register(ProjectImage)
class ProjectImageAdmin(admin.ModelAdmin):
    list_display = ("project", "caption", "preview")
    list_filter = ("project",)
    search_fields = ("project__title", "caption")
    ordering = ("project", "id")

    @admin.display(description="Image Preview")
    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="object-fit:cover;border-radius:6px;" />', obj.image.url)
        return "-"


@admin.register(ProjectAcquisition)
class ProjectAcquisitionAdmin(admin.ModelAdmin):
    list_display = ("email", "project", "phone", "status_badge", "is_read", "created_at")
    list_filter = ("status", "is_read", "created_at")
    search_fields = ("email", "phone", "project__title", "message")
    list_per_page = 20
    readonly_fields = ("created_at", "updated_at")
    actions = ["mark_as_read", "mark_as_contacted", "mark_as_accepted", "mark_as_rejected"]

    fieldsets = (
        ("Request Information", {
            "fields": ("project", "email", "phone", "message")
        }),
        ("Status", {
            "fields": ("status", "is_read")
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )

    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f"{updated} request(s) marked as read.")
    mark_as_read.short_description = "✓ Mark as read"

    def mark_as_contacted(self, request, queryset):
        updated = queryset.update(status="contacted", is_read=True)
        self.message_user(request, f"{updated} request(s) marked as contacted.")
    mark_as_contacted.short_description = "📞 Mark as contacted"

    def mark_as_accepted(self, request, queryset):
        updated = queryset.update(status="accepted", is_read=True)
        self.message_user(request, f"{updated} request(s) accepted.")
    mark_as_accepted.short_description = "✅ Accept requests"

    def mark_as_rejected(self, request, queryset):
        updated = queryset.update(status="rejected", is_read=True)
        self.message_user(request, f"{updated} request(s) rejected.")
    mark_as_rejected.short_description = "❌ Reject requests"

    def status_badge(self, obj):
        colors = {
            "pending": "#f59e0b",
            "contacted": "#3b82f6",
            "in_negotiation": "#8b5cf6",
            "accepted": "#10b981",
            "rejected": "#ef4444",
        }
        color = colors.get(obj.status, "#64748b")
        return format_html(
            '<span style="background:{}; color:white; padding:4px 12px; border-radius:12px; font-size:11px; font-weight:bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = "Status"
    status_badge.admin_order_field = "status"
