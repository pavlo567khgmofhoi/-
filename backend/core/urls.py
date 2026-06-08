from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 🔐 Ендпоінти аутентифікації
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # 📚 Підключаємо маршрути бібліотеки та користувачів
    # Зверни увагу: тут вже є 'api/', тому в library.urls має бути просто 'books/'
    path('api/', include('library.urls')), 
    path('api/', include('users.urls')),
]