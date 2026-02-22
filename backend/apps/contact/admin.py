from django.contrib import admin
from django.utils.html import format_html

from .models import Contact, ContactProfile, Feedback


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "timestamp", "read_status")
    list_filter = ("is_read", "timestamp")
    search_fields = ("name", "email", "subject", "message")
    list_per_page = 20
    date_hierarchy = "timestamp"
    ordering = ("-timestamp",)
    
    fieldsets = (
        ("Contact Information", {
            "fields": ("name", "email", "subject")
        }),
        ("Message", {
            "fields": ("message",),
            "classes": ("wide",)
        }),
        ("Status", {
            "fields": ("is_read",)
        }),
        ("Metadata", {
            "fields": ("timestamp",),
            "classes": ("collapse",)
        }),
    )
    
    readonly_fields = ("timestamp",)
    
    actions = ["mark_as_read", "mark_as_unread"]
    
    # Page-based help
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if 'name' in form.base_fields:
            form.base_fields['name'].help_text = '📧 CONTACT PAGE - Messages from contact form'
        return form
    
    def read_status(self, obj):
        if obj.is_read:
            return format_html(
                '<span style="color: #10b981; font-weight: bold;">✓ Read</span>'
            )
        return format_html(
            '<span style="color: #ef4444; font-weight: bold;">✉ Unread</span>'
        )
    read_status.short_description = "Status"
    read_status.admin_order_field = "is_read"
    
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f"{updated} message(s) marked as read.")
    mark_as_read.short_description = "Mark selected as read"
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f"{updated} message(s) marked as unread.")
    mark_as_unread.short_description = "Mark selected as unread"


@admin.register(ContactProfile)
class ContactProfileAdmin(admin.ModelAdmin):
    list_display = ["title", "icon_type", "link", "image_opacity", "display_order", "is_active"]
    list_filter = ["icon_type", "is_active"]
    ordering = ["display_order"]


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "rating", "short_comment", "is_visible", "created_at"]
    list_filter = ["rating", "is_visible"]
    search_fields = ["name", "email", "comment"]
    list_editable = ["is_visible"]
    ordering = ["-created_at"]

    def short_comment(self, obj):
        return obj.comment[:80] + "…" if len(obj.comment) > 80 else obj.comment
    short_comment.short_description = "Comment"
