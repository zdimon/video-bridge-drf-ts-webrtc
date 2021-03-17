from django.shortcuts import render
from .serializers.callRequestSerializer import CallRequestSerializer
from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import UserProfile, UserConnection
from django.core.exceptions import ObjectDoesNotExist
from .tasks import call_task, sender_offer_task, sender_answer_task, send_ice_task, decline_task
from .serializers.offer import OfferRequestSerializer
from .serializers.ice import IceRequestSerializer
from .serializers.declineRequestSerializer import declineRequestSerializer
from .serializers.statusRequestSerializer import StatusRequestSerializer
from .models import Sdp

import json

# Create your views here.
def sender(request):
    return render(request,'sender.html')

def reciever(request):
    return render(request,'reciever.html')




class CallView(APIView):
    """
        Call request.

    """
    permission_classes = (AllowAny,)

    @swagger_auto_schema(
        request_body=CallRequestSerializer
    )
    def post(self, request, format=None):
        data = json.loads(request.body)

        try:
            callee = UserProfile.objects.get(login=data['login'])
            if(callee.status=='beasy'):
                return Response({'status': 1, 'message': 'User is beasy now!'})
        except ObjectDoesNotExist:
            return Response({'status': 1, 'message': 'User is not connected!'})

        try:
            conn = UserConnection.objects.get(sid=data['sid'])
            caller = conn.user
            print(caller)
        except ObjectDoesNotExist:
            return Response({'status': 1, 'message': 'You are not connected!'})

        call_task.delay(caller.id, callee.id)
        return Response({'status': 0, 'message': 'We are calling...'})


class OfferView(APIView):
    """
        Get offer from abonent after click Show cam button.

    """
    permission_classes = (AllowAny,)

    @swagger_auto_schema(
        request_body=OfferRequestSerializer
    )
    def post(self, request, format=None):
        payload = request.data
        conn = UserConnection.objects.get(sid=payload['sid'])

        # найдем существующее Sdp или создадим новое
        if payload['type'] == 'sender':
            try:
                offer = Sdp.objects.get(from_user=conn.user)
            except ObjectDoesNotExist:
                offer = Sdp()
        else:
            # если запрашивает принимающий значит Offer уже должен быть 100%
            try:
                offer = Sdp.objects.get(to_user=conn.user)
            except ObjectDoesNotExist:
                Response({'status': 1, 'message': f'Sdp does not exist!'})

        # устанавливаем Offer для передающего и уведомляем принимающую сторону
        if payload['type'] == 'sender':
            # найдем принимающего по переданному логину
            try:
                reciever = UserProfile.objects.get(login=payload['reciever_login'])
            except ObjectDoesNotExist:
                Response({'status': 1, 'message': f'Reciever does not exist!'})

            offer.from_user = conn.user
            offer.from_user_sdp = payload['offer']
            offer.to_user = reciever
            # уведомляем принимающую сторону через задачу для celery
            sender_offer_task(conn.user.id, reciever.id, payload['offer'])
        # устанавливаем Offer для принимающего
        else:
            offer.to_user = conn.user
            offer.to_user_sdp = payload['answer']
            sender_answer_task(offer.from_user.id, payload['answer'])
        offer.save()
        return Response({'offer': 'ok'})
        


class IceView(APIView):
    """
        Get ice candidates.

    """
    permission_classes = (AllowAny,)

    @swagger_auto_schema(
        request_body=IceRequestSerializer
    )
    def post(self, request, format=None):
        payload = request.data
        # поищем соединение
        try:
            conn = UserConnection.objects.get(sid=payload['sid'])
        except ObjectDoesNotExist:
            return Response({'status': 1, 'message': 'Connection does not exist!'})

        # поищем SDP для передающей стороны
        try:
            sdp = Sdp.objects.get(from_user=conn.user)
            send_ice_task(sdp.to_user.id, payload['ice'])
        except ObjectDoesNotExist:
            print('Sdp for sender not found')

        # поищем SDP для принимающей стороны
        try:
            sdp = Sdp.objects.get(to_user=conn.user)
            send_ice_task(sdp.from_user.id, payload['ice'])
        except ObjectDoesNotExist:
            print('Sdp for reciever not found')

        # print(sdp)

        return Response({'ice': payload})

class DeclineView(APIView):
    """
        Decline the call.

    """
    permission_classes = (AllowAny,)

    @swagger_auto_schema(
        request_body=declineRequestSerializer
    )
    def post(self, request, format=None):
        payload = request.data
        try:
            reciever = UserProfile.objects.get(login=payload['reciever_login'])
            print(reciever)
            decline_task.delay(reciever.id)
        except ObjectDoesNotExist:
            return Response({'status': 1, 'message': 'User is not connected!'})
        return Response({'message': 'ok'})

class StatusView(APIView):
    """
        Set status.

    """
    permission_classes = (AllowAny,)

    @swagger_auto_schema(
        request_body=StatusRequestSerializer
    )
    def post(self, request, format=None):
        payload = request.data
        try:
            conn = UserConnection.objects.get(sid=payload['sid'])
            reciever = conn.user
            reciever.status = payload['status']
            reciever.save()
        except ObjectDoesNotExist:
            return Response({'status': 1, 'message': 'Connection does not exist!'})

        return Response({'message': 'ok'})