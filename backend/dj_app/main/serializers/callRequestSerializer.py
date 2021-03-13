from rest_framework import serializers

class CallRequestSerializer(serializers.Serializer):
    login = serializers.CharField()
    sid = serializers.CharField()