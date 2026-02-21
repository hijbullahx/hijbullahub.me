from django.contrib import admin

from .models import Contact


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "timestamp", "is_read")
    list_filter = ("is_read", "timestamp")
    search_fields = ("name", "email", "subject", "message")
