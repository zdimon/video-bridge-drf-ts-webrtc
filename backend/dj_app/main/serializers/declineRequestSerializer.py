from rest_framework import serializers

class declineRequestSerializer(serializers.Serializer):
    reciever_login = serializers.CharField()
    sid = serializers.CharField()