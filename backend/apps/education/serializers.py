from rest_framework import serializers
from .models import Education

class EducationSerializer(serializers.ModelSerializer):
    institution_logo_url = serializers.SerializerMethodField()
    passing_year = serializers.ReadOnlyField()

    class Meta:
        model = Education
        fields = "__all__"

    def get_institution_logo_url(self, obj):
        if obj.institution_logo:
            try:
                url = obj.institution_logo.url
                if url.startswith("http"):
                    return url
                
                request = self.context.get("request")
                if request:
                    return request.build_absolute_uri(url)
                return url
            except ValueError:
                return None
        return None
