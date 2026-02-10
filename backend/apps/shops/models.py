"""
Shop model for LinkContact.
V1 Production Ready
"""
from django.db import models
from django.conf import settings
from django.utils.text import slugify

from django.core.validators import RegexValidator

phone_validator = RegexValidator(
    regex=r'^\d{8,15}$',
    message="Numéro WhatsApp invalide. Utilise uniquement des chiffres."
)

def shop_logo_path(instance, filename):
    return f'shops/logos/{instance.user_id}/{filename}'



class Shop(models.Model):
    """
    Public shop profile linked to a seller account.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shop',
    )

    name = models.CharField(max_length=255)

    slug = models.SlugField(unique=True, blank=True)

    description = models.TextField(blank=True)

    logo = models.ImageField(
        upload_to=shop_logo_path,
        blank=True,
        null=True
    )
    whatsapp_number = models.CharField(
    max_length=20,
    blank=True,
    validators=[phone_validator],
    db_index=True,
    help_text="Numéro WhatsApp international ex: 22890000000"
)

    is_active = models.BooleanField(default=True)

    views_count = models.PositiveIntegerField(default=0)

    # Autoriser les valeurs nulles pour éviter d'imposer un default
    # lors de l'ajout sur des lignes existantes.
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['created_at']),
        ]

    def save(self, *args, **kwargs):
        """
        Auto-generate slug if missing.
        """
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1

            while Shop.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
