import logging
from django.db import models
from rest_framework import permissions, viewsets, status
from rest_framework.response import Response

from .models import Contact, ContactProfile, Feedback
from .serializers import ContactSerializer, ContactProfileSerializer, FeedbackSerializer

logger = logging.getLogger(__name__)


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class ContactProfileViewSet(viewsets.ModelViewSet):
    queryset = ContactProfile.objects.all()
    serializer_class = ContactProfileSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer
    pagination_class = None

    def get_queryset(self):
        # Public list shows only visible; admin sees all
        if self.request.user and self.request.user.is_staff:
            return Feedback.objects.all()
        return Feedback.objects.filter(is_visible=True)

    def get_permissions(self):
        if self.action in ["create", "list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        # Auto-assign display_order: new submissions go to the end
        max_order = Feedback.objects.aggregate(m=models.Max("display_order"))["m"] or 0
        serializer.save(display_order=max_order + 1)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            feedback_id = instance.pk
            self.perform_destroy(instance)
            logger.info("Feedback instance %s deleted by user %s", feedback_id, request.user)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception:
            logger.exception("Error deleting feedback instance %s", kwargs.get("pk"))
            return Response({"error": "Failed to delete feedback entry."}, status=status.HTTP_400_BAD_REQUEST)
            
    def perform_destroy(self, instance):
        instance.delete()

