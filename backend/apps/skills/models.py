from django.db import models

from apps.core.models import TimeStampedModel


class Skill(TimeStampedModel):
    CATEGORY_CHOICES = [
        ("Programming", "Programming"),
        ("AI", "AI"),
        ("Web", "Web"),
        ("IoT", "IoT"),
        ("Tools", "Tools"),
    ]

    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    name = models.CharField(max_length=100)
    level = models.PositiveIntegerField(default=50)
    icon = models.CharField(max_length=120, blank=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "name"]
        unique_together = ("category", "name")

    def __str__(self):
        return f"{self.name} ({self.category})"
