from rest_framework import viewsets

from apps.core.permissions import IsAdminOrReadOnly

from .models import SiteSetting
from .serializers import SiteSettingSerializer


class SiteSettingViewSet(viewsets.ModelViewSet):
    queryset = SiteSetting.objects.all()
    serializer_class = SiteSettingSerializer
    permission_classes = [IsAdminOrReadOnly]
