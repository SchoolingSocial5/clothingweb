import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  phone?: string;
  address?: string;
  role?: string;
  position?: string;
  staffRole?: string;
  staffPosition?: string;
  staffDuties?: string;
  staffSalary?: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchStaff: () => Promise<void>;
  updateUserRole: (id: string, status: string, role?: string) => Promise<void>;
  assignPosition: (userId: string, positionId: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
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


  updateUserRole: async (id, status, role) => {
    set({ loading: true, error: null });
    try {
      const updatedUser = await apiClient<User>(`/admin/users/${id}/role`, {
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

  assignPosition: async (userId, positionId) => {
    set({ loading: true, error: null });
    try {
      const updatedUser = await apiClient<User>(`/admin/users/${userId}/assign-position`, {
        method: 'PATCH',
        body: { positionId },
      });
      set({
        users: get().users.map((u) => (u.id === userId ? updatedUser : u)),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient(`/admin/users/${id}`, {
        method: 'DELETE',
      });
      set({
        users: get().users.filter((u) => u.id !== id),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
