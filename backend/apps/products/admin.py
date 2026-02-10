from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'get_user_email', 'price', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'description', 'shop__user__email', 'shop__user__shop_name')
    ordering = ('-created_at',)

    def get_user_email(self, obj):
        try:
            return obj.shop.user.email
        except Exception:
            return None
    get_user_email.short_description = 'Utilisateur'
