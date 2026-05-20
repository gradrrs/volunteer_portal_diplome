import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, User, Bell, LogOut, Shield, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const navItems = [
    { path: '/', label: 'Лента', icon: Home },
    { path: '/events', label: 'Мероприятия', icon: Calendar },
    { path: '/profile', label: 'Профиль', icon: User },
    { path: '/notifications', label: 'Уведомления', icon: Bell },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Десктопная версия */}
        <div className="hidden md:flex items-center justify-between">
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
                  <span>{item.label}</span>
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
                <span>Админ</span>
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
            <span>Выйти</span>
          </button>
        </div>

        <div className="flex md:hidden items-center justify-between">
          <Link to="/" className="text-lg font-bold text-blue-600">Волонтёры</Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-2 py-3 transition-all ${
                    isActive ? 'text-blue-600 font-medium' : 'text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {user?.is_staff && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-2 py-3 transition-all ${
                  location.pathname === '/admin' ? 'text-blue-600 font-medium' : 'text-gray-600'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Админ</span>
              </Link>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
                window.location.href = '/login';
              }}
              className="flex items-center gap-3 px-2 py-3 w-full text-left text-red-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Выйти</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}