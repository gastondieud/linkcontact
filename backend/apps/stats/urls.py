from django.urls import path
from .views import VisitCreateView, StatsMeView

urlpatterns = [
    path('stats/visit/', VisitCreateView.as_view()),
    path('stats/me/', StatsMeView.as_view()),
]
