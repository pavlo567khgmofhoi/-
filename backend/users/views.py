from rest_framework import mixins, generics, permissions, status
from rest_framework.views import APIView  # <--- Додали цей імпорт
from rest_framework.response import Response
from django.contrib.auth import get_user_model

# Додаємо підтримку сесій та токенів
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication

# Інструменти для скидання пароля
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import smart_bytes, smart_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail

from .serializers import UserSerializer, ChangePasswordSerializer, ResetPasswordEmailRequestSerializer

User = get_user_model()
AUTH_CONFIG = [SessionAuthentication, JWTAuthentication]

# --- ПЕРЕГЛЯД ПРОФІЛЮ ---
class UserProfileView(mixins.RetrieveModelMixin, generics.GenericAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated] 
    authentication_classes = AUTH_CONFIG

    def get_object(self):
        return self.request.user

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

# --- ЗМІНА ПАРОЛЯ ЧЕРЕЗ API ---
class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = AUTH_CONFIG

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": ["Невірний поточний пароль."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"status": "success", "message": "Пароль успішно оновлено!"}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- ЗАПИТ НА СКИДАННЯ ПАРОЛЯ ---
class RequestPasswordResetEmail(generics.GenericAPIView):
    serializer_class = ResetPasswordEmailRequestSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        if User.objects.filter(email=email).exists():
            user = User.objects.filter(email=email).first()
            
            uidb64 = urlsafe_base64_encode(smart_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)
            
            reset_link = f"http://127.0.0.1:8000/api/users/reset-password-confirm/{uidb64}/{token}/"
            
            send_mail(
                'Скидання пароля на сайті Library',
                f'Привіт! Щоб скинути пароль, перейди за цим безпечним посиланням:\n{reset_link}',
                'admin@library.com',
                [user.email],
                fail_silently=False,
            )
        
        return Response({'success': 'Якщо ця пошта є в базі, ми відправили на неї посилання для скидання пароля.'}, status=status.HTTP_200_OK)

# --- ПІДТВЕРДЖЕННЯ ТА ВСТАНОВЛЕННЯ НОВОГО ПАРОЛЯ ---
class SetNewPasswordAPIView(APIView): # <--- Замінили GenericAPIView на звичайний APIView
    def get(self, request, uidb64, token):
        return Response({'message': 'Введіть новий пароль у форматі JSON (поле new_password) та відправте POST запит.'}, status=status.HTTP_200_OK)

    def post(self, request, uidb64, token):
        try:
            id = smart_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=id)
            
            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response({'error': 'Посилання недійсне або застаріло'}, status=status.HTTP_401_UNAUTHORIZED)
            
            new_password = request.data.get('new_password')
            if not new_password:
                return Response({'error': 'Введіть новий пароль'}, status=status.HTTP_400_BAD_REQUEST)
                
            user.set_password(new_password)
            user.save()
            return Response({'success': 'Пароль успішно змінено!'}, status=status.HTTP_200_OK)
            
        except Exception:
            return Response({'error': 'Сталася помилка з посиланням'}, status=status.HTTP_400_BAD_REQUEST)