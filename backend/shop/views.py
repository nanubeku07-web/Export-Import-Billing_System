from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta

from .models import Product, Invoice, StockAdjustment
from .serializers import ProductSerializer, InvoiceSerializer, StockAdjustmentSerializer
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.http import HttpResponse
import csv

from django.contrib.auth import authenticate, get_user_model
from rest_framework.authtoken.models import Token


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow read-only to anyone; write only to staff/admin."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        # allow frontend to request only products available for invoice selection
        req = self.request
        if req and req.query_params.get('for_invoice') in ('1', 'true', 'True'):
            qs = qs.filter(available_for_invoice=True)
        return qs


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-date')
    serializer_class = InvoiceSerializer
    # Only authenticated users who are allowed to generate invoices (or staff) may create/view invoices
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        # In development allow unauthenticated POSTs so UI can demo invoice creation
        # Also allow unauthenticated GETs (safe methods) so the frontend preview works locally
        if settings.DEBUG and self.request:
            if self.request.method == 'POST':
                return [permissions.AllowAny()]
            if self.request.method in permissions.SAFE_METHODS:
                return [permissions.AllowAny()]
        return super().get_permissions()

    def has_generate_permission(self, user):
        # Staff can always generate
        if user.is_staff:
            return True
        # In development allow any user to generate for easier testing
        if getattr(settings, 'DEBUG', False):
            return True
        # Fallback to profile flags (profile created automatically)
        return getattr(user, 'profile', None) and user.profile.can_generate_invoice

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Invoice.objects.all().order_by('-date')
        return Invoice.objects.filter(created_by=user).order_by('-date')

    def perform_create(self, serializer):
        # enforce that only allowed users can create invoices
        user = self.request.user
        if not self.has_generate_permission(user):
            # In development allow invoice creation even for users without the flag
            if getattr(settings, 'DEBUG', False):
                serializer.save(created_by=user if user.is_authenticated else None)
                return
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to create invoices.")
        serializer.save(created_by=user)


class StockAdjustmentViewSet(viewsets.ModelViewSet):
    queryset = StockAdjustment.objects.all().order_by('-created_at')
    serializer_class = StockAdjustmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]


# Rich sales report endpoint
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def sales_report(request):
    """
    Returns detailed sales analytics. Query params:
      - start_date=YYYY-MM-DD (optional)
      - end_date=YYYY-MM-DD (optional)
    If no dates provided, defaults to last 30 days for daily, and last 12 months for monthly.
    Requires staff or profile.can_view_reports.
    """
    user = request.user
    # Determine whether user may view full-org reports
    allowed = user.is_staff or (getattr(user, 'profile', None) and user.profile.can_view_reports)

    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    # parse dates (simple YYYY-MM-DD)
    from datetime import datetime, date
    try:
        if start_date:
            sd = datetime.strptime(start_date, '%Y-%m-%d').date()
        else:
            sd = None
        if end_date:
            ed = datetime.strptime(end_date, '%Y-%m-%d').date()
        else:
            ed = None
    except Exception:
        return Response({'detail': 'Invalid date format, use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

    # If allowed, include all invoices; otherwise restrict to invoices created by this user
    if allowed:
        invoices = Invoice.objects.all()
    else:
        invoices = Invoice.objects.filter(created_by=user)

    if sd:
        invoices = invoices.filter(date__date__gte=sd)
    if ed:
        invoices = invoices.filter(date__date__lte=ed)

    # totals
    total_sales = invoices.aggregate(sum=Sum('total'))['sum'] or 0
    invoice_count = invoices.count()

    # sales by product
    from .models import InvoiceItem
    products_qs = (
        InvoiceItem.objects.filter(invoice__in=invoices)
        .values('product__id', 'product__name')
        .annotate(total_quantity=Sum('quantity'), total_sales=Sum('line_total'))
        .order_by('-total_sales')
    )
    sales_by_product = []
    for p in products_qs:
        sales_by_product.append({
            'product_id': p['product__id'],
            'product_name': p['product__name'],
            'total_quantity': int(p['total_quantity'] or 0),
            'total_sales': float(p['total_sales'] or 0)
        })

    # sales by user
    users_qs = (
        invoices
        .values('created_by__id', 'created_by__username')
        .annotate(total_sales=Sum('total'), invoice_count=Sum(1))
        .order_by('-total_sales')
    )
    sales_by_user = []
    for u in users_qs:
        sales_by_user.append({
            'user_id': u['created_by__id'],
            'username': u.get('created_by__username'),
            'total_sales': float(u['total_sales'] or 0),
            'invoice_count': int(u['invoice_count'] or 0)
        })

    # top products
    top_products = sales_by_product[:10]

    # monthly sales for last 12 months (relative to end_date or today)
    today = date.today() if ed is None else ed
    months = []
    for i in range(11, -1, -1):
        total_month = today.year * 12 + today.month - 1 - i
        y = total_month // 12
        m = total_month % 12 + 1
        s = Invoice.objects.filter(date__year=y, date__month=m)
        # if the caller provided a start/end, also apply those
        if sd:
            s = s.filter(date__date__gte=sd)
        if ed:
            s = s.filter(date__date__lte=ed)
        ssum = s.aggregate(sales=Sum('total'))['sales'] or 0
        months.append({'year': y, 'month': m, 'sales': float(ssum)})

    # daily sales for last 30 days
    daily = []
    from datetime import timedelta
    end_day = today
    for i in range(29, -1, -1):
        d = end_day - timedelta(days=i)
        dqs = Invoice.objects.filter(date__date=d)
        if sd:
            dqs = dqs.filter(date__date__gte=sd)
        if ed:
            dqs = dqs.filter(date__date__lte=ed)
        s = dqs.aggregate(sales=Sum('total'))['sales'] or 0
        daily.append({'date': d.isoformat(), 'sales': float(s)})

    return Response({
        'total_sales': float(total_sales),
        'invoice_count': invoice_count,
        'sales_by_product': sales_by_product,
        'sales_by_user': sales_by_user,
        'top_products': top_products,
        'monthly_sales_last_12': months,
        'daily_sales_last_30': daily,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def invoices_report(request):
    """Return a list of invoices (id, invoice_no, date, created_by, total, item_count).
    - staff users see all invoices
    - normal users see only their invoices
    Accepts optional `start_date` and `end_date` (YYYY-MM-DD)
    """
    user = request.user
    # permission: staff or profile.can_view_reports can view others; otherwise user can view their own
    from datetime import datetime
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    try:
        sd = datetime.strptime(start_date, '%Y-%m-%d').date() if start_date else None
        ed = datetime.strptime(end_date, '%Y-%m-%d').date() if end_date else None
    except Exception:
        return Response({'detail': 'Invalid date format, use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

    qs = Invoice.objects.all().order_by('-date') if user.is_staff or (getattr(user, 'profile', None) and user.profile.can_view_reports) else Invoice.objects.filter(created_by=user).order_by('-date')
    if sd:
        qs = qs.filter(date__date__gte=sd)
    if ed:
        qs = qs.filter(date__date__lte=ed)

    out = []
    for inv in qs.select_related('created_by').prefetch_related('items')[:200]:
        out.append({
            'id': inv.id,
            'invoice_no': inv.invoice_no,
            'date': inv.date.isoformat(),
            'created_by': inv.created_by.username if inv.created_by else None,
            'total': float(inv.total),
            'item_count': inv.items.count(),
        })

    return Response({'invoices': out, 'count': len(out)}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def sales_report_csv(request):
    """Return sales_by_product as CSV. Accepts same start_date/end_date params and same permission checks."""
    user = request.user
    allowed = user.is_staff or (getattr(user, 'profile', None) and user.profile.can_view_reports)
    if not allowed:
        return Response({'detail': 'You do not have permission to view reports.'}, status=status.HTTP_403_FORBIDDEN)

    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    # parse dates (simple YYYY-MM-DD)
    from datetime import datetime
    try:
        sd = datetime.strptime(start_date, '%Y-%m-%d').date() if start_date else None
        ed = datetime.strptime(end_date, '%Y-%m-%d').date() if end_date else None
    except Exception:
        return Response({'detail': 'Invalid date format, use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

    from .models import InvoiceItem, Invoice
    invoices = Invoice.objects.all()
    if sd:
        invoices = invoices.filter(date__date__gte=sd)
    if ed:
        invoices = invoices.filter(date__date__lte=ed)

    items_qs = (
        InvoiceItem.objects.filter(invoice__in=invoices)
        .values('product__id', 'product__name')
        .annotate(total_quantity=Sum('quantity'), total_sales=Sum('line_total'))
        .order_by('-total_sales')
    )

    # build CSV response
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="sales_by_product.csv"'
    writer = csv.writer(response)
    writer.writerow(['product_id', 'product_name', 'total_quantity', 'total_sales'])
    for p in items_qs:
        writer.writerow([p['product__id'], p['product__name'], int(p['total_quantity'] or 0), float(p['total_sales'] or 0)])

    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Return a small profile for the logged in user so frontend can tailor UI."""
    user = request.user
    profile = getattr(user, 'profile', None)
    return Response({
        'username': user.username,
        'is_staff': user.is_staff,
        'can_generate_invoice': bool(getattr(profile, 'can_generate_invoice', False)),
        'can_view_reports': bool(getattr(profile, 'can_view_reports', False)),
    }, status=status.HTTP_200_OK)
    


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def token_auth_by_email(request):
    """Accepts POST with 'email' and 'password' and returns a token if valid."""
    email = request.data.get('email') or request.POST.get('email')
    password = request.data.get('password') or request.POST.get('password')
    if not email or not password:
        return Response({'detail': 'Email and password required.'}, status=status.HTTP_400_BAD_REQUEST)

    User = get_user_model()
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=user.username, password=password)
    if user is None:
        return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key}, status=status.HTTP_200_OK)
