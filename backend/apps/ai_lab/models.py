from django.db import models

from apps.core.models import TimeStampedModel


class AILab(TimeStampedModel):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("paused", "Paused"),
        ("completed", "Completed"),
    ]

    # Project Information
    title = models.CharField(max_length=220, default="Untitled Project", help_text="Project/Experiment Title")
    link = models.URLField(max_length=500, blank=True, help_text="Link to project/paper/demo")
    details = models.TextField(blank=True, help_text="Project description and details")
    
    # Experiment Details
    experiment_title = models.CharField(max_length=220, blank=True)
    model_name = models.CharField(max_length=140, blank=True)
    dataset_name = models.CharField(max_length=140, blank=True)
    
    # Metrics
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

    def save(self, *args, **kwargs):
        if self.link and not self.link.startswith(("http://", "https://")):
            self.link = f"https://{self.link.strip()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title if self.title else self.experiment_title
