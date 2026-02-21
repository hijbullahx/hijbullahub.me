from django.db import models

from apps.core.models import TimeStampedModel


class Experience(TimeStampedModel):
    role = models.CharField(max_length=120)
    organization = models.CharField(max_length=150)
    description = models.TextField()
    duration = models.CharField(max_length=100)
    logo = models.ImageField(upload_to="experience/logos/", blank=True, null=True)
    highlight = models.BooleanField(default=False)

    class Meta:
        ordering = ["-highlight", "-created_at"]

    def __str__(self):
        return f"{self.role} @ {self.organization}"
