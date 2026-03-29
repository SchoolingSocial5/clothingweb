import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface SocialMediaPlatform {
  id: number;
  name: string;
  url?: string;
  handle?: string;
  icon?: string;
  is_active: boolean;
  activities?: SocialMediaActivity[];
}

export interface SocialMediaActivity {
  id: number;
  platform_id: number;
  activity_type: string;
  description?: string;
  date: string;
  platform?: SocialMediaPlatform;
}

interface SocialMediaState {
  platforms: SocialMediaPlatform[];
  activities: SocialMediaActivity[];
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  createPlatform: (data: any) => Promise<void>;
  updatePlatform: (id: number, data: any) => Promise<void>;
  deletePlatform: (id: number) => Promise<void>;
  createActivity: (data: any) => Promise<void>;
  deleteActivity: (id: number) => Promise<void>;
}

export const useSocialMediaStore = create<SocialMediaState>((set, get) => ({
  platforms: [],
  activities: [],
  loading: false,
  error: null,

  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const [platforms, activities] = await Promise.all([
        apiClient<SocialMediaPlatform[]>('/admin/social-media/platforms'),
        apiClient<SocialMediaActivity[]>('/admin/social-media/activities'),
      ]);
      set({ platforms, activities, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createPlatform: async (data) => {
    set({ loading: true });
    try {
      const platform = await apiClient<SocialMediaPlatform>('/admin/social-media/platforms', {
        method: 'POST',
        body: data,
      });
      set({ platforms: [...get().platforms, platform], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updatePlatform: async (id, data) => {
    set({ loading: true });
    try {
      const updated = await apiClient<SocialMediaPlatform>(`/admin/social-media/platforms/${id}`, {
        method: 'PUT',
        body: data,
      });
      set({
        platforms: get().platforms.map((p) => (p.id === id ? updated : p)),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deletePlatform: async (id) => {
    set({ loading: true });
    try {
      await apiClient(`/admin/social-media/platforms/${id}`, { method: 'DELETE' });
      set({
        platforms: get().platforms.filter((p) => p.id !== id),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  createActivity: async (data) => {
    set({ loading: true });
    try {
      const activity = await apiClient<SocialMediaActivity>('/admin/social-media/activities', {
        method: 'POST',
        body: data,
      });
      set({ activities: [activity, ...get().activities], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteActivity: async (id) => {
    set({ loading: true });
    try {
      await apiClient(`/admin/social-media/activities/${id}`, { method: 'DELETE' });
      set({
        activities: get().activities.filter((a) => a.id !== id),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
