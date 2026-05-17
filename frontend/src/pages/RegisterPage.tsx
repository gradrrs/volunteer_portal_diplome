import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== password2) {
      alert('Пароли не совпадают');
      return;
    }

    try {
      await register(username, email, password);
      alert('Регистрация прошла успешно! Теперь войдите в систему.');
      navigate('/login');
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data || 'Ошибка регистрации';
      if (typeof errorMsg === 'object') {
        const messages = Object.values(errorMsg).flat().join('\n');
        alert(messages);
      } else {
        alert(errorMsg);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Регистрация</h2>
        
        <input 
          type="text" 
          placeholder="Имя пользователя" 
          className="w-full p-2 border mb-2 rounded" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
        
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full p-2 border mb-2 rounded" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        
        <input 
          type="password" 
          placeholder="Пароль" 
          className="w-full p-2 border mb-2 rounded" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        
        <input 
          type="password" 
          placeholder="Подтверждение пароля" 
          className="w-full p-2 border mb-4 rounded" 
          value={password2} 
          onChange={(e) => setPassword2(e.target.value)} 
          required 
        />
        
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Зарегистрироваться
        </button>
        
        <p className="mt-2 text-center">
          Уже есть аккаунт? <Link to="/login" className="text-blue-600">Войти</Link>
        </p>
      </form>
    </div>
  );
}