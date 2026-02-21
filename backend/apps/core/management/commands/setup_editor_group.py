"""
Management command to create Editor group with specific permissions.

Usage:
    python manage.py setup_editor_group
"""

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Creates Editor group with permissions for blog, projects, and ai_lab"

    def handle(self, *args, **options):
        # Create or get the Editor group
        editor_group, created = Group.objects.get_or_create(name="Editor")
        
        if created:
            self.stdout.write(self.style.SUCCESS("Created Editor group"))
        else:
            self.stdout.write(self.style.WARNING("Editor group already exists, updating permissions..."))
        
        # Clear existing permissions
        editor_group.permissions.clear()
        
        # Define models that editors can manage
        editor_models = [
            ('projects', 'project'),
            ('projects', 'projectimage'),
            ('projects', 'tag'),
            ('blog', 'blog'),
            ('ai_lab', 'ailab'),
            ('research', 'research'),
            ('skills', 'skill'),
            ('experience', 'experience'),
            ('achievements', 'achievement'),
            ('contact', 'contact'),
        ]
        
        # Add permissions for each model
        permissions_added = 0
        for app_label, model_name in editor_models:
            try:
                content_type = ContentType.objects.get(app_label=app_label, model=model_name)
                
                # Get all permissions for this content type (add, change, delete, view)
                permissions = Permission.objects.filter(content_type=content_type)
                
                for permission in permissions:
                    editor_group.permissions.add(permission)
                    permissions_added += 1
                    self.stdout.write(
                        f"  Added: {permission.codename} for {app_label}.{model_name}"
                    )
            except ContentType.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f"  ContentType not found: {app_label}.{model_name}")
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f"\nSuccessfully configured Editor group with {permissions_added} permissions"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                "\nEditors can now manage:"
            )
        )
        self.stdout.write("  • Projects & Project Images")
        self.stdout.write("  • Blog Posts")
        self.stdout.write("  • AI Lab Experiments")
        self.stdout.write("  • Research Papers")
        self.stdout.write("  • Skills")
        self.stdout.write("  • Experience")
        self.stdout.write("  • Achievements")
        self.stdout.write("  • Contact Messages (read/respond)")
        self.stdout.write(
            self.style.SUCCESS(
                "\nEditors CANNOT manage:"
            )
        )
        self.stdout.write("  • Users & Authentication")
        self.stdout.write("  • Site Settings")
        self.stdout.write("  • Hero Section")
        self.stdout.write("  • About Section")
        self.stdout.write(
            self.style.WARNING(
                "\nTo assign users to this group:"
            )
        )
        self.stdout.write("  1. Go to Admin Panel → Users")
        self.stdout.write("  2. Edit a user")
        self.stdout.write("  3. Add them to the 'Editor' group")
