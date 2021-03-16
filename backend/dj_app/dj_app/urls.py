"""dj_app URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from main.views import sender, reciever

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from main.views import CallView, OfferView, IceView

schema_view = get_schema_view(
    openapi.Info(
        title="API",
        default_version='v1',
        description=''' Documentation
        The `ReDoc` view can be found [here](/doc).
        ''',
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="zdimon77@gmail.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('sender', sender),
    path('reciever', reciever),
    path('admin/', admin.site.urls),

    path('call', CallView.as_view()),
    path('offer', OfferView.as_view()),
    path('ice', IceView.as_view()),


    path('', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('doc', schema_view.with_ui('redoc', cache_timeout=0), name='schema-doc'),
]
