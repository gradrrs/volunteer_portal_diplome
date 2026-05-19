import { useEffect, useState } from 'react';
import { apiClient } from '../api/axiosInstance';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import { Mail, Phone, Calendar, Trophy } from 'lucide-react';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone: string;
  date_joined: string;
}

interface Application {
  id: number;
  event: {
    id: number;
    title: string;
    date: string;
  };
  status: string;
  created_at: string;
}

interface Rating {
  score: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [rating, setRating] = useState<Rating | null>(null);
  const accessToken = useAuthStore((state) => state.access);

  useEffect(() => {
    if (!accessToken) return;
    const fetchData = async () => {
      try {
        const [profileRes, appsRes, ratingRes] = await Promise.all([
          apiClient.get('/users/me/'),
          apiClient.get('/applications/'),
          apiClient.get('/ratings/me/')
        ]);
        setProfile(profileRes.data);
        setApplications(appsRes.data);
        setRating(ratingRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [accessToken]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'На рассмотрении';
      case 'approved': return 'Подтверждена';
      case 'rejected': return 'Отклонена';
      case 'completed': return 'Посещено';
      default: return status;
    }
  };

  if (!profile) return <div>Загрузка...</div>;

  return (
    <div>
      <Header />
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white rounded-3xl shadow-md border p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold">
              {profile.username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              <p className="text-gray-500">Волонтёр</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-gray-500" />{profile.email}</div>
            <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-gray-500" />{profile.phone || 'Не указан'}</div>
            <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-gray-500" />{new Date(profile.date_joined).toLocaleDateString('ru-RU')}</div>
            <div className="flex items-center gap-3"><Trophy className="w-5 h-5 text-yellow-500" />Рейтинг: {rating?.score || 0} баллов</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-md border p-6">
          <h2 className="text-xl font-semibold mb-4">Мои заявки</h2>
          {applications.length === 0 ? (
            <p className="text-gray-400">У вас пока нет заявок</p>
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <div key={app.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{app.event.title}</div>
                    {app.created_at ? new Date(app.created_at).toLocaleDateString('ru-RU') : 'Дата не указана'}                  </div>
                  <div className="text-sm px-3 py-1 rounded-full bg-gray-100">{getStatusText(app.status)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}