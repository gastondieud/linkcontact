"""
API URL routing - all under /api/
"""
from django.urls import path, include

urlpatterns = [
    path('', include('apps.accounts.urls')),
    path('', include('apps.shops.urls')),
    path('', include('apps.products.urls')),
    path('', include('apps.stats.urls')),
]
