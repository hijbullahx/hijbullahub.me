from django.db import models

from apps.core.models import TimeStampedModel


class Research(TimeStampedModel):
    STATUS_CHOICES = [
        ("planning", "Planning"),
        ("active", "Active"),
        ("published", "Published"),
    ]

    title = models.CharField(max_length=220)
    contributors = models.CharField(max_length=500, blank=True, help_text="Comma-separated list of contributors")
    abstract = models.TextField(blank=True)
    methodology = models.TextField(blank=True)
    technologies = models.TextField(blank=True)
    paper_link = models.URLField(blank=True)
    pdf_upload = models.FileField(upload_to="research/papers/", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="planning")
    future_scope = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
