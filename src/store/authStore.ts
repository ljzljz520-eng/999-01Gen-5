import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminUser } from '../../shared/types';

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  login: (user: AdminUser, token: string) => void;
  logout: () => void;
}

export const useStaffAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'staff-auth-storage' }
  )
);

export const useAdminAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'admin-auth-storage' }
  )
);
