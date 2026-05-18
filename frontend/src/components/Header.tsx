import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, User, Bell, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Header() {
  
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  console.log('User from store:', user);

  const navItems = [
    { path: '/', label: 'Лента', icon: Home },
    { path: '/events', label: 'Мероприятия', icon: Calendar },
    { path: '/profile', label: 'Профиль', icon: User },
    { path: '/notifications', label: 'Уведомления', icon: Bell },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
          {user?.is_staff && (
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                location.pathname === '/admin'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Админ</span>
            </Link>
          )}
        </div>

        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors px-3 py-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Выйти</span>
        </button>
      </div>
    </header>
  );
}