import { useEffect, useState } from 'react';
import { apiClient } from '../api/axiosInstance';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  required_volunteers: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const accessToken = useAuthStore((state) => state.access);

  const fetchEvents = async (url?: string, params?: Record<string, string>) => {
    setLoading(true);
    try {
      const response = await apiClient.get(url || '/events/', { params });
      const newEvents = response.data.results;
      if (url) {
        setEvents(prev => [...prev, ...newEvents]);
      } else {
        setEvents(newEvents);
      }
      setNextPageUrl(response.data.next);
    } catch (error) {
      console.error('Ошибка загрузки мероприятий:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (nextPageUrl && !loading) {
      fetchEvents(nextPageUrl);
    }
  };

  useEffect(() => {
    const loadFirstPage = async () => {
      setInitialLoading(true);
      setEvents([]);
      setNextPageUrl(null);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (dateFilter) params.date = dateFilter;
      try {
        const response = await apiClient.get('/events/', { params });
        setEvents(response.data.results);
        setNextPageUrl(response.data.next);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    loadFirstPage();
  }, [search, dateFilter]);

  if (initialLoading) {
    return (
      <div>
        <Header />
        <div className="text-center py-20 text-gray-500">Загрузка мероприятий...</div>
      </div>
    );
  }

  return (
    <div>
      <Header />
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
          {events.length === 0 && !loading && (
            <p className="text-gray-500 text-center">Мероприятий не найдено</p>
          )}
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p className="text-gray-600 mt-1">{event.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                <p>{new Date(event.date).toLocaleString()}</p>
                <p>{event.location}</p>
                <p>Требуется волонтёров: {event.required_volunteers}</p>
              </div>
            </div>
          ))}
        </div>

        {loading && <p className="text-center text-gray-500 mt-4">Загрузка...</p>}
        {nextPageUrl && !loading && (
          <div className="text-center mt-6">
            <button
              onClick={loadMore}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              Загрузить ещё
            </button>
          </div>
        )}
      </div>
    </div>
  );
}