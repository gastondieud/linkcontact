"""
Product model for LinkContact.
V1 Production Ready - SaaS Architecture
"""

from django.db import models
from django.utils.text import slugify


def product_image_path(instance, filename):
    return f'products/{instance.shop.id}/{filename}'


class Product(models.Model):
    """
    Product published inside a Shop.
    """

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]

    shop = models.ForeignKey(
        'shops.Shop',
        on_delete=models.CASCADE,
        related_name='products'
    )

    name = models.CharField(max_length=255)

    slug = models.SlugField(
        max_length=255,
        unique=True,
        blank=True
    )

    description = models.TextField()

    price = models.DecimalField(
        max_digits=14,
        decimal_places=2
    )

    image = models.ImageField(
        upload_to=product_image_path,
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='draft'
    )

    is_active = models.BooleanField(default=True)

    views_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]

    def save(self, *args, **kwargs):
        """
        Auto generate unique slug.
        """
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1

            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - Shop {self.shop_id}"
