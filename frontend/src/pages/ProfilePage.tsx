import { useEffect, useState } from 'react';
import { apiClient } from '../api/axiosInstance';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import EditProfileModal from '../components/EditProfileModal';
import AvatarUpload from '../components/AvatarUpload';
import { Mail, Phone, Calendar, Trophy } from 'lucide-react';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone: string;
  avatar: string | null;
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
  event_title?: string;
}

interface Rating {
  score: number;
}

interface Transaction {
  id: number;
  amount: number;
  reason: string;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [rating, setRating] = useState<Rating | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const accessToken = useAuthStore((state) => state.access);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    if (!accessToken) return;
    const fetchData = async () => {
      try {
        const [profileRes, appsRes, ratingRes, transRes] = await Promise.all([
          apiClient.get('/users/me/'),
          apiClient.get('/applications/'),
          apiClient.get('/ratings/me/'),
          apiClient.get('/transactions/')
        ]);
        setProfile(profileRes.data);
        setApplications(appsRes.data);
        setRating(ratingRes.data);
        setTransactions(transRes.data);
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

  const handleProfileUpdate = (updatedUser: UserProfile) => {
    setProfile(updatedUser);
    fetchUser();
  };

  const avatarUrl = profile?.avatar ? `http://127.0.0.1:8000${profile.avatar}` : null;

  if (!profile) return <div>Загрузка...</div>;

  return (
    <div>
      <Header />
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white rounded-3xl shadow-md border p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold">
                    {profile.username[0].toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md border hover:bg-gray-50"
                  title="Сменить аватар"
                >
                  📷
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                <p className="text-gray-500">Волонтёр</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition"
            >
              ✏️ Редактировать
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-gray-500" />{profile.email}</div>
            <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-gray-500" />{profile.phone || 'Не указан'}</div>
            <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-gray-500" />{new Date(profile.date_joined).toLocaleDateString('ru-RU')}</div>
            <div className="flex items-center gap-3"><Trophy className="w-5 h-5 text-yellow-500" />Рейтинг: {rating?.score || 0} баллов</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-md border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Мои заявки</h2>
          {applications.length === 0 ? (
            <p className="text-gray-400">У вас пока нет заявок</p>
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <div key={app.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{app.event?.title || app.event_title || 'Без названия'}</div>
                  </div>
                  <div className="text-sm px-3 py-1 rounded-full bg-gray-100">{getStatusText(app.status)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={profile}
        onUpdate={handleProfileUpdate}
      />

      <AvatarUpload
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={avatarUrl}
        onAvatarUpdated={(newAvatarUrl) => {
          setProfile({ ...profile, avatar: newAvatarUrl });
          fetchUser();
        }}
      />
    </div>
  );
}