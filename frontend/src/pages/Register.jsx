import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../app/api/apiSlice';

function Register() {
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData).unwrap();
      alert('Реєстрація успішна! Тепер ти можеш увійти.');
      navigate('/login');
    } catch (err) {
      alert('Помилка реєстрації. Перевір дані або такий користувач вже існує.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="bg-gray-900 border border-gray-800 p-10 rounded-3xl w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-black text-white mb-2 text-center">Створити акаунт</h1>
        <p className="text-gray-500 text-center mb-8">Приєднуйся до нашої бібліотеки</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input 
              type="text" name="username" placeholder="Ім'я користувача" required
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <input 
              type="email" name="email" placeholder="Email" required
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <input 
              type="password" name="password" placeholder="Пароль" required
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <button 
            type="submit" disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
            {isLoading ? 'Реєструємо...' : 'Зареєструватися'}
          </button>
        </form>

        <p className="text-gray-500 text-center mt-6 text-sm">
          Вже є акаунт? <button onClick={() => navigate('/login')} className="text-blue-500 font-bold hover:underline">Увійти</button>
        </p>
      </div>
    </div>
  );
}

export default Register;