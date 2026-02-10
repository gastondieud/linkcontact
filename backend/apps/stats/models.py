"""
Visit model for LinkContact statistics.
Production Ready V1
"""
from django.db import models
from django.conf import settings


class Visit(models.Model):
    """
    Tracks shop interactions for analytics.
    """

    ACTION_VIEW = 'view'
    ACTION_WHATSAPP = 'whatsapp_click'

    ACTION_CHOICES = [
        (ACTION_VIEW, 'Vue page'),
        (ACTION_WHATSAPP, 'Clic WhatsApp'),
    ]

    shop = models.ForeignKey(
        'shops.Shop',
        on_delete=models.CASCADE,
        related_name='visits',
    )

    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES,
        db_index=True
    )

    ip_address = models.GenericIPAddressField(
        blank=True,
        null=True
    )

    user_agent = models.TextField(
        blank=True,
        null=True
    )

    referrer = models.URLField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
        models.Index(fields=['shop', 'action', 'created_at']),
    ]


    def __str__(self):
        return f"{self.shop.slug} - {self.action} @ {self.created_at}"
