from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class PageVisit(models.Model):
    """
    Records a single portfolio page visit.
    page: short slug, e.g. 'home', 'projects', 'ai-ml', etc.
    """
    page = models.CharField(max_length=80, default="home")
    timestamp = models.DateTimeField(auto_now_add=True)
    referrer = models.CharField(max_length=255, blank=True, default="")
    ip_address = models.CharField(max_length=45, blank=True, default="")
    country = models.CharField(max_length=100, blank=True, default="Unknown")
    city = models.CharField(max_length=100, blank=True, default="")

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.page} @ {self.timestamp:%Y-%m-%d %H:%M} ({self.country})"
