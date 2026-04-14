import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface User {
  id: number;
  name: string;
  email: string;
  status: 'user' | 'staff' | 'admin';
  role?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchStaff: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
  updateUserRole: (id: number, status: string, role?: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient<User[]>('/admin/users');
      set({ users: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchStaff: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient<User[]>('/admin/users/staff');
      set({ users: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient<User[]>('/admin/users/customers');
      set({ users: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateUserRole: async (id, status, role) => {
    set({ loading: true, error: null });
    try {
      const { user: updatedUser } = await apiClient<{user: User}>(`/admin/users/${id}/role`, {
        method: 'PATCH',
        body: { status, role },
      });
      set({
        users: get().users.map((u) => (u.id === id ? updatedUser : u)),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
