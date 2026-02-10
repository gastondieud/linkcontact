"""
Views for accounts app - JWT Auth.
"""
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import User
from .serializers import RegisterSerializer, UserMeSerializer, CustomTokenObtainPairSerializer


class RegisterView(APIView):
    """POST /api/auth/register/ - Create user and Shop."""
    permission_classes = [AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        user = ser.save()
        from apps.shops.models import Shop
        Shop.objects.get_or_create(user=user)
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserMeSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/ - Accept email or username."""
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'email' in data and 'username' not in data:
            data['username'] = data['email']
        request._full_data = data
        return super().post(request, *args, **kwargs)


class MeView(APIView):
    """GET /api/auth/me/ - Current user info."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserMeSerializer(request.user).data)
