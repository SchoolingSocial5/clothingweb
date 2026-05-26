import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  content: string;
  isUserRead: boolean;
  isAdminRead: boolean;
  createdAt: string;
}

interface NotificationTemplateState {
  notificationTemplates: NotificationTemplate[];
  loading: boolean;
  error: string | null;
  fetchNotificationTemplates: () => Promise<void>;
  createNotificationTemplate: (data: Partial<NotificationTemplate>) => Promise<NotificationTemplate>;
  updateNotificationTemplate: (id: string, data: Partial<NotificationTemplate>) => Promise<NotificationTemplate>;
  deleteNotificationTemplate: (id: string) => Promise<void>;
}

export const useNotificationTemplateStore = create<NotificationTemplateState>((set, get) => ({
  notificationTemplates: [],
  loading: false,
  error: null,

  fetchNotificationTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient<NotificationTemplate[]>('/admin/notification-templates');
      set({ notificationTemplates: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createNotificationTemplate: async (data: Partial<NotificationTemplate>) => {
    set({ loading: true, error: null });
    try {
      const template = await apiClient<NotificationTemplate>('/admin/notification-templates', {
        method: 'POST',
        body: data,
      });
      set({
        notificationTemplates: [template, ...get().notificationTemplates],
        loading: false,
      });
      return template;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateNotificationTemplate: async (id: string, data: Partial<NotificationTemplate>) => {
    set({ loading: true, error: null });
    try {
      const template = await apiClient<NotificationTemplate>(`/admin/notification-templates/${id}`, {
        method: 'PATCH',
        body: data,
      });
      set({
        notificationTemplates: get().notificationTemplates.map((t) => (t.id === id ? template : t)),
        loading: false,
      });
      return template;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteNotificationTemplate: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient(`/admin/notification-templates/${id}`, { method: 'DELETE' });
      set({
        notificationTemplates: get().notificationTemplates.filter((t) => t.id !== id),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
