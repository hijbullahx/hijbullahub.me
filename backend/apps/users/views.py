from rest_framework import viewsets

from apps.core.permissions import IsAdminOrReadOnly

from .models import UserProfile
from .serializers import UserProfileSerializer


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.select_related("user").all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminOrReadOnly]
