from django.contrib import admin
from django.utils.html import format_html

from .models import AILab


@admin.register(AILab)
class AILabAdmin(admin.ModelAdmin):
    list_display = ("experiment_title", "model_name", "dataset_name", "status", "accuracy", "matrix_preview")
    list_filter = ("status",)
    search_fields = ("experiment_title", "model_name", "dataset_name", "performance_notes")

    @admin.display(description="Matrix")
    def matrix_preview(self, obj):
        if obj.confusion_matrix_image:
            return format_html('<img src="{}" width="45" height="45" style="object-fit:cover;border-radius:6px;" />', obj.confusion_matrix_image.url)
        return "-"
