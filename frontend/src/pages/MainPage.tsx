import { useEffect, useState } from 'react';
import { apiClient } from '../api/axiosInstance';

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

  useEffect(() => {
    apiClient.get('/posts/').then((response) => setPosts(response.data));
  }, []);

  return (
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
    </div>
  );
}