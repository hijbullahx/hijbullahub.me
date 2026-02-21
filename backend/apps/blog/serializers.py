from rest_framework import serializers

from apps.projects.models import Tag
from apps.projects.serializers import TagSerializer

from .models import Blog


class BlogSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        source="tags",
        queryset=Tag.objects.all(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Blog
        fields = [
            "id",
            "title",
            "slug",
            "thumbnail",
            "content",
            "tags",
            "tag_ids",
            "category",
            "read_time",
            "seo_description",
            "is_published",
            "featured",
            "created_at",
            "updated_at",
        ]
