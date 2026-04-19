import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface Faq {
  id: number;
  question: string;
  answer: string;
  order: number;
}

interface FaqState {
  faqs: Faq[];
  loading: boolean;
  error: string | null;
  fetchFaqs: () => Promise<void>;
  createFaq: (data: { question: string; answer: string }) => Promise<void>;
  updateFaq: (id: number, data: { question: string; answer: string }) => Promise<void>;
  deleteFaq: (id: number) => Promise<void>;
  bulkDeleteFaqs: (ids: number[]) => Promise<void>;
}

export const useFaqStore = create<FaqState>((set, get) => ({
  faqs: [],
  loading: false,
  error: null,

  fetchFaqs: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient<Faq[]>('/faqs');
      set({ faqs: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createFaq: async (data) => {
    const created = await apiClient<Faq>('/admin/faqs', { method: 'POST', body: JSON.stringify(data) });
    set({ faqs: [...get().faqs, created] });
  },

  updateFaq: async (id, data) => {
    const updated = await apiClient<Faq>(`/admin/faqs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    set({ faqs: get().faqs.map((f) => (f.id === id ? updated : f)) });
  },

  deleteFaq: async (id) => {
    await apiClient(`/admin/faqs/${id}`, { method: 'DELETE' });
    set({ faqs: get().faqs.filter((f) => f.id !== id) });
  },

  bulkDeleteFaqs: async (ids) => {
    await apiClient('/admin/faqs/bulk-delete', { method: 'DELETE', body: JSON.stringify({ ids }) });
    set({ faqs: get().faqs.filter((f) => !ids.includes(f.id)) });
  },
}));
