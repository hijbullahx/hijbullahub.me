from rest_framework import viewsets

from apps.core.permissions import IsAdminOrReadOnly

from .models import About
from .serializers import AboutSerializer


class AboutViewSet(viewsets.ModelViewSet):
    queryset = About.objects.all()
    serializer_class = AboutSerializer
    permission_classes = [IsAdminOrReadOnly]
