from rest_framework import serializers

from .models import Project, ProjectImage, Tag, ProjectAcquisition


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "__all__"


class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = "__all__"
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        # Build absolute URI for image field
        if instance.image and request:
            data['image'] = request.build_absolute_uri(instance.image.url)
        
        return data


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
            "featured_image",
            "images",
            "created_at",
            "updated_at",
        ]
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        # Build absolute URIs for image fields if they exist
        if instance.featured_image and request:
            data['featured_image'] = request.build_absolute_uri(instance.featured_image.url)
            data['thumbnail'] = request.build_absolute_uri(instance.featured_image.url)
        else:
            data['thumbnail'] = data.get('featured_image')
        
        return data


class ProjectAcquisitionSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = ProjectAcquisition
        fields = ["id", "project", "project_title", "email", "phone", "message", "status", "is_read", "created_at", "updated_at"]
        read_only_fields = ["status", "is_read", "created_at", "updated_at"]
