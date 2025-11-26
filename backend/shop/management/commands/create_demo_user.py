from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a demo normal user with invoice/report permissions'

    def handle(self, *args, **options):
        # create admin user
        admin_username = 'admin'
        admin_email = 'admin@tradetrack.com'
        admin_password = 'admin123'

        if not User.objects.filter(username=admin_username).exists():
            admin = User.objects.create_superuser(username=admin_username, email=admin_email, password=admin_password)
            self.stdout.write(self.style.SUCCESS(f'Created admin user {admin_username} / {admin_password}'))
        else:
            self.stdout.write(self.style.WARNING('Admin user already exists'))

        # create normal user who can generate invoices but not view reports
        username = 'user'
        email = 'user@tradetrack.com'
        password = 'user123'

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING('Demo normal user already exists'))
            return

        user = User.objects.create_user(username=username, email=email, password=password)
        # ensure profile exists and set flags
        profile = getattr(user, 'profile', None)
        if profile:
            profile.can_generate_invoice = True
            profile.can_view_reports = False
            profile.save()

        self.stdout.write(self.style.SUCCESS(f'Created demo normal user {username} / {password}'))
