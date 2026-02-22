from rest_framework import serializers

from .models import Achievement


class AchievementSerializer(serializers.ModelSerializer):
    badge_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = "__all__"

    def get_badge_image_url(self, obj):
        if obj.badge_image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.badge_image.url)
            return obj.badge_image.url
        return None
