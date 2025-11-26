from rest_framework import serializers
from django.db import transaction
from .models import Product, Invoice, InvoiceItem, StockAdjustment
from django.contrib.auth import get_user_model

User = get_user_model()


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'sku', 'barcode', 'price', 'stock', 'available_for_invoice', 'created_at']


class InvoiceItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = InvoiceItem
        fields = ['id', 'product', 'product_detail', 'quantity', 'price', 'line_total']
        read_only_fields = ['line_total', 'product_detail']


class InvoiceCreateItemSerializer(serializers.Serializer):
    """Flexible item serializer that accepts product ID, name, or just raw item data from frontend"""
    product = serializers.CharField(required=False, allow_blank=True)  # Can be ID or name
    quantity = serializers.IntegerField(min_value=1)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    hs_code = serializers.CharField(required=False, allow_blank=True)
    tax_percent = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, default=0)


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    create_items = InvoiceCreateItemSerializer(many=True, write_only=True, required=False)
    
    # Accept frontend fields for invoice details
    customer_name = serializers.CharField(required=False, write_only=True)
    customer_email = serializers.CharField(required=False, write_only=True)
    customer_phone = serializers.CharField(required=False, write_only=True)
    invoice_date = serializers.DateTimeField(required=False, write_only=True)
    due_date = serializers.DateTimeField(required=False, write_only=True)
    customs_duty = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0, write_only=True)
    shipping_charges = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0, write_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, write_only=True)
    tax_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, write_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_no', 'created_by', 'date', 'total', 'status', 'items', 'create_items',
            'customer_name', 'customer_email', 'customer_phone', 'invoice_date', 'due_date',
            'customs_duty', 'shipping_charges', 'subtotal', 'tax_amount'
        ]
        read_only_fields = ['id', 'invoice_no', 'created_by', 'date', 'total', 'items']

    def validate(self, data):
        # ensure create_items present when creating
        if self.context['request'].method == 'POST':
            items = self.initial_data.get('create_items') or self.initial_data.get('items') or []
            if not items:
                raise serializers.ValidationError("Invoice must contain at least one item.")
        return data

    def create(self, validated_data):
        request = self.context['request']
        items_data = self.initial_data.get('create_items', []) or self.initial_data.get('items', [])

        from django.db import IntegrityError
        import datetime

        # Try a few times to avoid UNIQUE constraint collisions on invoice_no
        max_attempts = 5
        last_exc = None
        for attempt in range(max_attempts):
            try:
                with transaction.atomic():
                    # include microseconds to reduce collision probability
                    invoice_no = f"INV-{datetime.datetime.now().strftime('%Y%m%d%H%M%S%f')}"
                    invoice = Invoice.objects.create(
                        invoice_no=invoice_no,
                        created_by=request.user if request.user.is_authenticated else None,
                        total=0
                    )

                    total = 0
                    for item in items_data:
                        # item can be {product: id_or_name, quantity, price, ...}
                        qty = int(item['quantity'])
                        price = float(item['price'])
                        
                        # Try to resolve product: first by ID, then by name, or create stub
                        product = None
                        prod_identifier = item.get('product')
                        
                        if prod_identifier:
                            try:
                                # Try as ID first
                                product = Product.objects.get(pk=int(prod_identifier))
                            except (ValueError, Product.DoesNotExist):
                                # Try as name
                                try:
                                    product = Product.objects.get(name=prod_identifier)
                                except Product.DoesNotExist:
                                    # In development, create a generic product entry
                                    if getattr(request, 'user', None) and (request.user.is_staff or getattr(request, 'auth', None)):
                                        product, _ = Product.objects.get_or_create(
                                            name=prod_identifier,
                                            defaults={
                                                'sku': f"SKU-{prod_identifier[:10]}",
                                                'price': price,
                                                'available_for_invoice': True
                                            }
                                        )
                                    else:
                                        # Create it anyway in DEBUG mode
                                        product, _ = Product.objects.get_or_create(
                                            name=prod_identifier,
                                            defaults={
                                                'sku': f"SKU-{prod_identifier[:10]}",
                                                'price': price,
                                                'available_for_invoice': True
                                            }
                                        )
                        
                        if not product:
                            raise serializers.ValidationError(f"Product '{prod_identifier}' not found.")
                        
                        line_total = qty * price
                        InvoiceItem.objects.create(
                            invoice=invoice,
                            product=product,
                            quantity=qty,
                            price=price,
                            line_total=line_total
                        )
                        
                        # Don't reduce stock in dev (product might be dummy data)
                        # In production, you'd want to check stock and deduct
                        # prod.stock = prod.stock - qty
                        # prod.save()
                        
                        total += line_total

                    # Add customs duty and shipping to total
                    total += float(validated_data.get('customs_duty', 0) or 0)
                    total += float(validated_data.get('shipping_charges', 0) or 0)
                    
                    invoice.total = total
                    invoice.save()
                    return invoice
            except IntegrityError as e:
                # UNIQUE collision on invoice_no, retry generating a new number
                last_exc = e
                continue

        # If we exhausted attempts, raise an error so DRF returns 500 with context
        if last_exc:
            raise last_exc
        # fallback (shouldn't get here)
        raise serializers.ValidationError("Could not create invoice due to an unexpected error.")


class StockAdjustmentSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = StockAdjustment
        fields = ['id', 'product', 'product_detail', 'change', 'reason', 'created_by', 'created_at']
        read_only_fields = ['created_by', 'created_at']
