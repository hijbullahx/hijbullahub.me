from django.contrib import admin

from .models import HireRequest


@admin.register(HireRequest)
class HireRequestAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "rate_type", "proposed_rate", "status", "is_read", "created_at"]
    list_filter = ["status", "rate_type", "is_read"]
    search_fields = ["name", "email", "work_details"]
    readonly_fields = ["created_at", "updated_at"]
