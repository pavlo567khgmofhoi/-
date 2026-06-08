import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProfileQuery, useChangePasswordMutation } from '../app/api/apiSlice';

function Profile() {
  const { data: user, isLoading: isUserLoading } = useGetProfileQuery();
  const [changePassword, { isLoading: isUpdating }] = useChangePasswordMutation();
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePassword(passwordData).unwrap();
      alert('Пароль успішно змінено!');
      setPasswordData({ old_password: '', new_password: '' });
    } catch (err) {
      alert('Помилка зміни пароля. Перевірте старий пароль.');
    }
  };

  if (isUserLoading) {
    return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Завантаження профілю...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {/* Верхня панель навігації */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-black tracking-tight">Мій Профіль</h1>
        <button 
          onClick={() => navigate('/')} 
          className="px-5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition text-sm font-medium"
        >
          ← Назад до бібліотеки
        </button>
      </div>

      {/* Головна сітка профілю */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Картка інформації про користувача */}
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black mb-6 shadow-lg shadow-blue-500/20">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <h2 className="text-2xl font-bold mb-1">{user?.username || 'Користувач'}</h2>
          <p className="text-gray-500 text-sm mb-6">{user?.email || 'email@example.com'}</p>
          <div className="border-t border-gray-800 pt-4">
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Роль в системі</span>
            <p className="text-blue-400 font-semibold mt-1">{user?.is_staff ? 'Адміністратор' : 'Звичайний користувач'}</p>
          </div>
        </div>

        {/* Форма зміни пароля */}
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl md:col-span-2">
          <h3 className="text-xl font-bold mb-2">Безпека акаунту</h3>
          <p className="text-gray-500 text-sm mb-6">Ти можеш змінити свій поточний пароль через API.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Старий пароль</label>
              <input 
                type="password" name="old_password" required value={passwordData.old_password} onChange={handleChange}
                className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 text-white focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Новий пароль</label>
              <input 
                type="password" name="new_password" required value={passwordData.new_password} onChange={handleChange}
                className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 text-white focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" disabled={isUpdating}
              className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:bg-gray-800"
            >
              {isUpdating ? 'Оновлюємо...' : 'Змінити пароль'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Profile;