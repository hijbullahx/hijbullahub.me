from rest_framework import serializers

from .models import HireRequest


class HireRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = HireRequest
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "status", "is_read"]
