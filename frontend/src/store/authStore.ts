import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authClient, apiClient } from '../api/axiosInstance';

interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  is_staff: boolean;
  date_joined?: string;
}



interface AuthState {
  access: string | null;
  refresh: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      access: null,
      refresh: null,
      user: null,
      isAuthenticated: false,

      login: async (username, password) => {
        const response = await authClient.post('jwt/create/', { username, password });
        const { access, refresh } = response.data;

        const userResponse = await authClient.get('users/me/', {
          headers: { Authorization: `Bearer ${access}` }
        });

        set({ 
          access, 
          refresh, 
          user: userResponse.data,
          isAuthenticated: true 
        });
        
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
      },

      register: async (username, email, password) => {
        await authClient.post('users/', { username, email, password });
      },

      logout: () => {
        set({ access: null, refresh: null, user: null, isAuthenticated: false });
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      },

      fetchUser: async () => {
        const { access } = get();
        if (!access) return;
        try {
          const response = await apiClient.get('/users/me/');
          set({ user: response.data });
        } catch (error) {
          console.error('Ошибка загрузки пользователя:', error);
          get().logout();
        }
      },
    }),
    { name: 'auth-storage' }
  )
);