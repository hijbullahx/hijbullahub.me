from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class UserProfile(TimeStampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    title = models.CharField(max_length=160, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to="users/avatars/", blank=True, null=True)

    def __str__(self):
        return self.user.username
