"""Backfill invoices with null created_by to a default user.
If a username 'user' exists, use that; otherwise skip.
"""
from django.contrib.auth import get_user_model
from shop.models import Invoice

User = get_user_model()
try:
    default = User.objects.filter(username='user').first()
    if default is None:
        print('No user with username "user" found. Skipping backfill.')
    else:
        updated = Invoice.objects.filter(created_by__isnull=True).update(created_by=default)
        print(f'Updated {updated} invoices to created_by={default.username} (id={default.id})')
except Exception as e:
    print('Error during backfill:', e)
