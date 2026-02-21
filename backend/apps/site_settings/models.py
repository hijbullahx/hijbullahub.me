from django.db import models

from apps.core.models import TimeStampedModel


class SiteSetting(TimeStampedModel):
    site_title = models.CharField(max_length=120)
    meta_description = models.CharField(max_length=180)
    github_username = models.CharField(max_length=120, blank=True)
    linkedin_url = models.URLField(blank=True)
    email = models.EmailField()
    social_links = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = "Site Setting"
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return self.site_title
