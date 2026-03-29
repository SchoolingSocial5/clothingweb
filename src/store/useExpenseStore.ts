import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface Expense {
  id: number;
  title: string;
  amount: string;
  category: string;
  description?: string;
  date: string;
  receipt_path?: string;
  created_at: string;
}

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  fetchExpenses: () => Promise<void>;
  createExpense: (formData: FormData) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  loading: false,
  error: null,

  fetchExpenses: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient<Expense[]>('/admin/expenses');
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
