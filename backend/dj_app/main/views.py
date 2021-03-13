from django.shortcuts import render
from .serializers.callRequestSerializer import CallRequestSerializer
from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import UserProfile, UserConnection
from django.core.exceptions import ObjectDoesNotExist
from .tasks import call_task

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
            print(callee)
        except ObjectDoesNotExist:
            return Response({'status': 1, 'message': 'User does not connected!'})

        try:
            conn = UserConnection.objects.get(sid=data['sid'])
            caller = conn.user
            print(caller)
        except ObjectDoesNotExist:
            return Response({'status': 1, 'message': 'You are not connected!'})

        call_task.delay(caller.id, callee.id)
        return Response({'call': 'ok'})
