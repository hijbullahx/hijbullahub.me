from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from apps.core.views import health_check, record_visit, analytics_summary

urlpatterns = [
    path("health/", health_check, name="health_check"),
    path("admin/", admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/", include("config.api_router")),
    path("api/analytics/visit/", record_visit, name="record_visit"),
    path("api/analytics/summary/", analytics_summary, name="analytics_summary"),
]

# Serve media files in all environments (including production)
# Note: For production, consider using Cloudinary/S3 for persistent storage
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
