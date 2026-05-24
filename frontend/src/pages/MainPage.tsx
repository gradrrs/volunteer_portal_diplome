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
  user_has_liked: boolean;
}

export default function MainPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiClient.get('/posts/');
        setPosts(response.data.results || response.data);
      } catch (error) {
        console.error('Ошибка загрузки постов:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleLikePost = async (postId: number) => {
    try {
      await apiClient.post('/likes/', { post: postId });
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, likes_count: p.likes_count + 1, user_has_liked: true }
            : p
        )
      );
    } catch (error) {
      console.error('Ошибка лайка поста:', error);
    }
  };

  if (loading) {
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
        {posts.length === 0 && <p className="text-gray-500 text-center">Нет постов</p>}
        {posts.map(post => (
          <div key={post.id} className="border rounded-lg p-4 mb-4 shadow-sm">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-600 text-sm mt-1">{post.author} • {new Date(post.created_at).toLocaleString()}</p>
            <p className="mt-2">{post.content}</p>
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => handleLikePost(post.id)}
                disabled={post.user_has_liked}
                className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-50"
              >
                {post.user_has_liked ? '❤️' : '🤍'} {post.likes_count}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}