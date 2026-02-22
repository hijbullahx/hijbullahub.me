from django.db import models

from apps.core.models import TimeStampedModel


class HireRequest(TimeStampedModel):
    RATE_TYPE_CHOICES = [
        ("hourly", "Per Hour"),
        ("daily", "Per Day"),
        ("task", "Per Task / Fixed"),
        ("monthly", "Per Month"),
    ]

    STATUS_CHOICES = [
        ("new", "New"),
        ("reviewed", "Reviewed"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]

    name = models.CharField(max_length=120)
    email = models.EmailField()
    work_details = models.TextField(help_text="Describe the work / project requirements")
    proposed_rate = models.DecimalField(max_digits=10, decimal_places=2)
    rate_type = models.CharField(max_length=20, choices=RATE_TYPE_CHOICES, default="hourly")
    duration = models.CharField(max_length=120, help_text="e.g. 2 weeks, 1 month, ongoing")
    message = models.TextField(blank=True, help_text="Additional notes or context")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Hire Request"
        verbose_name_plural = "Hire Requests"

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.get_rate_type_display()}"
