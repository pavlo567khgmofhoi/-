import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../app/api/apiSlice';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // .unwrap() обов'язково змусить код у разі помилки 400 йти в блок catch
      const data = await login({ username, password }).unwrap();
      
      // Зберігаємо токен у локальне сховище для авторизації запитів
      localStorage.setItem('token', data.access);
      
      console.log('Вхід успішний! Токен збережено.');
      navigate('/'); // Перенаправляємо на головну сторінку бібліотеки
    } catch (err) {
      alert('Помилка входу: перевірте логін або пароль. Можливо, такого користувача немає в базі Docker.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="bg-gray-900 border border-gray-800 p-10 rounded-3xl w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-black text-white mb-2 text-center">Вхід до системи</h1>
        <p className="text-gray-500 text-center mb-8">Авторизуйтесь для доступу до бібліотеки</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input 
              type="text" 
              placeholder="Логін (або Email)" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 text-white focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Пароль" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 text-white focus:border-blue-500 outline-none transition"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-gray-800"
          >
            {isLoading ? 'Завантаження...' : 'Увійти'}
          </button>
        </form>

        <p className="text-gray-500 text-center mt-6 text-sm">
          Немає акаунту? <button onClick={() => navigate('/register')} className="text-blue-500 font-bold hover:underline">Зареєструватися</button>
        </p>
      </div>
    </div>
  );
}

export default Login;