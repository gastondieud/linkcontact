from django.contrib import admin
from .models import Shop

@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_user_email', 'get_shop_name', 'get_slug', 'description')
    search_fields = ('user__email', 'user__shop_name', 'user__username')
    ordering = ('id',)

    # Méthode pour récupérer l'email de l'utilisateur
    def get_user_email(self, obj):
        return obj.user.email
    get_user_email.short_description = 'Email utilisateur'

    # Méthode pour récupérer le nom de la boutique
    def get_shop_name(self, obj):
        return obj.user.shop_name
    get_shop_name.short_description = 'Nom boutique'

    # Méthode pour récupérer le slug
    def get_slug(self, obj):
        return obj.user.slug
    get_slug.short_description = 'Slug'
