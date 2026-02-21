from rest_framework import serializers

from .models import AILab


class AILabSerializer(serializers.ModelSerializer):
    class Meta:
        model = AILab
        fields = "__all__"
