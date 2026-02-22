from rest_framework import serializers

from .models import SiteSetting


class SiteSettingSerializer(serializers.ModelSerializer):
    click_sound_url = serializers.SerializerMethodField()
    empty_click_sound_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteSetting
        fields = "__all__"

    def get_click_sound_url(self, obj):
        if obj.click_sound:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.click_sound.url)
            return obj.click_sound.url
        return None

    def get_empty_click_sound_url(self, obj):
        if obj.empty_click_sound:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.empty_click_sound.url)
            return obj.empty_click_sound.url
        return None
