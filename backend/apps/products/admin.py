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

from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'name',
        'get_user_email',
        'price',
        'status',
        'is_active',
        'created_at'
    )

    list_filter = (
        'status',
        'is_active',
        'created_at'
    )

    search_fields = (
        'name',
        'description',
        'shop__user__email',
        'shop__user__shop_name'
    )

    ordering = ('-created_at',)

    list_editable = (
        'status',
        'is_active'
    )

    readonly_fields = (
        'created_at',
        'updated_at'
    )

    actions = [
        'make_published',
        'make_draft',
        'make_archived'
    ]

    def get_user_email(self, obj):
        try:
            return obj.shop.user.email
        except Exception:
            return None
    get_user_email.short_description = 'Utilisateur'

    # 🔥 Actions rapides SaaS
    def make_published(self, request, queryset):
        queryset.update(status='published')
    make_published.short_description = "Publier les produits sélectionnés"

    def make_draft(self, request, queryset):
        queryset.update(status='draft')
    make_draft.short_description = "Mettre en brouillon"

    def make_archived(self, request, queryset):
        queryset.update(status='archived')
    make_archived.short_description = "Archiver les produits"
