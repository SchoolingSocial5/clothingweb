import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface Category {
  id: number;
  name: string;
  created_at?: string;
}

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const data = await apiClient('/categories');
      set({ categories: Array.isArray(data) ? data : [] });
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      set({ loading: false });
    }
  },

  addCategory: async (name: string) => {
    const data = await apiClient('/admin/categories', {
      method: 'POST',
      body: { name },
    });
    set((state) => ({
      categories: [...state.categories, { id: data.id, name }].sort((a, b) => a.name.localeCompare(b.name)),
    }));
  },

  deleteCategory: async (id: number) => {
    await apiClient(`/admin/categories/${id}`, { method: 'DELETE' });
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },
}));
