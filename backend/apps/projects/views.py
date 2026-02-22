from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.permissions import IsAdminOrReadOnly

from .models import Project, ProjectImage, Tag, ProjectAcquisition
from .serializers import ProjectImageSerializer, ProjectSerializer, TagSerializer, ProjectAcquisitionSerializer


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


class ProjectAcquisitionViewSet(viewsets.ModelViewSet):
    queryset = ProjectAcquisition.objects.all()
    serializer_class = ProjectAcquisitionSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminOrReadOnly()]
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        acquisition = self.get_object()
        acquisition.is_read = True
        acquisition.save()
        return Response({'status': 'marked as read'})
    
    @action(detail=True, methods=['post'])
    def contact(self, request, pk=None):
        acquisition = self.get_object()
        acquisition.status = 'contacted'
        acquisition.is_read = True
        acquisition.save()
        return Response({'status': 'contacted'})
    
    @action(detail=True, methods=['post'])
    def negotiate(self, request, pk=None):
        acquisition = self.get_object()
        acquisition.status = 'in_negotiation'
        acquisition.is_read = True
        acquisition.save()
        return Response({'status': 'in negotiation'})
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        acquisition = self.get_object()
        acquisition.status = 'accepted'
        acquisition.is_read = True
        acquisition.save()
        return Response({'status': 'accepted'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        acquisition = self.get_object()
        acquisition.status = 'rejected'
        acquisition.is_read = True
        acquisition.save()
        return Response({'status': 'rejected'})
