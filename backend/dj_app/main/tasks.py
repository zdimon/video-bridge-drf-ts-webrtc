from celery.decorators import task
import socketio   
from django.conf import settings
from .models import UserConnection, UserProfile
mgr = socketio.RedisManager(f'redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0')


@task()
def call_task(caller_id,callee_id):
    print('----Calling----- %s to %s' % (caller_id,callee_id))
    caller = UserProfile.objects.get(pk=caller_id)
    callee = UserProfile.objects.get(pk=callee_id)
    for con in UserConnection.objects.filter(user=callee):
        payload = {"login": caller.login}
        mgr.emit('calling', data=payload, room=con.sid)


@task()
def sender_offer_task(sender_id, reciever_id, sender_offer):
    reciever = UserProfile.objects.get(pk=reciever_id)
    sender = UserProfile.objects.get(pk=sender_id)
    # Находим все соединения по принимающей стороне
    for conn in UserConnection.objects.filter(user=reciever):
        # отсылаем сообщения на сокет
        payload = {"sender_login": sender.login,
                    "sender_offer": sender_offer}
        mgr.emit('sender_offer', data=payload, room=conn.sid)


@task()
def decline_task(abonent_id):
    reciever = UserProfile.objects.get(pk=abonent_id)
    # Находим все соединения по принимающей стороне
    for conn in UserConnection.objects.filter(user=reciever):
        # отсылаем сообщения на сокет
        payload = {"decline": "no"}
        mgr.emit('decline', data=payload, room=conn.sid)


@task()
def sender_answer_task(sender_id, reciever_answer):
    sender = UserProfile.objects.get(pk=sender_id)
    # Находим все соединения по принимающей стороне
    for conn in UserConnection.objects.filter(user=sender):
        # отсылаем сообщения на сокет
        payload = {"reciever_answer": reciever_answer}
        mgr.emit('reciever_answer', data=payload, room=conn.sid)


@task()
def send_ice_task(user_id, ice):
    sender = UserProfile.objects.get(pk=user_id)
    # Находим все соединения цели
    for conn in UserConnection.objects.filter(user=sender):
        # отсылаем сообщения на сокет
        payload = {"ice": ice}
        mgr.emit('ice_candidate', data=payload, room=conn.sid)

        
@task()
def send_refresh_task(user_id):
    target = UserProfile.objects.get(pk=user_id)
    # Находим все соединения цели
    for conn in UserConnection.objects.filter(user=target):
        # отсылаем сообщения на сокет
        payload = {"refresh": 'gogo'}
        mgr.emit('refresh', data=payload, room=conn.sid)