import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface Position {
  id: string;
  name: string;
  role: string;
  duties: string;
  salary: string;
  created_at: string;
}

interface PositionState {
  positions: Position[];
  loading: boolean;
  error: string | null;
  fetchPositions: () => Promise<void>;
  createPosition: (data: Partial<Position>) => Promise<void>;
  updatePosition: (id: string, data: Partial<Position>) => Promise<void>;
  deletePosition: (id: string) => Promise<void>;
}

export const usePositionStore = create<PositionState>((set, get) => ({
  positions: [],
  loading: false,
  error: null,

  fetchPositions: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient<Position[]>('/admin/positions');
      set({ positions: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createPosition: async (data) => {
    set({ loading: true, error: null });
    try {
      const newPos = await apiClient<Position>('/admin/positions', {
        method: 'POST',
        body: data,
      });
      set({
        positions: [newPos, ...get().positions],
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updatePosition: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedPos = await apiClient<Position>(`/admin/positions/${id}`, {
        method: 'PATCH',
        body: data,
      });
      set({
        positions: get().positions.map((p) => (p.id === id ? updatedPos : p)),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deletePosition: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient(`/admin/positions/${id}`, {
        method: 'DELETE',
      });
      set({
        positions: get().positions.filter((p) => p.id !== id),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
