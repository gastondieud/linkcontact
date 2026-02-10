from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'shop_name', 'whatsapp_number', 'is_staff', 'is_superuser')
    search_fields = ('email', 'username', 'shop_name')
    ordering = ('email',)
    fieldsets = BaseUserAdmin.fieldsets + (
        ('LinkContact', {'fields': ('shop_name', 'slug', 'whatsapp_number')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('LinkContact', {'fields': ('shop_name', 'slug', 'whatsapp_number')}),
    )
