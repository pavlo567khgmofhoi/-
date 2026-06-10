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
    class Meta:
        model = Book
        fields = '__all__'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        
        # Відрізаємо технічні коди парсера, щоб в інтерфейсі все було чисто і красиво
        title = rep.get('title', '')
        if '___' in title: rep['title'] = title.split('___')[0]
            
        genre = instance.category.name if instance.category else "Загальне"
        if '___' in genre: genre = genre.split('___')[0]
        rep['genre'] = genre
        
        if instance.author:
            first = instance.author.first_name or ""
            last = instance.author.last_name or ""
            if '___' in last: last = last.split('___')[0]
            rep['author_name'] = f"{first} {last}".strip()
        else:
            rep['author_name'] = "Невідомий Автор"

        # Витягуємо тільки рік
        if hasattr(instance, 'publication_date') and instance.publication_date:
            rep['publication_year'] = str(instance.publication_date)[:4]
        elif hasattr(instance, 'publication_year') and instance.publication_year:
            rep['publication_year'] = str(instance.publication_year)
        else:
            rep['publication_year'] = "Н/Д"

        return rep