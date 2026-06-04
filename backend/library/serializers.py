from rest_framework import serializers
from .models import Author, Category, Book

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class BookSerializer(serializers.ModelSerializer):
    # Додаємо красиве відображення автора та категорії
    author_details = AuthorSerializer(source='author', read_only=True)
    category_details = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'category', 
            'author_details', 'category_details', 
            'description', 'publication_date', 'isbn'
        ]