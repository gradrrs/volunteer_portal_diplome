import { useEffect, useState } from 'react';
import { apiClient } from '../api/axiosInstance';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Phone, Calendar, Trophy, Clock } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const accessToken = useAuthStore((state) => state.access);

  useEffect(() => {
    if (!accessToken) return;

    const fetchProfileData = async () => {
      setLoading(true);
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
        console.error('Ошибка загрузки профиля:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [accessToken]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: '⏳ Ожидает', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 'approved':
        return { text: '✅ Подтверждена', color: 'bg-green-100 text-green-700 border-green-200' };
      case 'rejected':
        return { text: '❌ Отклонена', color: 'bg-red-100 text-red-700 border-red-200' };
      case 'completed':
        return { text: '🎉 Посещено', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Личный кабинет</h1>
          <p className="text-gray-500 mt-1">Добро пожаловать обратно!</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium">
          ✏️ Редактировать профиль
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {profile && (
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-4xl font-semibold">
                {profile.username[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{profile.username}</h2>
                <p className="text-gray-500">Участник</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-5">
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-5">
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Телефон</p>
                  <p className="font-medium">{profile.phone || 'Не указан'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-5">
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Дата регистрации</p>
                  <p className="font-medium">
                    {new Date(profile.date_joined).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {rating && (
          <div className="lg:col-span-5 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 rounded-3xl shadow-lg p-8 text-white flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-8 h-8" />
              <h2 className="text-2xl font-semibold">Мой рейтинг</h2>
            </div>
            
            <div className="mt-auto">
              <p className="text-7xl font-bold tracking-tighter">{rating.score}</p>
              <p className="text-xl text-indigo-100 mt-1">баллов</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-semibold">Мои заявки</h2>
          </div>
          <p className="text-gray-500 text-sm">{applications.length} заявок</p>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl">У вас пока нет заявок</p>
            <p className="mt-2">Когда вы подадите заявку на мероприятие, она появится здесь</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const status = getStatusConfig(app.status);
              return (
                <div
                  key={app.id}
                  className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors rounded-2xl p-6 group"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {app.event.title}
                    </h3>
                    <p className="text-gray-500 flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(app.event.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className={`px-5 py-2.5 rounded-2xl text-sm font-medium border ${status.color}`}>
                    {status.text}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}