from django.contrib import admin
from .models import Visit


@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    """
    Admin minimal pour le modèle Visit, sans colonnes personnalisées,
    pour éviter tout conflit de vérification (E108/E116).
    """

    list_display = ('id', 'action', 'created_at')
    list_filter = ('action',)
    date_hierarchy = 'created_at'
