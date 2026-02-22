from rest_framework import serializers

from .models import Experience


class ExperienceSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Experience
        fields = "__all__"

    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None
