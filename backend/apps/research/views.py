from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.permissions import IsAdminOrReadOnly

from .models import Research, ResearchContribution
from .serializers import ResearchSerializer, ResearchContributionSerializer


class ResearchViewSet(viewsets.ModelViewSet):
    queryset = Research.objects.all()
    serializer_class = ResearchSerializer
    permission_classes = [IsAdminOrReadOnly]


class ResearchContributionViewSet(viewsets.ModelViewSet):
    queryset = ResearchContribution.objects.all()
    serializer_class = ResearchContributionSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminOrReadOnly()]
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        contribution = self.get_object()
        contribution.is_read = True
        contribution.save()
        return Response({'status': 'marked as read'})
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        contribution = self.get_object()
        contribution.status = 'accepted'
        contribution.is_read = True
        contribution.save()
        return Response({'status': 'accepted'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        contribution = self.get_object()
        contribution.status = 'rejected'
        contribution.is_read = True
        contribution.save()
        return Response({'status': 'rejected'})
