from rest_framework import serializers

class RefreshRequestSerializer(serializers.Serializer):
    login = serializers.CharField()