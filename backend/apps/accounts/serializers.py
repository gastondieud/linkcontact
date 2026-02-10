"""
Serializers for accounts app.
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import User


def slugify_shop_name(name):
    """Generate slug from shop name."""
    import re
    from unicodedata import normalize
    s = normalize('NFKD', name).encode('ascii', 'ignore').decode('ascii')
    s = re.sub(r'[^\w\s-]', '', s).strip().lower()
    s = re.sub(r'[-\s]+', '-', s)
    return s[:50] if s else 'shop'


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Accept email instead of username for login (frontend compatibility)."""

    def validate(self, attrs):
        email = attrs.get('email') or attrs.get('username')
        password = attrs.get('password')
        if not email or not password:
            raise serializers.ValidationError('Email et mot de passe requis.')
        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password,
        )
        if not user:
            raise serializers.ValidationError('Identifiants incorrects.')
        refresh = self.get_token(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }


class RegisterSerializer(serializers.ModelSerializer):
    """Register new user and create Shop. Accepts both spec and frontend formats."""
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password',
            'first_name', 'last_name',
            'shop_name', 'slug', 'whatsapp_number'
        ]
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': True},
            'slug': {'required': False},
            'whatsapp_number': {'required': False},
            'shop_name': {'required': True},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Un compte existe déjà avec cet email.')
        return value

    def validate_slug(self, value):
        if value and User.objects.filter(slug=value).exists():
            raise serializers.ValidationError('Ce slug est déjà utilisé.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data.get('email')
        username = validated_data.get('username') or email
        shop_name = validated_data.get('shop_name', '')
        slug = validated_data.get('slug') or slugify_shop_name(shop_name)
        # Ensure slug uniqueness
        base_slug = slug
        counter = 1
        while User.objects.filter(slug=slug).exists():
            slug = f'{base_slug}-{counter}'
            counter += 1
        validated_data['username'] = username
        validated_data['slug'] = slug
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserMeSerializer(serializers.ModelSerializer):
    """Response for GET /api/auth/me/ - frontend expects id, email, first_name, last_name."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'shop_name', 'slug', 'whatsapp_number']
