"""
Serializers for shops app.
"""
from rest_framework import serializers
from .models import Shop


class ShopMeSerializer(serializers.ModelSerializer):
    """GET /api/shops/me/ - shop_name, slug, description, whatsapp_number, logo."""
    # We use the native fields of the Shop model
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = Shop
        fields = ['id', 'name', 'slug', 'description', 'whatsapp_number', 'logo', 'first_name', 'last_name']


class ShopMeUpdateSerializer(serializers.ModelSerializer):
    """PUT /api/shops/me/ - update shop + user fields. multipart/form-data."""
    name = serializers.CharField(required=False)
    slug = serializers.SlugField(required=False)
    whatsapp_number = serializers.CharField(required=False)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Shop
        fields = ['description', 'logo', 'name', 'slug', 'whatsapp_number', 'first_name', 'last_name']

    def update(self, instance, validated_data):
        name = validated_data.pop('name', None)
        slug = validated_data.pop('slug', None)
        whatsapp = validated_data.pop('whatsapp_number', None)
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        
        # Update Shop basic fields (description, logo)
        for k, v in validated_data.items():
            setattr(instance, k, v)
            
        # Update Shop core fields
        if name is not None:
            instance.name = name
        if slug is not None:
            instance.slug = slug
        if whatsapp is not None:
            instance.whatsapp_number = whatsapp
        instance.save()
        
        # Keep User in sync
        u = instance.user
        if name is not None:
            u.shop_name = name
        if slug is not None:
            u.slug = slug
        if whatsapp is not None:
            u.whatsapp_number = whatsapp
        if first_name is not None:
            u.first_name = first_name
        if last_name is not None:
            u.last_name = last_name
        u.save()
        
        return instance


class ShopPublicSerializer(serializers.ModelSerializer):
    """GET /api/shops/{slug}/ - public shop info."""
    class Meta:
        model = Shop
        fields = ['id', 'name', 'description', 'slug', 'whatsapp_number', 'logo']
