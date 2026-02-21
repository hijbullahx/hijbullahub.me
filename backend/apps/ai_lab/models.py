from django.db import models

from apps.core.models import TimeStampedModel


class AILab(TimeStampedModel):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("paused", "Paused"),
        ("completed", "Completed"),
    ]

    experiment_title = models.CharField(max_length=220)
    model_name = models.CharField(max_length=140)
    dataset_name = models.CharField(max_length=140)
    accuracy = models.FloatField(blank=True, null=True)
    precision = models.FloatField(blank=True, null=True)
    recall = models.FloatField(blank=True, null=True)
    f1_score = models.FloatField(blank=True, null=True)
    confusion_matrix_image = models.ImageField(upload_to="ai_lab/confusion/", blank=True, null=True)
    performance_notes = models.TextField(blank=True)
    metrics = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.experiment_title
