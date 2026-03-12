from django.db import models

from apps.core.models import TimeStampedModel


class Hero(TimeStampedModel):
    BACKGROUND_CHOICES = [
        ("gradient", "Gradient"),
        ("particles", "Particles"),
        ("solid", "Solid Color"),
        ("image", "Image"),
        ("video", "Video"),
    ]

    name = models.CharField(max_length=120)
    tagline = models.CharField(max_length=255)
    short_bio = models.TextField()
    profile_image = models.ImageField(upload_to="hero/profile/", blank=True, null=True)
    background_type = models.CharField(max_length=20, choices=BACKGROUND_CHOICES, default="gradient")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.name
