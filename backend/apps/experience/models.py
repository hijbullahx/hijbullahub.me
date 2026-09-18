from django.db import models

from apps.core.models import TimeStampedModel


class Experience(TimeStampedModel):
    role = models.CharField(max_length=120)
    organization = models.CharField(max_length=150, blank=True, default="")
    description = models.TextField(blank=True, default="")
    duration = models.CharField(max_length=100, blank=True, default="")
    logo = models.ImageField(upload_to="experience/logos/", blank=True, null=True)
    highlight = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "-highlight", "-created_at"]

    def __str__(self):
        return f"{self.role} @ {self.organization}"
