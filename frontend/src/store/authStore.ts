import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authClient } from '../api/axiosInstance';

interface AuthState {
  access: string | null;
  refresh: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      access: null,
      refresh: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await authClient.post('jwt/create/', { email, password });
        const { access, refresh } = response.data;
        set({ access, refresh, isAuthenticated: true });
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
      },

      register: async (username, email, password) => {
        await authClient.post('users/', { username, email, password });
      },

      logout: () => {
        set({ access: null, refresh: null, isAuthenticated: false });
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      },
    }),
    { name: 'auth-storage' }
  )
);