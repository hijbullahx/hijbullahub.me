from django.core.management.base import BaseCommand
from apps.core.email_utils import send_monthly_analytics_report_email


class Command(BaseCommand):
    help = "Compiles real database analytics from the last 30 days and sends an executive report to info@hijbullah.me"

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            type=str,
            help="Optional recipient email address (defaults to ADMIN_EMAIL / info@hijbullah.me)",
            default=None,
        )

    def handle(self, *args, **options):
        recipient = options.get("email")
        self.stdout.write(self.style.NOTICE("Compiling real monthly analytics telemetry..."))
        success = send_monthly_analytics_report_email(to_email=recipient)
        if success:
            self.stdout.write(self.style.SUCCESS(f"Successfully dispatched monthly analytics report to {recipient or 'admin'}."))
        else:
            self.stdout.write(self.style.ERROR("Failed to send monthly analytics report. Check email/SMTP logs."))
