from django.contrib import admin
from django.utils.html import format_html

from .models import AILab


@admin.register(AILab)
class AILabAdmin(admin.ModelAdmin):
    list_display = ("experiment_title", "model_name", "dataset_name", "status", "accuracy_display", "created_at", "matrix_preview")
    list_filter = ("status", "created_at")
    search_fields = ("experiment_title", "model_name", "dataset_name", "performance_notes")
    list_per_page = 20
    date_hierarchy = "created_at"
    
    fieldsets = (
        ("Experiment Details", {
            "fields": ("experiment_title", "model_name", "dataset_name", "status")
        }),
        ("Performance Metrics", {
            "fields": ("accuracy", "precision", "recall", "f1_score"),
            "description": "Model performance metrics (0.0 to 1.0)"
        }),
        ("Additional Metrics", {
            "fields": ("loss", "training_time", "epochs"),
            "classes": ("collapse",)
        }),
        ("Visualizations", {
            "fields": ("confusion_matrix_image",),
        }),
        ("Notes", {
            "fields": ("performance_notes",),
            "classes": ("wide",)
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    readonly_fields = ("created_at", "updated_at")
    
    def accuracy_display(self, obj):
        if obj.accuracy:
            percentage = obj.accuracy * 100
            if percentage >= 90:
                color = "#10b981"  # Green
            elif percentage >= 70:
                color = "#22d3ee"  # Cyan
            else:
                color = "#f59e0b"  # Amber
            return format_html(
                '<span style="color: {}; font-weight: bold;">{:.2f}%</span>', 
                color, percentage
            )
        return "-"
    accuracy_display.short_description = "Accuracy"
    accuracy_display.admin_order_field = "accuracy"

    @admin.display(description="Confusion Matrix")
    def matrix_preview(self, obj):
        if obj.confusion_matrix_image:
            return format_html(
                '<a href="{}" target="_blank"><img src="{}" width="60" height="60" style="object-fit:cover;border-radius:6px;border: 2px solid #22d3ee;" /></a>', 
                obj.confusion_matrix_image.url,
                obj.confusion_matrix_image.url
            )
        return format_html('<span style="color: #64748b;">No matrix</span>')
