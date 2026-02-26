from django.db import models
from cloudinary_storage.storage import RawMediaCloudinaryStorage

from apps.core.models import TimeStampedModel


class SiteSetting(TimeStampedModel):
    site_title = models.CharField(max_length=120, blank=True, default="")
    meta_description = models.CharField(max_length=180, blank=True, default="")
    github_username = models.CharField(max_length=120, blank=True)
    linkedin_url = models.URLField(blank=True)
    email = models.EmailField(blank=True, default="")
    social_links = models.JSONField(default=dict, blank=True)

    # Sound settings — use RawMediaCloudinaryStorage so audio isn't validated as an image
    sounds_enabled = models.BooleanField(default=True)
    click_sound = models.FileField(upload_to="sounds/", blank=True, null=True, storage=RawMediaCloudinaryStorage())
    click_sound_volume = models.FloatField(default=0.5)
    empty_click_sound = models.FileField(upload_to="sounds/", blank=True, null=True, storage=RawMediaCloudinaryStorage())
    empty_click_sound_volume = models.FloatField(default=0.3)

    class Meta:
        verbose_name = "Site Setting"
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return self.site_title
