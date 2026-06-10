import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Library() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('Усі жанри');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog'); 
  
  const [user, setUser] = useState({ username: 'Завантаження...', email: '', is_staff: false });
  const [editingBookId, setEditingBookId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [newBook, setNewBook] = useState({ title: '', author_name: '', genre_name: '', publication_year: '' });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('library_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('library_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (bookId) => {
    if (favorites.includes(bookId)) {
      setFavorites(favorites.filter(id => id !== bookId));
    } else {
      setFavorites([...favorites, bookId]);
    }
  };

  // 🎨 ФУНКЦІЯ ДЛЯ ДИНАМІЧНИХ ІКОНОК ЖАНРІВ
  const getGenreEmoji = (genreName) => {
    if (!genreName) return '📖';
    const g = genreName.toLowerCase();
    if (g.includes('fantasy') || g.includes('фентезі')) return '🔮';
    if (g.includes('sci-fi') || g.includes('science') || g.includes('наукова')) return '🚀';
    if (g.includes('mystery') || g.includes('містика')) return '🕵️';
    if (g.includes('horror') || g.includes('жах')) return '💀';
    if (g.includes('classic') || g.includes('класика')) return '🌊';
    if (g.includes('romance') || g.includes('роман')) return '💕';
    if (g.includes('thriller') || g.includes('трилер')) return '🔪';
    if (g.includes('fiction') || g.includes('проза')) return '📚';
    return '📖';
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    try {
      const response = await fetch('http://localhost:8000/api/users/profile/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setUser(await response.json());
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("Помилка профілю", error);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:8000/api/books/?search=${search}`;
      if (genre !== 'Усі жанри') url += `&genre=${genre}`;
      if (yearFrom) url += `&year_from=${yearFrom}`;
      if (yearTo) url += `&year_to=${yearTo}`;
      
      const response = await fetch(url);
      setBooks(await response.json());
    } catch (error) {
      console.error("Помилка завантаження книг:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchBooks();
  }, [genre]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const handleClearDatabase = async () => {
    if (!window.confirm("🚨 УВАГА! Ви впевнені, що хочете ВИДАЛИТИ АБСОЛЮТНО ВСІ КНИГИ з бази? Цю дію неможливо скасувати!")) return;
    
    try {
      const response = await fetch('http://localhost:8000/api/books/clear/', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        alert('Базу даних повністю очищено!');
        fetchBooks();
      } else {
        alert('Помилка! Доступ заборонено.');
      }
    } catch (error) {
      alert('Помилка з\'єднання.');
    }
  };

  const handleExportExcel = async () => {
    try {
      let url = `http://localhost:8000/api/books/export/?search=${search}`;
      if (genre !== 'Усі жанри') url += `&genre=${genre}`;
      if (yearFrom) url += `&year_from=${yearFrom}`;
      if (yearTo) url += `&year_to=${yearTo}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Помилка генерації файлу');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `library_report.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleScrape = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/scrape/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        alert('Парсинг успішно запущено! Наповнюємо базу...');
        fetchBooks();
      } else {
        alert('Тільки адміністратор може запускати парсинг.');
      }
    } catch (error) {
      alert('Помилка сервера.');
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/books/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newBook)
      });
      if (response.ok) {
        alert('Книгу додано!');
        setNewBook({ title: '', author_name: '', genre_name: '', publication_year: '' });
        fetchBooks();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Видалити цю книгу?")) return;
    try {
      const response = await fetch(`http://localhost:8000/api/books/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) fetchBooks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveEdit = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/books/${id}/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editFormData)
      });
      if (response.ok) {
        setEditingBookId(null);
        fetchBooks();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMessage('');
    try {
      const response = await fetch('http://localhost:8000/api/auth/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setPwdMessage('✅ Пароль успішно змінено!');
        setOldPassword('');
        setNewPassword('');
      } else {
        setPwdMessage('❌ ' + (data.detail || 'Неправильний старий пароль.'));
      }
    } catch (error) {
      setPwdMessage('❌ Помилка з\'єднання з сервером.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const displayedBooks = activeTab === 'favorites' 
    ? books.filter(b => favorites.includes(b.id)) 
    : books;

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '60px' }}>
      
      <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card)', padding: '16px 24px', borderRadius: '12px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: '10px' }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: '600', cursor: 'pointer' }} onClick={() => setActiveTab('catalog')}>
          <div className="logo-icon" style={{ fontSize: '24px' }}>🔮</div>
          <span>Цифрова Бібліотека</span>
        </div>
        
        <div className="nav-tabs" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('catalog')} className={`btn-secondary ${activeTab === 'catalog' ? 'active' : ''}`} style={activeTab === 'catalog' ? { borderColor: 'var(--purple)', color: 'var(--purple3)' } : {}}>📚 Каталог</button>
          <button onClick={() => setActiveTab('favorites')} className={`btn-secondary ${activeTab === 'favorites' ? 'active' : ''}`} style={activeTab === 'favorites' ? { borderColor: '#ff4d6d', color: '#ff4d6d' } : {}}>❤️ Вподобане</button>
          <button onClick={() => setActiveTab('profile')} className={`btn-secondary ${activeTab === 'profile' ? 'active' : ''}`} style={activeTab === 'profile' ? { borderColor: 'var(--purple)', color: 'var(--purple3)' } : {}}>👤 Профіль</button>
          {user.is_staff && (
            <button onClick={() => setActiveTab('admin')} className={`btn-secondary ${activeTab === 'admin' ? 'active' : ''}`} style={activeTab === 'admin' ? { borderColor: 'var(--purple)', color: 'var(--purple3)' } : {}}>⚙️ Адмінка</button>
          )}
        </div>

        <button onClick={handleLogout} className="form-btn" style={{ width: 'auto', marginTop: 0, padding: '8px 16px', background: 'rgba(255, 107, 138, 0.2)', color: '#ff6b8a', border: '1px solid rgba(255, 107, 138, 0.3)' }}>Вийти</button>
      </nav>

      {activeTab === 'profile' && (
        <div className="profile-section" style={{ background: 'var(--card2)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(124, 92, 252, 0.15)', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '20px', color: 'var(--purple3)' }}>Мій Профіль</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px', marginBottom: '32px' }}>
            <div><strong>Логін:</strong> {user.username}</div>
            <div><strong>Email:</strong> {user.email || 'Не вказано'}</div>
            <div><strong>Роль:</strong> <span style={{ color: user.is_staff ? 'var(--teal)' : 'var(--muted)' }}>{user.is_staff ? 'Адміністратор' : 'Читач'}</span></div>
          </div>

          <h3 style={{ color: 'var(--text)', marginBottom: '16px', fontSize: '18px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>🔒 Зміна пароля</h3>
          {pwdMessage && <div style={{ marginBottom: '12px', fontSize: '14px', color: pwdMessage.includes('✅') ? 'var(--teal)' : '#ff6b8a' }}>{pwdMessage}</div>}
          
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input className="form-input" type="password" placeholder="Старий пароль" required value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
            <input className="form-input" type="password" placeholder="Новий пароль" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <button type="submit" className="form-btn" style={{ width: 'fit-content', padding: '10px 24px' }}>Змінити пароль</button>
          </form>
        </div>
      )}

      {activeTab === 'admin' && user.is_staff && (
        <div className="admin-panel" style={{ background: 'var(--card2)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(124, 92, 252, 0.15)', marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '8px', color: 'var(--gold)' }}>Панель Адміністратора</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <button onClick={handleScrape} className="btn-success" style={{ background: 'var(--teal)', color: '#0f1229', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>⚡ Запустити Web-Парсер</button>
            <button onClick={handleExportExcel} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--teal)', border: '1px solid rgba(0, 214, 170, 0.3)', background: 'transparent', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>📥 Експорт звіту в Excel</button>
            <button onClick={handleClearDatabase} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4d6d', border: '1px solid rgba(255, 77, 109, 0.3)', background: 'rgba(255, 77, 109, 0.1)', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}>🚨 Очистити базу</button>
          </div>

          <h3 style={{ color: 'var(--text)', marginBottom: '16px', fontSize: '18px' }}>➕ Додати нову книгу вручну</h3>
          <form onSubmit={handleAddBook} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <input className="form-input" placeholder="Назва книги" required value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
            <input className="form-input" placeholder="Автор (напр. Іван Франко)" required value={newBook.author_name} onChange={e => setNewBook({...newBook, author_name: e.target.value})} />
            <input className="form-input" placeholder="Жанр" required value={newBook.genre_name} onChange={e => setNewBook({...newBook, genre_name: e.target.value})} />
            <input className="form-input" type="number" placeholder="Рік (напр. 2024)" required value={newBook.publication_year} onChange={e => setNewBook({...newBook, publication_year: e.target.value})} />
            <button type="submit" className="form-btn" style={{ gridColumn: 'span 2' }}>Зберегти книгу</button>
          </form>
        </div>
      )}

      {(activeTab === 'catalog' || activeTab === 'favorites') && (
        <>
          {activeTab === 'catalog' ? (
            <div className="hero" style={{ background: 'var(--navy2)', padding: '32px 20px', borderRadius: '16px', textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '36px', marginBottom: '8px', fontWeight: '600' }}>Світ книг у стилі <span style={{ background: 'linear-gradient(135deg, var(--purple2), var(--teal))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Neon Glass</span></h1>
            </div>
          ) : (
            <div className="hero" style={{ background: 'var(--navy2)', padding: '32px 20px', borderRadius: '16px', textAlign: 'center', marginBottom: '32px', border: '1px solid rgba(255, 77, 109, 0.3)' }}>
              <h1 style={{ fontSize: '36px', marginBottom: '8px', fontWeight: '600', color: '#ff4d6d' }}>Ваші улюблені книги ❤️</h1>
            </div>
          )}

          {activeTab === 'catalog' && (
            <form onSubmit={handleSearchSubmit} className="search-bar" style={{ display: 'flex', gap: '12px', background: 'var(--card)', border: '1px solid rgba(124,92,252,0.15)', padding: '12px 20px', borderRadius: '12px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '18px' }}>🔍</span>
              <input className="form-input" type="text" placeholder="Пошук за назвою або автором..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, minWidth: '200px', background: 'transparent', border: 'none' }} />
              
              <select className="form-input" value={genre} onChange={(e) => setGenre(e.target.value)} style={{ width: 'auto', background: 'var(--navy2)', padding: '8px 12px' }}>
                <option value="Усі жанри">Усі жанри</option>
                <option value="Fiction">Fiction</option>
                <option value="Mystery">Mystery</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Classic">Classic</option>
                <option value="Horror">Horror</option>
                <option value="Romance">Romance</option>
                <option value="Thriller">Thriller</option>
              </select>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input className="form-input" type="number" placeholder="Рік від" value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} style={{ width: '90px', padding: '8px', background: 'var(--navy2)' }} />
                <span style={{ color: 'var(--muted)' }}>-</span>
                <input className="form-input" type="number" placeholder="Рік до" value={yearTo} onChange={(e) => setYearTo(e.target.value)} style={{ width: '90px', padding: '8px', background: 'var(--navy2)' }} />
              </div>

              <button type="submit" className="form-btn" style={{ width: 'auto', marginTop: 0, padding: '10px 24px' }}>Шукати</button>
            </form>
          )}

          <div style={{ color: 'var(--muted)', marginBottom: '16px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Знайдено результатів: <strong>{displayedBooks.length}</strong></span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--purple3)', padding: '40px' }}>Завантаження даних...</div>
          ) : (
            <div className="books-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {displayedBooks.map((book, index) => (
                <div key={book.id} className="book-card" style={{ '--delay': `${(index % 10) * 0.05}s`, background: 'var(--card)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                  
                  {/* ВЕРХНЯ СВІТЛІША ЧАСТИНА З ЕМОДЗІ ТА КНОПКАМИ */}
                  <div style={{ height: '140px', background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '56px', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    {getGenreEmoji(book.genre)}

                    {/* Кнопка "Вподобане" (Зліва) */}
                    <button 
                      onClick={() => toggleFavorite(book.id)} 
                      style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', transform: favorites.includes(book.id) ? 'scale(1.1)' : 'scale(1)' }}
                    >
                      {favorites.includes(book.id) ? '❤️' : '🤍'}
                    </button>

                    {/* Кнопки Адміна (Справа) */}
                    {user.is_staff && !editingBookId && (
                      <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                        <button onClick={() => { setEditingBookId(book.id); setEditFormData({ title: book.title, author_name: book.author_name, genre_name: book.genre, publication_year: book.publication_year }); }} style={{ background: 'rgba(124, 92, 252, 0.2)', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏️</button>
                        <button onClick={() => handleDeleteBook(book.id)} style={{ background: 'rgba(255, 107, 138, 0.2)', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑</button>
                      </div>
                    )}
                  </div>

                  {/* НИЖНЯ ЧАСТИНА (Текст + Жанр/Рік притиснуті до низу) */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    {editingBookId === book.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input className="form-input" style={{ padding: '6px' }} value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} />
                        <input className="form-input" style={{ padding: '6px' }} value={editFormData.author_name} onChange={e => setEditFormData({...editFormData, author_name: e.target.value})} />
                        <input className="form-input" style={{ padding: '6px' }} value={editFormData.genre_name} onChange={e => setEditFormData({...editFormData, genre_name: e.target.value})} />
                        <input className="form-input" type="number" style={{ padding: '6px' }} value={editFormData.publication_year} onChange={e => setEditFormData({...editFormData, publication_year: e.target.value})} />
                        
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button onClick={() => handleSaveEdit(book.id)} className="btn-success" style={{ flex: 1, padding: '6px', fontSize: '12px' }}>Зберегти</button>
                          <button onClick={() => setEditingBookId(null)} className="btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '12px' }}>Скасувати</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', lineHeight: '1.4' }}>{book.title}</h3>
                        <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: 'auto' }}>{book.author_name || 'Невідомий автор'}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                          <span style={{ fontSize: '12px', background: 'rgba(124, 92, 252, 0.12)', color: 'var(--purple3)', padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(124, 92, 252, 0.2)' }}>{book.genre || 'Загальне'}</span>
                          <span style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '500' }}>{book.publication_year ? `${book.publication_year} р.` : '—'}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                </div>
              ))}
            </div>
          )}

          {displayedBooks.length === 0 && !loading && (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>
              {activeTab === 'favorites' ? 'У вас ще немає улюблених книг. Додайте їх у каталозі!' : 'Списку книг немає. Перейдіть в Адмінку та запустіть парсер!'}
            </div>
          )}
        </>
      )}

    </div>
  );
}

export default Library;