from django import forms
from django.contrib.auth.forms import AuthenticationForm

class CustomAdminLoginForm(AuthenticationForm):
    error_messages = {
        'invalid_login': (
            "Incorrect email or password."
        ),
        'inactive': ("This account is inactive."),
    }
