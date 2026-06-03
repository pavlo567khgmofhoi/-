from django.db import models

class Author(models.Model):
    first_name = models.CharField(max_length=100, verbose_name="Ім'я")
    last_name = models.CharField(max_length=100, verbose_name="Прізвище")
    bio = models.TextField(blank=True, verbose_name="Біографія")

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Назва категорії")

    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField(max_length=255, verbose_name="Назва книги")
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='books', verbose_name="Автор")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='books', verbose_name="Категорія")
    description = models.TextField(blank=True, verbose_name="Опис")
    publication_date = models.DateField(verbose_name="Дата публікації")
    isbn = models.CharField(max_length=13, unique=True, verbose_name="ISBN")

    def __str__(self):
        return self.title