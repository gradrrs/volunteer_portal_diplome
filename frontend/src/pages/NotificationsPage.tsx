import { useEffect, useState } from 'react';
import { apiClient } from '../api/axiosInstance';
import { useAuthStore } from '../store/authStore';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const accessToken = useAuthStore((state) => state.access);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiClient.patch(`/notifications/${id}/`, { is_read: true });
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.post('/notifications/mark-all-read/');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await apiClient.delete(`/notifications/${id}/`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [accessToken]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-gray-400">⏳ Загрузка уведомлений...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-7 h-7 text-amber-500" />
          <h1 className="text-2xl font-bold text-gray-800">Уведомления</h1>
          {unreadCount > 0 && (
            <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} новых
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Прочитать всё
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-500 text-lg">У вас пока нет уведомлений</p>
          <p className="text-gray-400 text-sm mt-1">Когда появятся события, они будут здесь</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start justify-between p-4 rounded-xl transition-all ${
                notif.is_read
                  ? 'bg-white border border-gray-100 opacity-70'
                  : 'bg-amber-50 border-l-4 border-l-amber-500 shadow-sm'
              }`}
            >
              <div className="flex-1">
                <p className={`text-gray-800 ${!notif.is_read ? 'font-medium' : ''}`}>
                  {notif.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notif.created_at).toLocaleString('ru-RU')}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {!notif.is_read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                    title="Отметить прочитанным"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}