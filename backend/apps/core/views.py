from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Count
from django.db.models.functions import TruncDate, TruncHour
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
import datetime

from .models import PageVisit


def health_check(request):
    """
    Lightweight health check endpoint for uptime monitoring.
    Returns 200 OK with minimal processing.
    """
    return JsonResponse({"status": "ok"}, status=200)


@api_view(["POST"])
@permission_classes([AllowAny])
def record_visit(request):
    """Public endpoint — called by the frontend on each page load."""
    page = request.data.get("page", "home")[:80]
    referrer = request.data.get("referrer", "")[:255]
    PageVisit.objects.create(page=page, referrer=referrer)
    return Response({"ok": True}, status=201)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def analytics_summary(request):
    """Admin-only — aggregated visit statistics."""
    now = timezone.now()
    today = now.date()

    # Last 30 days date range
    days_30_ago = today - datetime.timedelta(days=29)
    days_7_ago  = today - datetime.timedelta(days=6)

    qs_30 = PageVisit.objects.filter(timestamp__date__gte=days_30_ago)
    qs_7  = PageVisit.objects.filter(timestamp__date__gte=days_7_ago)

    # Daily breakdown for last 30 days
    daily = (
        qs_30
        .annotate(date=TruncDate("timestamp"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("date")
    )
    # Fill gaps so every day in the range appears
    daily_map = {row["date"]: row["count"] for row in daily}
    daily_full = []
    for i in range(30):
        d = days_30_ago + datetime.timedelta(days=i)
        daily_full.append({"date": str(d), "visits": daily_map.get(d, 0)})

    # Top pages (all time)
    top_pages = (
        PageVisit.objects
        .values("page")
        .annotate(count=Count("id"))
        .order_by("-count")[:8]
    )

    # Hourly breakdown for today using TruncHour (works on all DBs)
    hourly_qs = (
        PageVisit.objects.filter(timestamp__date=today)
        .annotate(hour=TruncHour("timestamp"))
        .values("hour")
        .annotate(count=Count("id"))
    )
    hourly_map = {row["hour"].hour: row["count"] for row in hourly_qs if row["hour"]}
    hourly_full = [{"hour": f"{h:02d}:00", "visits": hourly_map.get(h, 0)} for h in range(24)]

    return Response({
        "total":          PageVisit.objects.count(),
        "today":          PageVisit.objects.filter(timestamp__date=today).count(),
        "last_7_days":    qs_7.count(),
        "last_30_days":   qs_30.count(),
        "daily_30":       daily_full,
        "hourly_today":   hourly_full,
        "top_pages":      list(top_pages),
    })
