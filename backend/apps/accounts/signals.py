from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.accounts.models import User
from apps.shops.models import Shop

@receiver(post_save, sender=User)
def create_user_shop(sender, instance, created, **kwargs):
    if created:
        Shop.objects.create(user=instance)
