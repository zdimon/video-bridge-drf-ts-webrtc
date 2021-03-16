from rest_framework import serializers


class OfferRequestSerializer(serializers.Serializer):
    sid = serializers.CharField()
    type = serializers.CharField()
    offer = serializers.CharField()
    reciever_login = serializers.CharField()