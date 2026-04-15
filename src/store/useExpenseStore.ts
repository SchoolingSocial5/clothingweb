import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface Expense {
  id: number;
  title: string;
  amount: string;
  category: string;
  description?: string;
  date: string;
  receipt_url?: string;
  recorded_by?: string;
  created_at: string;
}

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  fetchExpenses: (from?: string, to?: string) => Promise<void>;
  createExpense: (formData: FormData) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  loading: false,
  error: null,

  fetchExpenses: async (from = '', to = '') => {
    if (get().expenses.length === 0) set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await apiClient<Expense[]>(`/admin/expenses${query}`);
      set({ expenses: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createExpense: async (formData) => {
    set({ loading: true, error: null });
    try {
      const newExpense = await apiClient<Expense>('/admin/expenses', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });
      set({
        expenses: [newExpense, ...get().expenses],
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteExpense: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient(`/admin/expenses/${id}`, { method: 'DELETE' });
      set({
        expenses: get().expenses.filter((e) => e.id !== id),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
