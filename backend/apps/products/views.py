"""
Views for products app - CRUD.
"""
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Product
from .serializers import ProductSerializer, ProductCreateUpdateSerializer, ProductPublicSerializer
from apps.shops.models import Shop


class ProductListCreateView(APIView):
    """GET /api/products/ - list. POST /api/products/ - create (multipart)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get current user's shop and list products for that shop
        shop = get_object_or_404(Shop, user=request.user)
        products = Product.objects.filter(shop=shop)
        return Response(ProductSerializer(products, many=True, context={'request': request}).data)

    def post(self, request):
        ser = ProductCreateUpdateSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        # Associate created product with the user's shop
        shop = get_object_or_404(Shop, user=request.user)
        ser.save(shop=shop)
        return Response(ProductSerializer(ser.instance, context={'request': request}).data, status=status.HTTP_201_CREATED)


class ProductDetailView(APIView):
    """GET /api/products/{id}/, PUT, DELETE."""
    permission_classes = [IsAuthenticated]

    def _get_product(self, request, pk):
        # Ensure product belongs to current user's shop
        return Product.objects.get(pk=pk, shop__user=request.user)

    def get(self, request, pk):
        try:
            product = self._get_product(request, pk)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(ProductSerializer(product, context={'request': request}).data)

    def put(self, request, pk):
        try:
            product = self._get_product(request, pk)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        ser = ProductCreateUpdateSerializer(product, data=request.data, partial=True)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        ser.save()
        return Response(ProductSerializer(ser.instance, context={'request': request}).data)

        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicProductListView(APIView):
    """GET /api/public/products/ - public list of all products."""
    permission_classes = []  # Public access

    def get(self, request):
        products = Product.objects.all().order_by('-created_at')
        return Response(ProductPublicSerializer(products, many=True, context={'request': request}).data)
