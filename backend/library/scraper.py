import requests
from bs4 import BeautifulSoup
from datetime import date
from urllib.parse import urljoin  # Для правильного склеювання посилань
from .models import Book, Author, Category

def scrape_books_pages(max_pages=8):
    """
    Покращений скрипт: заходить всередину кожної книги та зчитує її реальний жанр!
    """
    base_url = "http://books.toscrape.com/catalogue/page-{}.html"
    
    # Створюємо або знаходимо дефолтного автора
    default_author, _ = Author.objects.get_or_create(
        first_name="Internet", 
        last_name="Parser",
        defaults={'bio': "Автоматично згенерований автор для книг із сайту books.toscrape.com"}
    )
    
    books_created_or_updated = 0

    for page in range(1, max_pages + 1):
        url = base_url.format(page)
        response = requests.get(url)
        
        if response.status_code != 200:
            break
            
        soup = BeautifulSoup(response.content, 'html.parser')
        products = soup.find_all('article', class_='product_pod')
        
        for product in products:
            # 1. Знаходимо назву та відносне посилання на детальну сторінку книги
            title_link = product.find('h3').find('a')
            title = title_link['title']
            relative_book_url = title_link['href']
            
            # Склеюємо базовий URL сторінки з посиланням на книгу
            full_book_url = urljoin(url, relative_book_url)
            
            # Дефолтний жанр на випадок, якщо щось піде не так
            category_name = "Спарсено з мережі"
            
            # 2. Переходимо ВСЕРЕДИНУ книги для отримання реального жанру
            try:
                book_response = requests.get(full_book_url, timeout=5)
                if book_response.status_code == 200:
                    book_soup = BeautifulSoup(book_response.content, 'html.parser')
                    
                    # Шукаємо хлібні крихти (breadcrumbs), де захований жанр
                    breadcrumb = book_soup.find('ul', class_='breadcrumb')
                    if breadcrumb:
                        lis = breadcrumb.find_all('li')
                        if len(lis) > 2:
                            # Третій елемент <li> — це завжди назва жанру на цьому сайті
                            category_name = lis[2].text.strip()
            except Exception as e:
                print(f"Помилка при переході на сторінку книги: {e}")

            # 3. Створюємо або знаходимо таку категорію в нашій базі
            category, _ = Category.objects.get_or_create(name=category_name)
            
            # Генеруємо унікальний ISBN на основі назви
            fake_isbn = str(abs(hash(title)))[:13].zfill(13)
            
            # 4. Вимога ТЗ: оновлюємо категорію в існуючих книг або створюємо нові
            book, created = Book.objects.update_or_create(
                title=title,
                defaults={
                    'author': default_author,
                    'category': category,
                    'description': f"Книга автоматично імпортована з детальної сторінки сайту books.toscrape.com.",
                    'publication_date': date.today(),
                    'isbn': fake_isbn
                }
            )
            books_created_or_updated += 1

    return books_created_or_updated