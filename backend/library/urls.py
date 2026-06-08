from django.urls import path
from .views import (
    AuthorListCreateView, AuthorDetailView,
    CategoryListCreateView, CategoryDetailView,
    BookListCreateView, BookDetailView,
    ScrapeBooksView, ExportBookExcelView,
    UserProfileView, ChangePasswordView  # Нові в'юшки профілю
)

urlpatterns = [
    # Автори
    path('authors/', AuthorListCreateView.as_view(), name='author-list'),
    path('authors/<int:pk>/', AuthorDetailView.as_view(), name='author-detail'),
    
    # Категорії (Жанри)
    path('categories/', CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    
    # Книги
    path('books/', BookListCreateView.as_view(), name='book-list'),
    path('books/<int:pk>/', BookDetailView.as_view(), name='book-detail'),
    
    # Робочі ендпоінти для ТЗ (Частина 3)
    path('books/scrape/', ScrapeBooksView.as_view(), name='book-scrape'),
    path('books/export/', ExportBookExcelView.as_view(), name='book-export'),
    
    # Користувач та безпека (Частина 1)
    path('auth/profile/', UserProfileView.as_view(), name='user-profile'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
]