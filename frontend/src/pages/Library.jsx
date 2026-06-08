import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetBooksQuery, 
  useDeleteBookMutation, 
  useGetProfileQuery, 
  useScrapeBooksMutation, 
  useAddBookMutation 
} from '../app/api/apiSlice';

function Library() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false); // Стан для показу панелі адміна
  
  // Поля форми для створення нової книги
  const [newBookData, setNewBookData] = useState({ title: '', genre_name: '', publication_year: '' });

  // Запити та мутації через RTK Query
  const { data: user } = useGetProfileQuery();
  const { data: books, isLoading, error } = useGetBooksQuery({ search: searchTerm, genre: selectedGenre });
  const [deleteBook] = useDeleteBookMutation();
  const [scrapeBooks, { isLoading: isScraping }] = useScrapeBooksMutation();
  const [addBook, { isLoading: isAdding }] = useAddBookMutation();
  
  const navigate = useNavigate();
  const genres = ['Усі жанри', 'Фантастика', 'Класика', 'Детектив', 'Пригоди', 'Роман', 'Історія'];

  // Функція експорту в Excel
  const handleDownloadExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/books/export/?genre=${selectedGenre}&search=${searchTerm}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'library_books.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Не вдалося завантажити Excel.');
    }
  };

  // Видалення книги
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm('Ви впевнені, що хочете видалити цю книгу?')) {
      try {
        await deleteBook(id).unwrap();
      } catch (err) {
        alert('Помилка видалення книги');
      }
    }
  };

  // Ручний запуск парсера книг з books.toscrape.com
  const handleScrape = async () => {
    try {
      const res = await scrapeBooks().unwrap();
      alert(`Успішно! ${res.message || 'Базу даних оновлено новісінькими книгами.'}`);
    } catch (err) {
      alert('Помилка запуску парсингу. Доступ дозволено лише адміністраторам.');
    }
  };

  // Ручне додавання нової книги через форму
  const handleAddBookSubmit = async (e) => {
    e.preventDefault();
    try {
      await addBook({
        title: newBookData.title,
        // Передаємо текстову назву категорії, бекенд Django сам знайде або створить її
        category_name: newBookData.genre_name || 'Загальне', 
        publication_year: parseInt(newBookData.publication_year) || null
      }).unwrap();
      
      alert('Книгу успішно додано до каталогу бібліотеки!');
      setNewBookData({ title: '', genre_name: '', publication_year: '' }); // Очищуємо форму
    } catch (err) {
      alert('Помилка створення книги. Перевірте правильність заповнення полів.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {/* Навігаційна панель шапки */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Цифрова Бібліотека
          </h1>
          <p className="text-gray-500 text-sm mt-1">Керування книгами та аналітика системи</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <button onClick={handleDownloadExcel} className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition text-sm">
            📊 Завантажити Excel
          </button>
          
          {/* Показуємо кнопку Панелі адміна ТІЛЬКИ якщо користувач має статус is_staff */}
          {user?.is_staff && (
            <button 
              onClick={() => setShowAdminPanel(!showAdminPanel)} 
              className={`px-5 py-3 font-bold rounded-xl transition text-sm ${showAdminPanel ? 'bg-amber-600 text-white' : 'bg-gray-900 border border-amber-500/40 text-amber-400 hover:bg-amber-950/20'}`}
            >
              🛠️ {showAdminPanel ? 'Закрити адмін-панель' : 'Панель адміністратора'}
            </button>
          )}

          <button onClick={() => navigate('/profile')} className="px-5 py-3 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white font-bold rounded-xl transition text-sm">
            👤 Мій Профіль
          </button>
        </div>
      </div>

      {/* ЗАКРИТА ПАНЕЛЬ АДМІНІСТРАТОРА (З'ЯВЛЯЄТЬСЯ ПРИ КЛІКУ) */}
      {user?.is_staff && showAdminPanel && (
        <div className="max-w-7xl mx-auto bg-gray-900 border border-amber-500/20 p-6 rounded-2xl mb-10 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
          
          {/* Блок 1: Автоматизація та Скрепінг */}
          <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-amber-400 mb-2">🤖 Модуль імпорту (Частина 3)</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Запуск автоматичного робота-скрепера. Він підключиться до веб-ресурсу books.toscrape.com, збере актуальну інформацію про літературу й завантажить її прямо в базу PostgreSQL.
              </p>
            </div>
            <button 
              onClick={handleScrape} 
              disabled={isScraping}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-800 font-bold rounded-xl transition text-sm text-center"
            >
              {isScraping ? 'Скрепінг триває...' : 'Запустити веб-парсинг'}
            </button>
          </div>

          {/* Блок 2: Форма додавання нової книги вручну */}
          <form onSubmit={handleAddBookSubmit} className="bg-gray-950 p-5 rounded-xl border border-gray-800 md:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-blue-400">📝 Додати нову книгу вручну (Частина 2)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input 
                type="text" placeholder="Назва книги" required
                value={newBookData.title}
                onChange={(e) => setNewBookData({ ...newBookData, title: e.target.value })}
                className="p-3 text-sm rounded-lg bg-gray-900 border border-gray-800 text-white outline-none focus:border-blue-500 transition"
              />
              <input 
                type="text" placeholder="Жанр (напр. Фантастика)"
                value={newBookData.genre_name}
                onChange={(e) => setNewBookData({ ...newBookData, genre_name: e.target.value })}
                className="p-3 text-sm rounded-lg bg-gray-900 border border-gray-800 text-white outline-none focus:border-blue-500 transition"
              />
              <input 
                type="number" placeholder="Рік видання"
                value={newBookData.publication_year}
                onChange={(e) => setNewBookData({ ...newBookData, publication_year: e.target.value })}
                className="p-3 text-sm rounded-lg bg-gray-900 border border-gray-800 text-white outline-none focus:border-blue-500 transition"
              />
            </div>
            <button 
              type="submit" 
              disabled={isAdding}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 text-white font-bold rounded-xl text-sm transition"
            >
              {isAdding ? 'Збереження...' : 'Зберегти книгу в базу'}
            </button>
          </form>
        </div>
      )}

      {/* Панель фільтрів та пошуку */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <input 
          type="text" placeholder="Пошук книги за назвою..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-4 rounded-xl bg-gray-900 border border-gray-800 focus:border-blue-500 outline-none text-sm text-white transition sm:col-span-2"
        />
        <select 
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value === 'Усі жанри' ? '' : e.target.value)}
          className="p-4 rounded-xl bg-gray-900 border border-gray-800 focus:border-blue-500 outline-none text-sm text-white transition cursor-pointer"
        >
          {genres.map((genre) => (
            <option key={genre} value={genre} className="bg-gray-900">{genre}</option>
          ))}
        </select>
      </div>

      {/* Основний контент (Красива сітка книг) */}
      <div className="max-w-7xl mx-auto">
        {isLoading && <div className="text-center py-12 text-gray-500">Завантаження каталогів...</div>}
        {error && <div className="text-center py-12 text-red-500">Помилка завантаження даних. Перевірте бекенд.</div>}
        
        {books && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <div 
                key={book.id} onClick={() => navigate(`/book/${book.id}`)}
                className="group bg-gray-900 border border-gray-800 p-5 rounded-2xl hover:border-gray-700 transition duration-300 shadow-xl cursor-pointer relative flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[3/4] bg-gray-950 rounded-xl mb-4 overflow-hidden border border-gray-800 flex items-center justify-center text-gray-700 font-bold group-hover:scale-[1.02] transition duration-300">
                    {book.cover_image ? (
                      <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-500">Немає обкладинки</span>
                    )}
                  </div>
                  <span className="px-2.5 py-1 bg-gray-950 border border-gray-800 rounded-md text-xs font-semibold text-blue-400">
                    {book.genre || 'Загальне'}
                  </span>
                  <h3 className="font-bold text-lg mt-3 text-white line-clamp-2 group-hover:text-blue-400 transition">
                    {book.title}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1">Рік: {book.publication_year || 'Н/Д'}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-800/60 flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-medium">Детальніше →</span>
                  
                  {/* Кнопочку видалення бачить лише адмін */}
                  {user?.is_staff && (
                    <button 
                      onClick={(e) => handleDelete(book.id, e)}
                      className="p-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900/30 text-red-400 rounded-lg transition"
                      title="Видалити книгу"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {books?.length === 0 && (
          <div className="text-center py-20 text-gray-600 border border-dashed border-gray-800 rounded-2xl">
            Книг за такими критеріями не знайдено.
          </div>
        )}
      </div>
    </div>
  );
}

export default Library;