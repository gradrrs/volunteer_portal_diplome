import { useEffect, useState } from 'react';
import { apiClient } from '../api/axiosInstance';
import Header from '../components/Header';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export default function MainPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadPosts = async (url: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get(url);
      const newPosts = response.data.results;
      setPosts(prev => [...prev, ...newPosts]);
      setNextPageUrl(response.data.next);
    } catch (error) {
      console.error('Ошибка загрузки постов:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (nextPageUrl && !loading) {
      loadPosts(nextPageUrl);
    }
  };

  useEffect(() => {
    const fetchFirstPage = async () => {
      setInitialLoading(true);
      try {
        const response = await apiClient.get('/posts/');
        setPosts(response.data.results);
        setNextPageUrl(response.data.next);
      } catch (error) {
        console.error('Ошибка первой загрузки:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchFirstPage();
  }, []);

  if (initialLoading) {
    return (
      <div>
        <Header />
        <div className="flex justify-center py-20">Загрузка постов...</div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Лента постов</h1>
        {posts.map((post) => (
          <div key={post.id} className="border p-4 mb-4 rounded shadow">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-600 text-sm">{post.author} • {new Date(post.created_at).toLocaleString()}</p>
            <p className="mt-2">{post.content}</p>
            <p className="mt-2 text-sm text-gray-500">❤️ {post.likes_count} 💬 {post.comments_count}</p>
          </div>
        ))}
        {loading && <p className="text-center text-gray-500">Загрузка...</p>}
        {nextPageUrl && !loading && (
          <div className="text-center mt-4">
            <button
              onClick={loadMore}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              Загрузить ещё
            </button>
          </div>
        )}
        {!nextPageUrl && posts.length > 0 && (
          <p className="text-center text-gray-400 mt-6">Все посты загружены</p>
        )}
      </div>
    </div>
  );
}