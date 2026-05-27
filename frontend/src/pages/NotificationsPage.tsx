import { useEffect, useState } from 'react';
import { apiClient } from '../api/axiosInstance';
import Header from '../components/Header';
import { Bell, Check } from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/notifications/');
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await apiClient.patch(`/notifications/${id}/`, { is_read: true });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <Header />
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Bell className="w-6 h-6" /> Уведомления</h1>
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-400">🔔 Уведомлений пока нет</div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className={`flex justify-between items-start p-4 rounded-xl border ${n.is_read ? 'bg-white opacity-70' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex-1">
                  <p>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('ru-RU')}</p>
                </div>
                {!n.is_read && (
                  <button onClick={() => markAsRead(n.id)} className="text-gray-500 hover:text-green-600"><Check className="w-5 h-5" /></button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}