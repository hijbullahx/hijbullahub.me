from django.contrib import admin
from django.utils.html import format_html

from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "updated_at", "avatar_preview")
    search_fields = ("user__username", "title", "bio")

    @admin.display(description="Avatar")
    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" width="45" height="45" style="object-fit:cover;border-radius:6px;" />', obj.avatar.url)
        return "-"
