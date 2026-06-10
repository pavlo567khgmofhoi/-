import pandas as pd
import uuid
import random
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated

from .models import Author, Category, Book
from .serializers import AuthorSerializer, CategorySerializer, BookSerializer
from .permissions import IsAdminOrReadOnly
from .scraper import scrape_books_pages

AUTH_CONFIG = [JWTAuthentication]

class RegisterUserView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not username or not password:
            return Response({"detail": "Ім'я користувача та пароль обов'язкові."}, status=400)
        
        if User.objects.filter(username=username).exists():
            return Response({"detail": "Користувач з таким іменем вже існує."}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)
        return Response({"message": "Користувача успішно створено!"}, status=201)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = AUTH_CONFIG
    def get(self, request):
        return Response({"username": request.user.username, "email": request.user.email, "is_staff": request.user.is_staff})

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = AUTH_CONFIG
    def post(self, request):
        if not request.user.check_password(request.data.get("old_password")):
            return Response({"detail": "Неправильний старий пароль."}, status=400)
        request.user.set_password(request.data.get("new_password"))
        request.user.save()
        return Response({"message": "Пароль успішно змінено."}, status=200)

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_link = f"http://localhost:5173/reset-password/{uid}/{token}/"

            send_mail(
                subject='Відновлення пароля - Цифрова Бібліотека',
                message=f'Привіт! Перейдіть за цим посиланням, щоб змінити свій пароль: {reset_link}',
                from_email='admin@digitallibrary.com',
                recipient_list=[email],
                fail_silently=False,
            )
            
        return Response({"message": "Якщо такий email існує, ми відправили на нього інструкції."}, status=200)

class AuthorListCreateView(generics.ListCreateAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = AUTH_CONFIG

class AuthorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsAdminOrReadOnly]
    authentication_classes = AUTH_CONFIG

class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = AUTH_CONFIG

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    authentication_classes = AUTH_CONFIG

class BookListCreateView(generics.ListCreateAPIView):
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = AUTH_CONFIG

    def get_queryset(self):
        queryset = Book.objects.all().select_related('author', 'category').order_by('-id')
        genre_name = self.request.query_params.get('genre')
        search_title = self.request.query_params.get('search')
        year_from = self.request.query_params.get('year_from')
        year_to = self.request.query_params.get('year_to')

        if genre_name and genre_name != 'Усі жанри':
            queryset = queryset.filter(category__name__icontains=genre_name)
        if search_title:
            queryset = queryset.filter(title__icontains=search_title)
        if year_from and year_from.isdigit():
            queryset = queryset.filter(publication_date__year__gte=int(year_from))
        if year_to and year_to.isdigit():
            queryset = queryset.filter(publication_date__year__lte=int(year_to))
        return queryset

    def post(self, request, *args, **kwargs):
        try:
            title = request.data.get('title', 'Без назви')
            cat_name = request.data.get('category_name') or request.data.get('genre_name') or 'Загальне'
            auth_name = request.data.get('author_name') or 'Невідомий Автор'
            year = request.data.get('publication_year')

            parts = auth_name.strip().split(' ', 1)
            first = parts[0]
            last = parts[1] if len(parts) > 1 else ''

            cat, _ = Category.objects.get_or_create(name=cat_name)
            auth, _ = Author.objects.get_or_create(first_name=first, last_name=last)

            unique_isbn = str(random.randint(1000000000000, 9999999999999))

            book = Book.objects.create(
                title=title,
                category=cat,
                author=auth,
                publication_date=f"{year}-01-01" if year else "2024-01-01",
                isbn=unique_isbn
            )
            return Response(BookSerializer(book).data, status=201)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)

class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAdminOrReadOnly]
    authentication_classes = AUTH_CONFIG

    def update(self, request, *args, **kwargs):
        book = self.get_object()
        title = request.data.get('title')
        if title: book.title = title
        
        cat_name = request.data.get('category_name') or request.data.get('genre_name')
        if cat_name:
            cat, _ = Category.objects.get_or_create(name=cat_name)
            book.category = cat
            
        auth_name = request.data.get('author_name')
        if auth_name:
            parts = auth_name.strip().split(' ', 1)
            first = parts[0]
            last = parts[1] if len(parts) > 1 else ''
            auth, _ = Author.objects.get_or_create(first_name=first, last_name=last)
            book.author = auth
            
        year = request.data.get('publication_year')
        if year: book.publication_date = f"{year}-01-01"
            
        book.save()
        return Response(BookSerializer(book).data)

class ScrapeBooksView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    authentication_classes = AUTH_CONFIG

    def post(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({"detail": "Доступ заборонено."}, status=403)
        count = scrape_books_pages(max_pages=5)
        return Response({"message": f"Успішно! Зібрано книг: {count}"}, status=200)

class ExportBookExcelView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = AUTH_CONFIG

    def get(self, request, *args, **kwargs):
        queryset = Book.objects.all().select_related('author', 'category').order_by('-id')
        genre_name = request.query_params.get('genre')
        search_title = request.query_params.get('search')
        year_from = request.query_params.get('year_from')
        year_to = request.query_params.get('year_to')

        if genre_name and genre_name != 'Усі жанри':
            queryset = queryset.filter(category__name__icontains=genre_name)
        if search_title:
            queryset = queryset.filter(title__icontains=search_title)
        if year_from and year_from.isdigit():
            queryset = queryset.filter(publication_date__year__gte=int(year_from))
        if year_to and year_to.isdigit():
            queryset = queryset.filter(publication_date__year__lte=int(year_to))

        serializer = BookSerializer(queryset, many=True)
        data = []
        for b in serializer.data:
            data.append({
                'Назва книги': b.get('title', 'Без назви'),
                'Автор': b.get('author_name', '-'),
                'Жанр/Категорія': b.get('genre', '-'),
                'Рік видання': b.get('publication_year', '-')
            })

        if not data:
            data = [{'Назва книги': 'Немає даних', 'Автор': '-', 'Жанр/Категорія': '-', 'Рік видання': '-'}]

        df = pd.DataFrame(data)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=library_books.xlsx'
        with pd.ExcelWriter(response, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='Книги Бібліотеки')
        return response

class ClearDatabaseView(APIView):
    permission_classes = [permissions.IsAdminUser] # Тільки для адмінів!
    authentication_classes = AUTH_CONFIG

    def delete(self, request):
        Book.objects.all().delete()
        return Response({"message": "Базу даних успішно очищено!"}, status=200)