import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      // Відправляємо дані на наш Django бекенд
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsError(false);
        setMessage('Успішна реєстрація! Перенаправляємо на сторінку входу...');
        // Чекаємо 2 секунди, щоб користувач побачив повідомлення, і кидаємо на логін
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setIsError(true);
        // Виводимо помилку від бекенду (наприклад, "Користувач вже існує")
        setMessage(data.detail || 'Помилка реєстрації. Перевірте введені дані.');
      }
    } catch (error) {
      setIsError(true);
      setMessage('Помилка з\'єднання з сервером. Переконайтеся, що бекенд працює.');
    }
  };

  return (
    <div className="container">
      <div className="login-section">
        
        <div className="login-card">
          <div className="form-title">Реєстрація</div>
          <div className="form-subtitle">Створіть акаунт для доступу до бібліотеки</div>

          {/* Блок для виводу повідомлень про успіх або помилку */}
          {message && (
            <div className={isError ? "error-msg" : "success-msg"}>
              {message}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Ім'я користувача</label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="Введіть логін"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                className="form-input" 
                type="email" 
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Пароль</label>
              <input 
                className="form-input" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="form-btn">Зареєструватися →</button>
          </form>

          <div className="form-link">
            Вже маєте акаунт? <Link to="/login">Увійти</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;