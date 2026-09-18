import io
import os
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect
from django.utils import timezone
from django.db.models import Count
from django.db.models.functions import TruncDate, TruncHour
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
import datetime
from PIL import Image, ImageDraw

from .models import PageVisit
from apps.hero.models import Hero


def round_favicon_view(request):
    """
    Generates and returns a crisp circular PNG favicon (with transparent background)
    from the active Hero profile image.
    Caches the generated circular image in MEDIA_ROOT for high performance.
    """
    hero = Hero.objects.filter(is_active=True).first()
    if not hero or not hero.profile_image:
        return redirect(f"{settings.STATIC_URL}images/favicon.svg")

    timestamp = int(hero.updated_at.timestamp()) if hero.updated_at else 1
    cache_dir = os.path.join(settings.MEDIA_ROOT, "favicons")
    os.makedirs(cache_dir, exist_ok=True)
    cache_file = os.path.join(cache_dir, f"favicon_{hero.id}_{timestamp}.png")

    if os.path.exists(cache_file):
        try:
            with open(cache_file, "rb") as f:
                content = f.read()
            response = HttpResponse(content, content_type="image/png")
            response["Cache-Control"] = "public, max-age=86400"
            return response
        except Exception:
            pass

    try:
        source_path = hero.profile_image.path
        if not os.path.exists(source_path):
            return redirect(hero.profile_image.url)

        with Image.open(source_path) as img:
            img = img.convert("RGBA")
            # Center crop to 1:1 square
            size = min(img.size)
            left = (img.width - size) // 2
            top = (img.height - size) // 2
            img = img.crop((left, top, left + size, top + size))

            # 192x192 high-res favicon
            fav_size = 192
            img = img.resize((fav_size, fav_size), Image.Resampling.LANCZOS)

            # Circular mask with 4x antialiased supersampling
            scale = 4
            mask = Image.new("L", (fav_size * scale, fav_size * scale), 0)
            draw = ImageDraw.Draw(mask)
            draw.ellipse((0, 0, fav_size * scale, fav_size * scale), fill=255)
            mask = mask.resize((fav_size, fav_size), Image.Resampling.LANCZOS)

            img.putalpha(mask)

            # Save to disk cache
            img.save(cache_file, format="PNG", optimize=True)

            buffer = io.BytesIO()
            img.save(buffer, format="PNG", optimize=True)
            content = buffer.getvalue()

        response = HttpResponse(content, content_type="image/png")
        response["Cache-Control"] = "public, max-age=86400"
        return response
    except Exception:
        return redirect(hero.profile_image.url)



def health_check(request):
    """
    Lightweight health check endpoint for uptime monitoring.
    Returns 200 OK with minimal processing.
    """
    return JsonResponse({"status": "ok"}, status=200)


import urllib.request
import json
from django.core.cache import cache


def get_client_ip(request):
    """Extract client IP from proxy/Cloudflare headers or remote address."""
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR", "")
    return ip


def resolve_ip_location(ip, request=None):
    """
    Zero-prompt, privacy-preserving location resolution.
    Never prompts or requests browser GPS permissions.
    """
    if not ip or ip in ("127.0.0.1", "::1", "localhost") or ip.startswith(("192.168.", "10.", "172.16.", "172.31.")):
        return "Local / Direct", "Local"

    # 1. Cloudflare country header (instant 0ms lookup on cPanel / Cloudflare deployments)
    if request:
        cf_country = request.META.get("HTTP_CF_IPCOUNTRY")
        if cf_country and cf_country != "XX":
            return cf_country, ""

    # 2. In-memory cache lookup
    cache_key = f"geoip_{ip}"
    cached = cache.get(cache_key)
    if cached:
        return cached.get("country", "Unknown"), cached.get("city", "")

    # 3. Fast non-intrusive server-side lookup with 1.2s timeout
    try:
        url = f"http://ip-api.com/json/{ip}?fields=status,country,city"
        req = urllib.request.Request(url, headers={"User-Agent": "HijbullahHub-Analytics/1.0"})
        with urllib.request.urlopen(req, timeout=1.2) as response:
            data = json.loads(response.read().decode("utf-8"))
            if data.get("status") == "success":
                country = data.get("country", "Unknown")
                city = data.get("city", "")
                cache.set(cache_key, {"country": country, "city": city}, timeout=86400 * 7)
                return country, city
    except Exception:
        pass

    return "Unknown", ""


@api_view(["POST"])
@permission_classes([AllowAny])
def record_visit(request):
    """Public endpoint — called silently in background on page load."""
    page = request.data.get("page", "home")[:80]
    referrer = request.data.get("referrer", "")[:255]
    ip = get_client_ip(request)
    country, city = resolve_ip_location(ip, request)

    PageVisit.objects.create(
        page=page,
        referrer=referrer,
        ip_address=ip[:45],
        country=country[:100],
        city=city[:100]
    )
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
