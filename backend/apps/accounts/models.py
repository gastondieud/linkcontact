"""
accounts/models.py
Custom User model for LinkContact SaaS.
V1 Production Ready
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.text import slugify


class User(AbstractUser):
    """
    Custom User model:
    - Email comme identifiant principal
    - Chaque utilisateur peut avoir une Shop (OneToOne)
    """

    email = models.EmailField(unique=True)
    shop_name = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(unique=True, blank=True, null=True)
    whatsapp_number = models.CharField(max_length=20, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def save(self, *args, **kwargs):
        """
        Auto-generate slug if not provided.
        """
        if not self.slug and self.shop_name:
            base_slug = slugify(self.shop_name)
            slug = base_slug
            counter = 1

            # Ensure unique slug
            while User.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.email
