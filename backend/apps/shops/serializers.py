"""
Serializers for shops app.
"""
from rest_framework import serializers
from .models import Shop


class ShopMeSerializer(serializers.ModelSerializer):
    """GET /api/shops/me/ - shop_name, slug, description, whatsapp_number, logo."""
    # We use the native fields of the Shop model
    class Meta:
        model = Shop
        fields = ['id', 'name', 'slug', 'description', 'whatsapp_number', 'logo']


class ShopMeUpdateSerializer(serializers.ModelSerializer):
    """PUT /api/shops/me/ - update shop + user fields. multipart/form-data."""
    name = serializers.CharField(required=False)
    slug = serializers.SlugField(required=False)
    whatsapp_number = serializers.CharField(required=False)

    class Meta:
        model = Shop
        fields = ['description', 'logo', 'name', 'slug', 'whatsapp_number']

    def update(self, instance, validated_data):
        name = validated_data.pop('name', None)
        slug = validated_data.pop('slug', None)
        whatsapp = validated_data.pop('whatsapp_number', None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        u = instance.user
        if name is not None:
            u.shop_name = name
        if slug is not None:
            u.slug = slug
        if whatsapp is not None:
            u.whatsapp_number = whatsapp
        u.save()
        return instance


class ShopPublicSerializer(serializers.ModelSerializer):
    """GET /api/shops/{slug}/ - public shop info."""
    class Meta:
        model = Shop
        fields = ['id', 'name', 'description', 'slug', 'whatsapp_number', 'logo']
