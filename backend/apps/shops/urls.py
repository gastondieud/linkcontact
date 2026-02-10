from django.urls import path
from .views import ShopMeView, ShopBySlugView, ShopProductsBySlugView, CheckSlugView

urlpatterns = [
    path('shops/me/', ShopMeView.as_view()),
    path('shops/<slug:slug>/', ShopBySlugView.as_view()),
    path('shops/<slug:slug>/products/', ShopProductsBySlugView.as_view()),
    path('utils/check-slug/<slug:slug>/', CheckSlugView.as_view()),
]
