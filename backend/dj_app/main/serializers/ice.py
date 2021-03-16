from rest_framework import serializers


class IceRequestSerializer(serializers.Serializer):
    sid = serializers.CharField()
    ice = serializers.CharField()