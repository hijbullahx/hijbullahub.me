from django.contrib import admin
from django.utils.html import format_html

from .models import Research, ResearchContribution


@admin.register(Research)
class ResearchAdmin(admin.ModelAdmin):
    list_display = ("title", "status_badge", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("title", "abstract", "technologies", "methodology")
    list_per_page = 20
    date_hierarchy = "created_at"
    actions = ["mark_as_published"]
    
    # Page-based help
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['title'].help_text = '🔬 RESEARCH PAGE - Research paper title'
        form.base_fields['contributors'].help_text = '🔬 RESEARCH PAGE - Contributors (comma-separated)'
        form.base_fields['status'].help_text = '🔬 RESEARCH PAGE - Current status of research'
        return form
    
    def mark_as_published(self, request, queryset):
        updated = queryset.update(status="published")
        self.message_user(request, f"{updated} research paper(s) marked as published.")
    mark_as_published.short_description = "✅ Mark as published"
    
    fieldsets = (
        ("Research Information", {
            "fields": ("title", "contributors", "status")
        }),
        ("Abstract", {
            "fields": ("abstract",),
            "classes": ("wide",)
        }),
        ("Methodology", {
            "fields": ("methodology",),
            "classes": ("wide", "collapse")
        }),
        ("Technologies & Scope", {
            "fields": ("technologies", "future_scope"),
            "classes": ("collapse",)
        }),
        ("Publication", {
            "fields": ("paper_link", "pdf_upload"),
            "classes": ("collapse",)
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    readonly_fields = ("created_at", "updated_at")
    
    def status_badge(self, obj):
        colors = {
            "planning": "#94a3b8",
            "active": "#f59e0b",
            "published": "#10b981",
        }
        color = colors.get(obj.status, "#64748b")
        return format_html(
            '<span style="background:{}; color:white; padding:4px 12px; border-radius:12px; font-size:11px; font-weight:bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = "Status"
    status_badge.admin_order_field = "status"


@admin.register(ResearchContribution)
class ResearchContributionAdmin(admin.ModelAdmin):
    list_display = ("email", "research", "status_badge", "is_read", "created_at")
    list_filter = ("status", "is_read", "created_at")
    search_fields = ("email", "research__title", "message")
    list_per_page = 20
    readonly_fields = ("created_at", "updated_at")
    actions = ["mark_as_read", "mark_as_accepted", "mark_as_rejected"]

    fieldsets = (
        ("Request Information", {
            "fields": ("research", "email", "message")
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
