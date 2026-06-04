import pandas as pd
from django.http import HttpResponse
from rest_framework import mixins, generics
from rest_framework.views import APIView
from rest_framework.response import Response
# Імпортуємо два типи автентифікації
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Author, Category, Book
from .serializers import AuthorSerializer, CategorySerializer, BookSerializer
from .permissions import IsAdminOrReadOnly
from .scraper import scrape_books_pages

# Масив з налаштуваннями входу, який ми додамо в кожен клас
AUTH_CONFIG = [SessionAuthentication, JWTAuthentication]


# --- АВТОРИ ---
class AuthorListCreateView(mixins.ListModelMixin, mixins.CreateModelMixin, generics.GenericAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsAdminOrReadOnly]
    authentication_classes = AUTH_CONFIG # <--- Дозволяємо вхід через браузер/JWT

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

class AuthorDetailView(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, mixins.DestroyModelMixin, generics.GenericAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsAdminOrReadOnly]
    authentication_classes = AUTH_CONFIG

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


# --- КАТЕГОРІЇ ---
class CategoryListCreateView(mixins.ListModelMixin, mixins.CreateModelMixin, generics.GenericAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    authentication_classes = AUTH_CONFIG

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

class CategoryDetailView(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, mixins.DestroyModelMixin, generics.GenericAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    authentication_classes = AUTH_CONFIG

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


# --- КНИГИ ---
class BookListCreateView(mixins.ListModelMixin, mixins.CreateModelMixin, generics.GenericAPIView):
    serializer_class = BookSerializer
    permission_classes = [IsAdminOrReadOnly]
    authentication_classes = AUTH_CONFIG

    def get_queryset(self):
        queryset = Book.objects.all()
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
            
        search_title = self.request.query_params.get('search')
        if search_title:
            queryset = queryset.filter(title__icontains=search_title)
            
        year_from = self.request.query_params.get('year_from')
        year_to = self.request.query_params.get('year_to')
        if year_from:
            queryset = queryset.filter(publication_date__year__gte=year_from)
        if year_to:
            queryset = queryset.filter(publication_date__year__lte=year_to)
            
        return queryset

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

class BookDetailView(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, mixins.DestroyModelMixin, generics.GenericAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAdminOrReadOnly]
    authentication_classes = AUTH_CONFIG

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


# --- 🤖 РУЧНИЙ ЗАПУСК ПАРСЕРА ---
class ScrapeBooksView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    authentication_classes = AUTH_CONFIG

    def post(self, request, *args, **kwargs):
        if not request.user or not request.user.is_staff:
            return Response({"detail": "Доступ дозволено лише адміністратору системи."}, status=403)
        
        try:
            count = scrape_books_pages(max_pages=8)
            return Response({
                "status": "success",
                "message": f"Парсинг завершено! Успішно оброблено/оновлено книг: {count}"
            }, status=200)
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=500)


# --- 📊 ЕКСПОРТ В EXCEL ---
class ExportBookExcelView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    authentication_classes = AUTH_CONFIG

    def get(self, request, *args, **kwargs):
        queryset = Book.objects.all()
        
        category_id = request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
            
        search_title = request.query_params.get('search')
        if search_title:
            queryset = queryset.filter(title__icontains=search_title)
            
        year_from = request.query_params.get('year_from')
        year_to = request.query_params.get('year_to')
        if year_from:
            queryset = queryset.filter(publication_date__year__gte=year_from)
        if year_to:
            queryset = queryset.filter(publication_date__year__lte=year_to)
            
        author_id = request.query_params.get('author')
        if author_id:
            queryset = queryset.filter(author_id=author_id)

        data = []
        for book in queryset:
            data.append({
                'ID': book.id,
                'Назва книги': book.title,
                'Автор': f"{book.author.first_name} {book.author.last_name}" if book.author else "Невідомо",
                'Категорія': book.category.name if book.category else "Без категорії",
                'Опис': book.description or "Немає опису",
                'Дата публікації': book.publication_date.strftime('%Y-%m-%d') if book.publication_date else "Не вказано",
                'ISBN': book.isbn
            })

        df = pd.DataFrame(data)

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=library_books.xlsx'

        with pd.ExcelWriter(response, engine='xlsxwriter') as writer:
            df.to_excel(writer, sheet_name='Каталог Книг', index=False)

        return response