from django.http import JsonResponse


def health_check(request):
    """
    Lightweight health check endpoint for uptime monitoring.
    Returns 200 OK with minimal processing.
    """
    return JsonResponse({"status": "ok"}, status=200)
