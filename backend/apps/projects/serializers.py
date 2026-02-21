from rest_framework import serializers

from .models import Project, ProjectImage, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "__all__"


class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = "__all__"


class ProjectSerializer(serializers.ModelSerializer):
    images = ProjectImageSerializer(many=True, read_only=True)
    tech_stack = TagSerializer(many=True, read_only=True)
    tech_stack_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        source="tech_stack",
        queryset=Tag.objects.all(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "slug",
            "short_description",
            "full_description",
            "problem_statement",
            "architecture_overview",
            "tech_stack",
            "tech_stack_ids",
            "github_link",
            "live_link",
            "demo_video_url",
            "research_direction",
            "status",
            "featured",
            "display_order",
            "images",
            "created_at",
            "updated_at",
        ]
