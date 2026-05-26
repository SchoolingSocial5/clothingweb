import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface EmailTemplate {
  id: string;
  name: string;
  title: string;
  banner?: string;
  content: string;
  createdAt: string;
}

interface EmailTemplateState {
  emailTemplates: EmailTemplate[];
  loading: boolean;
  error: string | null;
  fetchEmailTemplates: () => Promise<void>;
  createEmailTemplate: (formData: FormData) => Promise<EmailTemplate>;
  updateEmailTemplate: (id: string, formData: FormData) => Promise<EmailTemplate>;
  deleteEmailTemplate: (id: string) => Promise<void>;
}

export const useEmailTemplateStore = create<EmailTemplateState>((set, get) => ({
  emailTemplates: [],
  loading: false,
  error: null,

  fetchEmailTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient<EmailTemplate[]>('/admin/email-templates');
      set({ emailTemplates: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createEmailTemplate: async (formData: FormData) => {
    set({ loading: true, error: null });
    try {
      const template = await apiClient<EmailTemplate>('/admin/email-templates', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });
      set({
        emailTemplates: [template, ...get().emailTemplates],
        loading: false,
      });
      return template;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateEmailTemplate: async (id: string, formData: FormData) => {
    set({ loading: true, error: null });
    try {
      const template = await apiClient<EmailTemplate>(`/admin/email-templates/${id}`, {
        method: 'PATCH',
        body: formData,
        isFormData: true,
      });
      set({
        emailTemplates: get().emailTemplates.map((t) => (t.id === id ? template : t)),
        loading: false,
      });
      return template;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteEmailTemplate: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient(`/admin/email-templates/${id}`, { method: 'DELETE' });
      set({
        emailTemplates: get().emailTemplates.filter((t) => t.id !== id),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
