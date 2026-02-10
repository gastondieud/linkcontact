"""
Views for stats app.
"""
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from .models import Visit
from django.shortcuts import get_object_or_404
from apps.shops.models import Shop


class VisitCreateView(APIView):
    """POST /api/stats/visit/ - track visit (public)."""
    permission_classes = [AllowAny]

    def post(self, request):
        shop_slug = request.data.get('shop_slug')
        action = request.data.get('action')
        if not shop_slug:
            return Response({'detail': 'shop_slug requis'}, status=status.HTTP_400_BAD_REQUEST)
        if not action:
            return Response({'detail': 'action requis'}, status=status.HTTP_400_BAD_REQUEST)
        if action == 'visit':
            action = 'view'
        if action not in ('view', 'whatsapp_click'):
            return Response({'detail': 'action doit être view ou whatsapp_click'}, status=status.HTTP_400_BAD_REQUEST)
        if not User.objects.filter(slug=shop_slug).exists():
            return Response({'detail': 'Boutique introuvable'}, status=status.HTTP_404_NOT_FOUND)
        # Resolve Shop and create Visit using FK
        user = User.objects.get(slug=shop_slug)
        shop = get_object_or_404(Shop, user=user)
        Visit.objects.create(shop=shop, action=action)
        return Response({'success': True}, status=status.HTTP_201_CREATED)


class StatsMeView(APIView):
    """
    GET /api/stats/me/ - stats for current user's shop.
    Format Recharts: [{ date: "YYYY-MM-DD", visits: number, whatsapp: number }]
    + total_visits, total_products, visits_by_day with count (frontend compatibility)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            slug = request.user.slug
        except AttributeError:
            return Response({'detail': 'Aucune boutique associée'}, status=status.HTTP_400_BAD_REQUEST)
        if not slug:
            return Response({
                'total_visits': 0,
                'total_products': 0,
                'visits_by_day': [],
                'chart_data': [],
            })

        # Use FK relation to Shop (shop__slug) instead of non-existent shop_slug field
        visits = Visit.objects.filter(shop__slug=slug)
        total_visits = visits.count()

        by_date = (
            Visit.objects.filter(shop__slug=slug)
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(
                view_count=Count('id', filter=Q(action='view')),
                wa_count=Count('id', filter=Q(action='whatsapp_click')),
            )
            .order_by('day')
        )

        chart_data = [
            {
                'date': str(row['day']),
                'visits': row['view_count'],
                'whatsapp': row['wa_count'],
                'count': row['view_count'] + row['wa_count'],
            }
            for row in by_date
        ]

        visits_by_day = [
            {'date': str(r['day']), 'count': r['view_count'] + r['wa_count']}
            for r in by_date
        ]

        # Count products via the user's Shop
        try:
            shop = Shop.objects.get(user=request.user)
            total_products = shop.products.count()
        except Shop.DoesNotExist:
            total_products = 0

        return Response({
            'total_visits': total_visits,
            'total_products': total_products,
            'visits_by_day': visits_by_day,
            'chart_data': chart_data,
        })
