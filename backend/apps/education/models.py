from django.db import models
from apps.core.models import TimeStampedModel
from django.utils import timezone
import datetime

class Education(TimeStampedModel):
    INSTITUTION_TYPES = [
        ('board', 'Board'),
        ('university', 'University'),
        ('school', 'School'),
        ('madrasah', 'Madrasah'),
        ('college', 'College'),
    ]

    degree_name = models.CharField(max_length=255)
    institution_name = models.CharField(max_length=255)
    institution_type = models.CharField(max_length=20, choices=INSTITUTION_TYPES, default='university')
    
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(blank=True, null=True, help_text="Expected graduation date if current")
    
    result = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. GPA 5.0, CGPA 4.0")
    institution_logo = models.ImageField(upload_to="education/logos/", blank=True, null=True, help_text="Optional logo")
    certificate = models.FileField(upload_to="education/certificates/", blank=True, null=True, help_text="Certificate (PDF or Image)")
    is_current = models.BooleanField(default=False, help_text="Currently studying here")
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["display_order", "-end_date"]
        verbose_name_plural = "Education"

    def __str__(self):
        return f"{self.degree_name} at {self.institution_name}"

    def save(self, *args, **kwargs):
        if self.end_date and self.end_date < datetime.date.today():
             self.is_current = False
        super().save(*args, **kwargs)

    @property
    def passing_year(self):
        start_year = self.start_date.year if self.start_date else ""
        if self.is_current:
             end_year = self.end_date.year if self.end_date else "Present"
             if self.end_date:
                 return f"{start_year} - {end_year} (Expected)"
             return f"{start_year} - Present"
        
        if self.end_date:
            return f"{start_year} - {self.end_date.year}"
        return str(start_year)
