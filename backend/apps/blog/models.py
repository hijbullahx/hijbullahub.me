from django.db import models
from django.utils.text import slugify

from apps.core.models import TimeStampedModel
from apps.projects.models import Tag


class Blog(TimeStampedModel):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    thumbnail = models.ImageField(upload_to="blog/thumbnails/", blank=True, null=True)
    content = models.TextField()
    tags = models.ManyToManyField(Tag, related_name="blog_posts", blank=True)
    category = models.CharField(max_length=80)
    read_time = models.PositiveIntegerField(default=5)
    seo_description = models.CharField(max_length=180, blank=True)
    is_published = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
