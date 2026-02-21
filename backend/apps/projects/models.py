from django.db import models
from django.utils.text import slugify

from apps.core.models import TimeStampedModel


class Tag(TimeStampedModel):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=70, unique=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Project(TimeStampedModel):
    STATUS_CHOICES = [
        ("ongoing", "Ongoing"),
        ("completed", "Completed"),
        ("research", "Research"),
    ]

    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    short_description = models.CharField(max_length=300, blank=True)
    full_description = models.TextField(blank=True)
    problem_statement = models.TextField(blank=True)
    architecture_overview = models.TextField(blank=True)
    tech_stack = models.ManyToManyField(Tag, related_name="projects", blank=True)
    github_link = models.URLField(blank=True)
    live_link = models.URLField(blank=True)
    demo_video_url = models.URLField(blank=True)
    research_direction = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ongoing")
    featured = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    featured_image = models.ImageField(upload_to="projects/featured/", blank=True, null=True)

    class Meta:
        ordering = ["display_order", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ProjectImage(TimeStampedModel):
    project = models.ForeignKey(Project, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="projects/images/")
    caption = models.CharField(max_length=220, blank=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.project.title} image"
