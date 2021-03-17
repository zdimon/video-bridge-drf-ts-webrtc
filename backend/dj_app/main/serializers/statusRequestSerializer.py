from rest_framework import serializers

class StatusRequestSerializer(serializers.Serializer):
    status = serializers.CharField()
    sid = serializers.CharField()