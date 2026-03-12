from django.contrib import admin
from .models import Education

@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    # list_display can show properties, so passing_year here is fine
    list_display = ('degree_name', 'institution_name', 'institution_type', 'passing_year', 'result', 'display_order', 'is_active')
    list_filter = ('institution_type', 'is_active', 'is_current')
    search_fields = ('degree_name', 'institution_name')
    ordering = ('display_order', '-end_date')
    fields = (
        'degree_name',
        'institution_name',
        'institution_type',
        'start_date',
        'end_date',
        'is_current',
        'result',
        'institution_logo',
        'display_order',
        'is_active',
    )
