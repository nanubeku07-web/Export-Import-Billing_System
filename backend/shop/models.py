from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


# Simple profile to store extra permissions for users without customizing AUTH_USER_MODEL
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    can_generate_invoice = models.BooleanField(default=False)
    can_view_reports = models.BooleanField(default=False)

    def __str__(self):
        return f"Profile: {self.user.username}"


# create profile automatically when a user is created
from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if getattr(instance, 'profile', None):
        instance.profile.save()

# ✅ Product model
class Product(models.Model):
    name = models.CharField(max_length=100)
    sku = models.CharField(max_length=50, unique=True)
    barcode = models.CharField(max_length=100, blank=True, null=True)
    hs_code = models.CharField(max_length=20, blank=True, null=True, help_text="Harmonized System Code for international trade")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    # Whether this product should be shown in the invoice product selector
    available_for_invoice = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ✅ Invoice model
class Invoice(models.Model):
    invoice_no = models.CharField(max_length=100, unique=True, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, default="PAID")

    def __str__(self):
        return self.invoice_no or "No Invoice No"


# ✅ InvoiceItem model  
class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


# ✅ StockAdjustment model (the missing one)
class StockAdjustment(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    change = models.IntegerField(help_text="Positive for stock add, negative for stock reduce")
    reason = models.CharField(max_length=200, blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} ({self.change})"
