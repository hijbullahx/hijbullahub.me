from rest_framework import viewsets, permissions
from .models import Education
from .serializers import EducationSerializer

class EducationViewSet(viewsets.ModelViewSet):
    queryset = Education.objects.filter(is_active=True)
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
