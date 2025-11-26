# Generates sales analytics reports (JSON + CSV)
from datetime import date, timedelta
import json, csv, os
from decimal import Decimal
from django.db.models import Sum, Count

from shop.models import Invoice, InvoiceItem, Product


def dec_to_float(v):
    if v is None:
        return 0.0
    if isinstance(v, Decimal):
        return float(v)
    try:
        return float(v)
    except Exception:
        return v

report = {}

# Total sales and invoice counts
agg = Invoice.objects.aggregate(total_sales=Sum('total'), invoice_count=Count('id'))
report['total_sales'] = dec_to_float(agg.get('total_sales'))
report['invoice_count'] = agg.get('invoice_count') or 0

# Sales by product (sum of line_total)
products_qs = (
    InvoiceItem.objects
    .values('product__id', 'product__name')
    .annotate(total_quantity=Sum('quantity'), total_sales=Sum('line_total'))
    .order_by('-total_sales')
)
products = []
for p in products_qs:
    products.append({
        'product_id': p['product__id'],
        'product_name': p['product__name'],
        'total_quantity': int(p['total_quantity'] or 0),
        'total_sales': dec_to_float(p['total_sales'])
    })
report['sales_by_product'] = products

# Sales by user (who created the invoice)
users_qs = (
    Invoice.objects
    .values('created_by__id', 'created_by__username')
    .annotate(total_sales=Sum('total'), invoice_count=Count('id'))
    .order_by('-total_sales')
)
users = []
for u in users_qs:
    users.append({
        'user_id': u['created_by__id'],
        'username': u.get('created_by__username'),
        'total_sales': dec_to_float(u['total_sales']),
        'invoice_count': u['invoice_count']
    })
report['sales_by_user'] = users

# Top 10 products
report['top_products'] = products[:10]

# Monthly sales for last 12 months
months = []
today = date.today()
for i in range(11, -1, -1):
    # compute year and month for i months ago without external deps
    total_month = today.year * 12 + today.month - 1 - i
    y = total_month // 12
    m = total_month % 12 + 1
    s = Invoice.objects.filter(date__year=y, date__month=m).aggregate(sales=Sum('total'))['sales']
    months.append({'year': y, 'month': m, 'sales': dec_to_float(s)})
report['monthly_sales_last_12'] = months

# Daily sales for last 30 days
daily = []
for i in range(29, -1, -1):
    d = today - timedelta(days=i)
    s = Invoice.objects.filter(date__date=d).aggregate(sales=Sum('total'))['sales']
    daily.append({'date': d.isoformat(), 'sales': dec_to_float(s)})
report['daily_sales_last_30'] = daily

import sys

# Determine backend root directory reliably even when exec'd via manage.py shell
manage_py = sys.argv[0] if len(sys.argv) > 0 else None
if manage_py and os.path.basename(manage_py).startswith('manage.py'):
    base_dir = os.path.dirname(os.path.abspath(manage_py))
else:
    # fallback to current working dir's parent
    base_dir = os.path.abspath(os.path.join(os.getcwd(), '..'))
reports_dir = os.path.join(base_dir, 'reports')
os.makedirs(reports_dir, exist_ok=True)

# Write JSON report
json_path = os.path.join(reports_dir, 'sales_report.json')
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(report, f, indent=2)

# Write CSVs: sales_by_product, monthly_sales
csv_products = os.path.join(reports_dir, 'sales_by_product.csv')
with open(csv_products, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['product_id', 'product_name', 'total_quantity', 'total_sales'])
    for p in products:
        writer.writerow([p['product_id'], p['product_name'], p['total_quantity'], p['total_sales']])

csv_monthly = os.path.join(reports_dir, 'monthly_sales.csv')
with open(csv_monthly, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['year', 'month', 'sales'])
    for m in months:
        writer.writerow([m['year'], m['month'], m['sales']])

print(f'Reports written: {json_path}, {csv_products}, {csv_monthly}')
