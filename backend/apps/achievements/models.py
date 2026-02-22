from django.db import models

from apps.core.models import TimeStampedModel


class Achievement(TimeStampedModel):
    title = models.CharField(max_length=200)
    issuer = models.CharField(max_length=160, blank=True, default="")
    date = models.DateField(blank=True, null=True)
    certificate_link = models.URLField(blank=True, default="")
    badge_image = models.ImageField(upload_to="achievements/badges/", blank=True, null=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return self.title
