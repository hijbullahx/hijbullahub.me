from django.db import models

from apps.core.models import TimeStampedModel


class Research(TimeStampedModel):
    STATUS_CHOICES = [
        ("planning", "Planning"),
        ("active", "Active"),
        ("published", "Published"),
    ]

    title = models.CharField(max_length=220)
    contributors = models.CharField(max_length=500, blank=True, help_text="Comma-separated list of contributors")
    abstract = models.TextField(blank=True)
    methodology = models.TextField(blank=True)
    technologies = models.TextField(blank=True)
    paper_link = models.URLField(blank=True)
    pdf_upload = models.FileField(upload_to="research/papers/", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="planning")
    future_scope = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if self.paper_link and not self.paper_link.startswith(("http://", "https://")):
            self.paper_link = f"https://{self.paper_link.strip()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ResearchContribution(TimeStampedModel):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]

    research = models.ForeignKey(Research, on_delete=models.CASCADE, related_name="contribution_requests")
    email = models.EmailField()
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Research Contribution Request"
        verbose_name_plural = "Research Contribution Requests"

    def __str__(self):
        return f"{self.email} - {self.research.title}"
