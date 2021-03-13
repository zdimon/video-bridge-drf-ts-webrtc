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
        