from rest_framework import serializers

from .models import Contact, ContactProfile, Feedback


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = "__all__"


class ContactProfileSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = ContactProfile
        fields = "__all__"

    def get_profile_image_url(self, obj):
        if obj.profile_image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]
