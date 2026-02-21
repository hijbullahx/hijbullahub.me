from django.db import models

from apps.core.models import TimeStampedModel


class Achievement(TimeStampedModel):
    title = models.CharField(max_length=200)
    issuer = models.CharField(max_length=160)
    date = models.DateField()
    certificate_link = models.URLField(blank=True)
    badge_image = models.ImageField(upload_to="achievements/badges/", blank=True, null=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return self.title
