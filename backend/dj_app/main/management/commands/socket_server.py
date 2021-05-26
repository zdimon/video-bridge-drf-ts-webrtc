from django.core.management.base import BaseCommand
import socketio
import eventlet
from django.core.exceptions import ObjectDoesNotExist
import threading
from main.models import UserProfile, UserConnection

eventlet.monkey_patch()
mgr = socketio.RedisManager('redis://localhost:6379/0')
sio = socketio.Server(cors_allowed_origins='*',async_mode='eventlet',client_manager=mgr)
app = socketio.WSGIApp(sio)


def add_user_task(sid,data):
    try:
        user = UserProfile.objects.get(login=data['login'])
    except ObjectDoesNotExist:
        print('No user')
        user = UserProfile()
        user.login = data['login']
        user.save()
    con = UserConnection()
    con.user = user
    con.sid = sid
    con.save()
    UserConnection.check_online(user)


def remove_connection_task(sid):
    try:
        con = UserConnection.objects.get(sid=sid)
        user = con.user
        con.delete()
    except ObjectDoesNotExist:
        pass

    if UserConnection.objects.filter(user=user).count() == 0:
        user.delete()
        


@sio.event
def connect(sid, environ):
    print('connect ', sid)


@sio.event
def disconnect(sid):
    print('disconnect ', sid)
    thread = threading.Thread(target=remove_connection_task, args=(sid,))
    thread.start()

@sio.event
def login(sid, data):
    print('login ', data)
    thread = threading.Thread(target=add_user_task, args=(sid,data))
    thread.start()


class Command(BaseCommand):

    def handle(self, *args, **options):
        print('Statrting socket server')
        eventlet.wsgi.server(eventlet.listen(('', 5001)), app)