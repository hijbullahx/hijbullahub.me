from rest_framework import viewsets

from apps.core.permissions import IsAdminOrReadOnly

from .models import Achievement
from .serializers import AchievementSerializer


class AchievementViewSet(viewsets.ModelViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [IsAdminOrReadOnly]
