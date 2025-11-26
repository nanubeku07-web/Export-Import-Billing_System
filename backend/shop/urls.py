from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, InvoiceViewSet, StockAdjustmentViewSet, sales_report, sales_report_csv, invoices_report, me, token_auth_by_email

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'stock-adjustments', StockAdjustmentViewSet, basename='stockadjust')

urlpatterns = [
    path('', include(router.urls)),
    path('reports/sales/', sales_report, name='reports-sales'),
    path('reports/sales/csv/', sales_report_csv, name='reports-sales-csv'),
    path('reports/invoices/', invoices_report, name='reports-invoices'),
    path('me/', me, name='me'),
    path('token-auth-email/', token_auth_by_email, name='token-auth-email'),
]
