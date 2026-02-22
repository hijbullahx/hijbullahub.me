from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import HireRequest
from .serializers import HireRequestSerializer


class HireRequestViewSet(viewsets.ModelViewSet):
    queryset = HireRequest.objects.all()
    serializer_class = HireRequestSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        obj = self.get_object()
        obj.is_read = True
        obj.save()
        return Response({"status": "marked as read"})

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        obj = self.get_object()
        obj.status = "accepted"
        obj.is_read = True
        obj.save()
        return Response({"status": "accepted"})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        obj = self.get_object()
        obj.status = "rejected"
        obj.is_read = True
        obj.save()
        return Response({"status": "rejected"})

    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        obj = self.get_object()
        obj.status = "reviewed"
        obj.is_read = True
        obj.save()
        return Response({"status": "reviewed"})
