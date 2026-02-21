from django.db import models

from apps.core.models import TimeStampedModel


class About(TimeStampedModel):
    mission_statement = models.TextField()
    long_bio = models.TextField()
    vision_2030 = models.TextField()
    quote = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to="about/", blank=True, null=True)

    class Meta:
        verbose_name = "About"
        verbose_name_plural = "About"

    def __str__(self):
        return "About Profile"
