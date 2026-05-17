import { useEffect, useState } from 'react';
import { apiClient } from '../api/axiosInstance';
import { useAuthStore } from '../store/authStore';

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
  event: number;
  status: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const accessToken = useAuthStore((state) => state.access);

  useEffect(() => {
    if (!accessToken) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventsRes, appsRes] = await Promise.all([
          apiClient.get('/events/'),
          apiClient.get('/applications/')
        ]);
        setEvents(eventsRes.data);
        setApplications(appsRes.data);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accessToken]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase());
    const matchesDate = dateFilter ? event.date.startsWith(dateFilter) : true;
    return matchesSearch && matchesDate;
  });

  const hasApplication = (eventId: number) => {
    return applications.some(app => app.event === eventId);
  };

  const getApplicationStatus = (eventId: number) => {
    const app = applications.find(app => app.event === eventId);
    return app?.status;
  };

  const handleApply = async (eventId: number) => {
    try {
      const response = await apiClient.post('/applications/', { event: eventId });
      setApplications([...applications, response.data]);
      alert('Заявка подана!');
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.non_field_errors) {
        alert('Вы уже подавали заявку на это мероприятие');
      } else {
        alert('Ошибка при подаче заявки');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Мероприятия</h1>
      
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск по названию"
          className="border p-2 rounded flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredEvents.length === 0 && (
          <p className="text-gray-500 text-center">Мероприятий не найдено</p>
        )}
        
        {filteredEvents.map((event) => {
          const applied = hasApplication(event.id);
          const status = getApplicationStatus(event.id);
          
          return (
            <div key={event.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p className="text-gray-600 mt-1">{event.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                <p>{new Date(event.date).toLocaleString()}</p>
                <p>{event.location}</p>
                <p>Требуется волонтёров: {event.required_volunteers}</p>
              </div>
              
              <div className="mt-3">
                {applied ? (
                  <span className={`inline-block px-3 py-1 rounded text-sm ${
                    status === 'approved' ? 'bg-green-100 text-green-800' :
                    status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    Статус: {
                      status === 'pending' ? 'Ожидает' :
                      status === 'approved' ? 'Подтверждена' :
                      status === 'rejected' ? 'Отклонена' :
                      status === 'completed' ? 'Посещено' : status
                    }
                  </span>
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
          );
        })}
      </div>
    </div>
  );
}