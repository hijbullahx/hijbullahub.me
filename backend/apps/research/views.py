from rest_framework import viewsets

from apps.core.permissions import IsAdminOrReadOnly

from .models import Research
from .serializers import ResearchSerializer


class ResearchViewSet(viewsets.ModelViewSet):
    queryset = Research.objects.all()
    serializer_class = ResearchSerializer
    permission_classes = [IsAdminOrReadOnly]
