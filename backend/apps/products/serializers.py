"""
Serializers for products app.
"""
import logging
from rest_framework import serializers
from .models import Product

logger = logging.getLogger(__name__)


class ProductSerializer(serializers.ModelSerializer):
    """CRUD - products for authenticated user. Image as full URL."""
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'image', 'created_at']
        read_only_fields = ['created_at']

    def get_image(self, obj):
        if obj.image:
            try:
                url = obj.image.url
                # Cloudinary URLs are usually absolute http/https
                if url.startswith('http'):
                    return url.strip()
                
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(url)
                return url
            except Exception as e:
                logger.error(f"Error getting image URL in ProductSerializer: {e}")
                return None
        return None


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """POST/PUT - multipart/form-data, image required on create."""
    class Meta:
        model = Product
        fields = ['name', 'description', 'price', 'image']

    def validate_image(self, value):
        if not value and not self.instance:
            raise serializers.ValidationError('L\'image est obligatoire pour un nouveau produit.')
        return value


class ProductPublicSerializer(serializers.ModelSerializer):
    """Public product list - full image URL."""
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'image']

    def get_image(self, obj):
        if obj.image:
            try:
                url = obj.image.url
                # Cloudinary URLs are usually absolute http/https
                if url.startswith('http'):
                    return url.strip()
                
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(url)
                return url
            except Exception as e:
                logger.error(f"Error getting image URL in ProductPublicSerializer: {e}")
                return None
        return None
