from django.urls import path
from .views import UserProfileView, ChangePasswordView, RequestPasswordResetEmail, SetNewPasswordAPIView

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('request-reset-email/', RequestPasswordResetEmail.as_view(), name='request-reset-email'),
    path('reset-password-confirm/<uidb64>/<token>/', SetNewPasswordAPIView.as_view(), name='reset-password-confirm'),
]