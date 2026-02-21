from rest_framework import viewsets

from apps.core.permissions import IsAdminOrReadOnly

from .models import Project, ProjectImage, Tag
from .serializers import ProjectImageSerializer, ProjectSerializer, TagSerializer


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAdminOrReadOnly]


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.prefetch_related("tech_stack", "images").all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrReadOnly]


class ProjectImageViewSet(viewsets.ModelViewSet):
    queryset = ProjectImage.objects.select_related("project").all()
    serializer_class = ProjectImageSerializer
    permission_classes = [IsAdminOrReadOnly]
