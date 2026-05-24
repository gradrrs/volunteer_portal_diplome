import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../api/axiosInstance';
import Header from '../components/Header';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  required_volunteers: number;
}

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await apiClient.get(`/events/${id}/`);
        setEvent(response.data);
      } catch (error) {
        console.error('Ошибка загрузки мероприятия:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return <div><Header /><div className="text-center py-20">Загрузка...</div></div>;
  if (!event) return <div><Header /><div className="text-center py-20">Мероприятие не найдено</div></div>;

  return (
    <div>
      <Header />
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white rounded-3xl shadow-md border p-6 mb-6">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-gray-600 mt-2">{event.description}</p>
          <p className="text-sm text-gray-500 mt-2">{new Date(event.date).toLocaleString()}</p>
          <p className="text-sm text-gray-500">{event.location}</p>
          <p className="text-sm text-gray-500">Требуется волонтёров: {event.required_volunteers}</p>
        </div>
      </div>
    </div>
  );
}