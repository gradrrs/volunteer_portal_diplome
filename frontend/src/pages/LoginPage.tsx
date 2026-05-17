import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/');
    } catch (error) {
      console.error('Ошибка входа:', error);
      alert('Ошибка входа. Проверьте имя пользователя и пароль.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Вход</h2>
        <input
          type="text"
          placeholder="Имя пользователя"
          className="w-full p-2 border mb-2 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          className="w-full p-2 border mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Войти</button>
        <p className="mt-2 text-center">Нет аккаунта? <Link to="/register" className="text-blue-600">Регистрация</Link></p>
      </form>
    </div>
  );
}