"""
Views for shops app.
"""
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from .models import Shop
from .serializers import ShopMeSerializer, ShopMeUpdateSerializer, ShopPublicSerializer


class ShopMeView(APIView):
    """GET /api/shops/me/ - current user's shop."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Ensure a Shop exists for the user; create one if missing.
        shop, created = Shop.objects.get_or_create(
            user=request.user,
            defaults={'name': request.user.shop_name or request.user.username}
        )
        return Response(ShopMeSerializer(shop).data)

    def put(self, request):
        shop, created = Shop.objects.get_or_create(
            user=request.user,
            defaults={'name': request.user.shop_name or request.user.username}
        )
        ser = ShopMeUpdateSerializer(shop, data=request.data, partial=True)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        shop = ser.save()
        return Response(ShopMeSerializer(shop).data)


class ShopBySlugView(APIView):
    """GET /api/shops/{slug}/ - public shop by slug."""
    permission_classes = [AllowAny]

    def get(self, request, slug):
        user = get_object_or_404(User, slug=slug)
        shop = get_object_or_404(Shop, user=user)
        return Response(ShopPublicSerializer(shop).data)


class ShopProductsBySlugView(APIView):
    """GET /api/shops/{slug}/products/ - public products."""
    permission_classes = [AllowAny]

    def get(self, request, slug):
        from apps.products.models import Product
        from apps.products.serializers import ProductPublicSerializer
        user = get_object_or_404(User, slug=slug)
        products = Product.objects.filter(shop__user=user).order_by('-created_at')
        return Response(ProductPublicSerializer(products, many=True, context={'request': request}).data)


class CheckSlugView(APIView):
    """GET /api/utils/check-slug/{slug}/ - check if slug available (frontend ShopSettings)."""
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        exists = User.objects.filter(slug=slug).exclude(pk=request.user.pk).exists()
        return Response({'available': not exists})
