from rest_framework import permissions, viewsets

from .models import Contact, ContactProfile
from .serializers import ContactSerializer, ContactProfileSerializer


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
