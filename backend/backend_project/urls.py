"""
URL configuration for backend_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
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
from django.urls import path, include, re_path
from django.http import HttpResponse, HttpResponseNotFound
from django.conf import settings
import os
from rest_framework.authtoken.views import obtain_auth_token


def spa_index(request):
    """Serve the built SPA index.html (from backend/static/index.html).
    This allows the React app to be hosted under Django and supports client-side routing.
    """
    try:
        index_path = os.path.join(settings.BASE_DIR, 'static', 'index.html')
        with open(index_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        return HttpResponseNotFound('<h1>Index not found</h1><p>Build the frontend and place it in backend/static/</p>')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('api/', include('shop.urls')),

    # Serve SPA for root and any non-API routes (catch-all)
    path('', spa_index, name='spa-index'),
    re_path(r'^(?P<path>.*)/$', spa_index),
]
