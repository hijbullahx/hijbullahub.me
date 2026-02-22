from rest_framework import serializers

from .models import Research, ResearchContribution


class ResearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Research
        fields = "__all__"


class ResearchContributionSerializer(serializers.ModelSerializer):
    research_title = serializers.CharField(source='research.title', read_only=True)

    class Meta:
        model = ResearchContribution
        fields = ["id", "research", "research_title", "email", "message", "status", "is_read", "created_at", "updated_at"]
        read_only_fields = ["status", "is_read", "created_at", "updated_at"]
