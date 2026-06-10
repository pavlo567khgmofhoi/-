import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.access);
        navigate('/'); // Перекидаємо на головну сторінку
      } else {
        setError('Неправильний логін або пароль!');
      }
    } catch (err) {
      setError('Помилка з\'єднання з сервером.');
    }
  };

  return (
    <div className="container animate-fade-in">
      <div className="login-section">
        <div className="login-card">
          <div className="form-title">Авторизація</div>
          <div className="form-subtitle">Введіть свої дані для доступу до системи бібліотеки</div>
          
          {error && <div className="error-msg">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Логін</label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="Введіть свій логін (напр. admin)" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
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
            
            <button type="submit" className="form-btn">Увійти в систему →</button>
          </form>
          
          <div className="form-link">
            Немає акаунту? <Link to="/register">Зареєструйтеся</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;