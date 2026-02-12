from django.urls import path
from .views import ProductListCreateView, ProductDetailView, PublicProductListView

urlpatterns = [
    path('products/', ProductListCreateView.as_view()),
    path('products/<int:pk>/', ProductDetailView.as_view()),
    path('public/products/', PublicProductListView.as_view()),
]
