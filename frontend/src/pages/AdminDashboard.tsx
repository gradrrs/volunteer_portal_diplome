import { useEffect, useState } from 'react';
import { apiClient } from '../api/axiosInstance';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import Header from '../components/Header';
import { Plus, Trash2, Calendar, Users, FileText, UserCheck, Pencil } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  required_volunteers: number;
}

interface Application {
  id: number;
  user: string;
  event_title: string;
  status: string;
  created_at: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  rating_score: number;
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [activeTab, setActiveTab] = useState<'events' | 'applications' | 'posts' | 'users'>('events');
  const [loading, setLoading] = useState(true);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    required_volunteers: 1,
  });

  const [newPost, setNewPost] = useState({ title: '', content: '' });

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventsRes, appsRes, postsRes] = await Promise.all([
          apiClient.get('/events/'),
          apiClient.get('/applications/'),
          apiClient.get('/posts/'),
        ]);

        setEvents(eventsRes.data.results || eventsRes.data);
        setApplications(appsRes.data.results || appsRes.data);
        setPosts(postsRes.data.results || postsRes.data);

        try {
          const usersRes = await apiClient.get('/admin/users/');
          setUsers(usersRes.data);
        } catch (userError) {
          console.warn('Не удалось загрузить список пользователей (недостаточно прав)');
          setUsers([]);
        }
      } catch (error) {
        console.error('Ошибка загрузки основных данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await apiClient.patch(`/applications/${id}/`, { status });
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status } : app
      ));
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Удалить мероприятие?')) return;
    try {
      await apiClient.delete(`/events/${id}/`);
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/events/', newEvent);
      setEvents([...events, response.data]);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        location: '',
        required_volunteers: 1,
      });
    } catch (error) {
      console.error('Ошибка создания мероприятия:', error);
    }
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  };

  const handleUpdateEvent = async (updatedData: Partial<Event>) => {
    if (!editingEvent) return;
    try {
      await apiClient.patch(`/events/${editingEvent.id}/`, updatedData);
      const eventsRes = await apiClient.get('/events/');
      setEvents(eventsRes.data.results || eventsRes.data);
      setIsEditModalOpen(false);
      setEditingEvent(null);
      alert('Мероприятие обновлено');
    } catch (error) {
      console.error('Ошибка обновления:', error);
      alert('Не удалось обновить мероприятие');
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('Удалить пост?')) return;
    try {
      await apiClient.delete(`/posts/${id}/`);
      setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/posts/', newPost);
      setPosts([response.data, ...posts]);
      setNewPost({ title: '', content: '' });
    } catch (error) {
      console.error('Ошибка создания поста:', error);
    }
  };

  //if (!user?.is_staff) {
  //  return <Navigate to="/" />;
  //}

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">Загружаем панель координатора...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Панель координатора</h1>
          <p className="text-gray-500 mt-1">Управление мероприятиями и командой</p>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-gray-200 mb-8">
          {[
            { id: 'events', label: 'Мероприятия', icon: Calendar },
            { id: 'applications', label: 'Заявки', icon: UserCheck },
            { id: 'posts', label: 'Посты', icon: FileText },
            { id: 'users', label: 'Волонтёры', icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-2xl transition-all ${
                activeTab === id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'events' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Новое мероприятие
              </h2>

              <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Название мероприятия"
                  className="border border-gray-200 focus:border-blue-500 rounded-2xl px-4 py-3 outline-none transition-all"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Место проведения"
                  className="border border-gray-200 focus:border-blue-500 rounded-2xl px-4 py-3 outline-none transition-all"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  required
                />
                <input
                  type="datetime-local"
                  className="border border-gray-200 focus:border-blue-500 rounded-2xl px-4 py-3 outline-none transition-all"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Количество волонтёров"
                  className="border border-gray-200 focus:border-blue-500 rounded-2xl px-4 py-3 outline-none transition-all"
                  value={newEvent.required_volunteers}
                  onChange={(e) => setNewEvent({ ...newEvent, required_volunteers: +e.target.value })}
                  required
                />
                <textarea
                  placeholder="Описание мероприятия..."
                  rows={3}
                  className="md:col-span-2 border border-gray-200 focus:border-blue-500 rounded-3xl px-4 py-3 outline-none transition-all resize-y"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />

                <button
                  type="submit"
                  className="md:col-span-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all text-white font-medium py-3.5 rounded-2xl flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Создать мероприятие
                </button>
              </form>
            </div>

            <div className="space-y-4">
              {Array.isArray(events) && events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.date).toLocaleString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        <span className="mx-1">•</span>
                        {event.location}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(event)}
                        className="text-blue-500 hover:text-blue-700 p-2 opacity-0 group-hover:opacity-100 transition-all"
                        title="Редактировать"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
                        title="Удалить"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center">
                <p className="text-gray-400">Пока нет заявок</p>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-all"
                >
                  <div>
                    <p className="font-medium">{app.user}</p>
                    <p className="text-sm text-gray-500">{app.event_title}</p>
                  </div>

                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className="border border-gray-200 rounded-2xl px-5 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                  >
                    <option value="pending">Ожидает</option>
                    <option value="approved">Подтверждена</option>
                    <option value="rejected">Отклонена</option>
                    <option value="completed">Посещено</option>
                  </select>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-5">Новый пост</h2>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <input
                  type="text"
                  placeholder="Заголовок поста"
                  className="w-full border border-gray-200 focus:border-blue-500 rounded-2xl px-4 py-3 outline-none"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Содержание поста..."
                  rows={5}
                  className="w-full border border-gray-200 focus:border-blue-500 rounded-3xl px-4 py-3 outline-none resize-y"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-medium transition-all"
                >
                  Опубликовать пост
                </button>
              </form>
            </div>

            <div className="space-y-4">
              {Array.isArray(posts) && posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{post.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {post.author} • {new Date(post.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Имя</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Email</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Рейтинг</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.isArray(users) && users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium">{u.username}</td>
                    <td className="py-4 px-6 text-gray-500">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-amber-600">★ {u.rating_score || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isEditModalOpen && editingEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Редактировать мероприятие</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedData = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  date: formData.get('date') as string,
                  location: formData.get('location') as string,
                  required_volunteers: parseInt(formData.get('required_volunteers') as string),
                };
                handleUpdateEvent(updatedData);
              }}
              className="space-y-4"
            >
              <input
                type="text"
                name="title"
                defaultValue={editingEvent.title}
                placeholder="Название"
                className="w-full border border-gray-200 rounded-xl px-4 py-2"
                required
              />
              <textarea
                name="description"
                defaultValue={editingEvent.description}
                placeholder="Описание"
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2"
                required
              />
              <input
                type="datetime-local"
                name="date"
                defaultValue={editingEvent.date.slice(0, 16)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2"
                required
              />
              <input
                type="text"
                name="location"
                defaultValue={editingEvent.location}
                placeholder="Место"
                className="w-full border border-gray-200 rounded-xl px-4 py-2"
                required
              />
              <input
                type="number"
                name="required_volunteers"
                defaultValue={editingEvent.required_volunteers}
                placeholder="Кол-во волонтёров"
                className="w-full border border-gray-200 rounded-xl px-4 py-2"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
              >
                Сохранить
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}