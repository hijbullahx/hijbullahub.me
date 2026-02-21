from rest_framework import viewsets

from apps.core.permissions import IsAdminOrReadOnly

from .models import Blog
from .serializers import BlogSerializer


class BlogViewSet(viewsets.ModelViewSet):
    queryset = Blog.objects.prefetch_related("tags").all()
    serializer_class = BlogSerializer
    permission_classes = [IsAdminOrReadOnly]
