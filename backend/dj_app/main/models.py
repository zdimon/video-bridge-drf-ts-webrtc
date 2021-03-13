from django.db import models
from django.utils.translation import gettext as _


class UserProfile(models.Model):
    login = models.CharField(max_length=80,unique=True, verbose_name=_('Name'))
    is_online = models.BooleanField(default=False)


class UserConnection(models.Model):
    sid = models.CharField(max_length=250,unique=True, verbose_name=_('SID'))
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)


class Sdp(models.Model):
    from_user = models.ForeignKey(UserProfile, 
                                  on_delete=models.CASCADE, 
                                  related_name='from_user',
                                  null= True,
                                  blank=True)
    from_user_sdp = models.TextField(verbose_name=_('Broadcast Offer'))

    to_user = models.ForeignKey(UserProfile, 
                                on_delete=models.CASCADE, 
                                related_name='to_user',
                                null=True,
                                blank=True)
    to_user_sdp = models.TextField(verbose_name=_('Recieve Offer'))

