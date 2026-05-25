import { useEffect, useState } from 'react';
import { apiClient } from '../api/axiosInstance';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  required_volunteers: number;
  is_full?: boolean;
}

interface Application {
  id: number;
  event: number;
  status: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const accessToken = useAuthStore((state) => state.access);

  useEffect(() => {
    if (!accessToken) return;
    const fetchData = async () => {
      try {
        const [eventsRes, appsRes] = await Promise.all([
          apiClient.get('/events/'),
          apiClient.get('/applications/')
        ]);
        setEvents(eventsRes.data.results || eventsRes.data);
        setApplications(appsRes.data.results || appsRes.data);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accessToken]);

  const hasApplication = (eventId: number) => {
    return applications.some(app => app.event === eventId);
  };

  const handleApply = async (eventId: number) => {
    try {
      const response = await apiClient.post('/applications/', { event: eventId });
      setApplications([...applications, response.data]);
      alert('✅ Заявка подана!');
    } catch (error: any) {
      console.error('Ошибка подачи заявки:', error);
      const message = error.response?.data?.detail || error.response?.data?.event?.[0] || 'Не удалось подать заявку';
      alert('❌ ' + message);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="flex justify-center py-20">Загрузка мероприятий...</div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Мероприятия</h1>
        {events.length === 0 && <p className="text-gray-500 text-center">Нет мероприятий</p>}
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4 shadow-sm">
              <Link to={`/events/${event.id}`} className="text-xl font-semibold hover:text-blue-600 transition">
                {event.title}
              </Link>
              <p className="text-gray-600 mt-1">{event.description}</p>
              <div className="mt-2 text-sm text-gray-500 flex flex-wrap gap-3">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleString()}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {event.required_volunteers}</span>
              </div>
              <div className="mt-3">
                {event.is_full ? (
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm">Мест нет</span>
                ) : hasApplication(event.id) ? (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">Заявка подана</span>
                ) : (
                  <button
                    onClick={() => handleApply(event.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Записаться
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}