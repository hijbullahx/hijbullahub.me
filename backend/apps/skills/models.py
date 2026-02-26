from django.db import models

from apps.core.models import TimeStampedModel


class Skill(TimeStampedModel):
    # Standard categories for suggestions, but users can add custom ones
    DEFAULT_CATEGORIES = [
        "Programming",
        "Framework",
        "AI/ML",
        "Web",
        "IoT",
        "Tools",
    ]

    category = models.CharField(max_length=50)  # No choices restriction to allow custom input
    name = models.CharField(max_length=100)
    level = models.PositiveIntegerField(default=50)
    icon = models.ImageField(upload_to="skills/", blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "name"]
        unique_together = ("category", "name")

    def __str__(self):
        return f"{self.name} ({self.category})"
