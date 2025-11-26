from shop.models import Product
imports = [
    ('Neo Monitor X1','NM-101',12999,8),
    ('Ultra Keyboard','UK-102',1999,21),
    ('Flux Router','FR-103',6999,4),
    ('PixelPhone Z','PPZ-104',54999,12),
    ('Samsung Monitor','SM-201',12000,12),
    ('HP Keyboard','HPK-202',900,30),
    ('Apple iPhone 15','IP15-203',79999,8),
]
created = []
for name, sku, price, stock in imports:
    if not Product.objects.filter(sku=sku).exists():
        p = Product.objects.create(name=name, sku=sku, price=price, stock=stock, available_for_invoice=True)
        created.append({'id': p.id, 'name': p.name})
    else:
        Product.objects.filter(sku=sku).update(name=name, price=price, stock=stock, available_for_invoice=True)

print('CREATED_OR_UPDATED', created)
print('TOTAL_PRODUCTS', Product.objects.count())
