from django.db import models

from apps.core.models import TimeStampedModel


class Hero(TimeStampedModel):
    BACKGROUND_CHOICES = [
        ("gradient", "Gradient"),
        ("image", "Image"),
        ("video", "Video"),
    ]

    name = models.CharField(max_length=120)
    tagline = models.CharField(max_length=255)
    short_bio = models.TextField()
    resume_file = models.FileField(upload_to="hero/resume/", blank=True, null=True)
    profile_image = models.ImageField(upload_to="hero/profile/", blank=True, null=True)
    background_type = models.CharField(max_length=20, choices=BACKGROUND_CHOICES, default="gradient")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.name
