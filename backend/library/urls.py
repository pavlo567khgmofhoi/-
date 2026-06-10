from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView # Імпортуємо стандартний логін та рефреш ТЗ
from .views import (
    AuthorListCreateView, AuthorDetailView,
    CategoryListCreateView, CategoryDetailView,
    BookListCreateView, BookDetailView,
    ScrapeBooksView, ExportBookExcelView,
    UserProfileView, ChangePasswordView, RegisterUserView,
    PasswordResetRequestView, # 🚀 Додано імпорт для відновлення пароля через MailHog
    ClearDatabaseView # 🚨 Додано імпорт для очищення бази даних
)

urlpatterns = [
    # --- Swagger ---
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # --- Автори та Жанри ---
    path('authors/', AuthorListCreateView.as_view(), name='author-list'),
    path('authors/<int:pk>/', AuthorDetailView.as_view(), name='author-detail'),
    path('categories/', CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    
    # --- Книги ---
    path('books/', BookListCreateView.as_view(), name='book-list'),
    path('books/<int:pk>/', BookDetailView.as_view(), name='book-detail'),
    
    # --- Системні фічі за ТЗ ---
    path('scrape/', ScrapeBooksView.as_view(), name='book-scrape'), # 🚀 ВИПРАВЛЕНО: books/scrape/ -> scrape/
    path('books/export/', ExportBookExcelView.as_view(), name='book-export'),
    path('books/clear/', ClearDatabaseView.as_view(), name='books-clear'), # 🚨 Додано ендпоінт для очищення бази
    
    # --- Користувачі та Безпека ---
    path('auth/login/', TokenObtainPairView.as_view(), name='login'), # Отримання токенів
    path('auth/register/', RegisterUserView.as_view(), name='register'), # Реєстрація нових користувачів
    path('users/profile/', UserProfileView.as_view(), name='user-profile'), # 🚀 ВИПРАВЛЕНО: auth/profile/ -> users/profile/
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # Додано ендпоінт рефрешу за ТЗ
    
    # 🚀 СКИДАННЯ ПАРОЛЯ (Генерація посилань та відправка через MailHog API)
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
]