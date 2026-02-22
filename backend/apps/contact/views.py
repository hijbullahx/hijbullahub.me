from rest_framework import permissions, viewsets

from .models import Contact, ContactProfile, Feedback
from .serializers import ContactSerializer, ContactProfileSerializer, FeedbackSerializer


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

    def get_queryset(self):
        # Public list shows only visible; admin sees all
        if self.request.user and self.request.user.is_staff:
            return Feedback.objects.all()
        return Feedback.objects.filter(is_visible=True)

    def get_permissions(self):
        if self.action in ["create", "list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
