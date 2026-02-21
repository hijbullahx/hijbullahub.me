from rest_framework import viewsets

from apps.core.permissions import IsAdminOrReadOnly

from .models import AILab
from .serializers import AILabSerializer


class AILabViewSet(viewsets.ModelViewSet):
    queryset = AILab.objects.all()
    serializer_class = AILabSerializer
    permission_classes = [IsAdminOrReadOnly]
