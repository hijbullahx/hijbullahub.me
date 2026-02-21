from rest_framework import viewsets

from apps.core.permissions import IsAdminOrReadOnly

from .models import Hero
from .serializers import HeroSerializer


class HeroViewSet(viewsets.ModelViewSet):
    queryset = Hero.objects.all()
    serializer_class = HeroSerializer
    permission_classes = [IsAdminOrReadOnly]
