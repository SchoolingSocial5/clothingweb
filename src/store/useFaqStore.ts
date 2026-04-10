import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface Faq {
  id: number;
  question: string;
  answer: string;
  order: number;
  created_at: string;
}

interface FaqStore {
  faqs: Faq[];
  loading: boolean;
  fetchFaqs: () => Promise<void>;
  createFaq: (data: { question: string; answer: string }) => Promise<void>;
  updateFaq: (id: number, data: { question: string; answer: string }) => Promise<void>;
  deleteFaq: (id: number) => Promise<void>;
  bulkDeleteFaqs: (ids: number[]) => Promise<void>;
}

export const useFaqStore = create<FaqStore>((set, get) => ({
  faqs: [],
  loading: false,

  fetchFaqs: async () => {
    if (get().faqs.length === 0) set({ loading: true });
    try {
      const data = await apiClient('/admin/faqs');
      set({ faqs: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createFaq: async (data) => {
    const faq = await apiClient('/admin/faqs', { method: 'POST', body: data });
    set((s) => ({ faqs: [...s.faqs, faq] }));
  },

  updateFaq: async (id, data) => {
    const faq = await apiClient(`/admin/faqs/${id}`, { method: 'PUT', body: data });
    set((s) => ({ faqs: s.faqs.map((f) => (f.id === id ? faq : f)) }));
  },

  deleteFaq: async (id) => {
    await apiClient(`/admin/faqs/${id}`, { method: 'DELETE' });
    set((s) => ({ faqs: s.faqs.filter((f) => f.id !== id) }));
  },

  bulkDeleteFaqs: async (ids) => {
    await apiClient('/admin/faqs', { method: 'DELETE', body: JSON.stringify({ ids }) });
    set((s) => ({ faqs: s.faqs.filter((f) => !ids.includes(f.id)) }));
  },
}));
