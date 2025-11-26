from django.contrib import admin
from django.contrib.admin import AdminSite
from .forms import CustomAdminLoginForm

from .models import Product, Invoice, InvoiceItem, StockAdjustment, UserProfile

class CustomAdminSite(AdminSite):
    login_form = CustomAdminLoginForm
    site_header = "TradeTrack"
    site_title = "TradeTrack Admin Portal"
    index_title = "Welcome to TradeTrack Management"

# Replace default admin with your custom admin site
admin.site = CustomAdminSite()


# Register models for management convenience
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'sku', 'price', 'stock', 'created_at')


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_no', 'created_by', 'date', 'total', 'status')


@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'product', 'quantity', 'price', 'line_total')


@admin.register(StockAdjustment)
class StockAdjustmentAdmin(admin.ModelAdmin):
    list_display = ('product', 'change', 'reason', 'created_by', 'created_at')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'can_generate_invoice', 'can_view_reports')
    list_editable = ('can_generate_invoice', 'can_view_reports')
