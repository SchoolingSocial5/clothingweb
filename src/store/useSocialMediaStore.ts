import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface SocialMediaPlatform {
  id: number;
  name: string;
  url?: string;
  handle?: string;
  email?: string;
  password?: string;
  phone_number?: string;
  icon?: string;
  is_active: boolean;
  activities?: SocialMediaActivity[];
}

export interface SocialMediaActivity {
  id: number;
  platform_id: number;
  name: string;
  activity_type: string;
  description?: string;
  image_url?: string;
  followers: number;
  posts_count: number;
  likes_count: number;
  comments_count: number;
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

  createPlatform: async (data: any) => {
    set({ loading: true });
    try {
      const isFormData = data instanceof FormData;
      const platform = await apiClient<SocialMediaPlatform>('/admin/social-media/platforms', {
        method: 'POST',
        body: data,
        isFormData: isFormData,
      });
      set({ platforms: [...get().platforms, platform], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updatePlatform: async (id, data: any) => {
    set({ loading: true });
    try {
      const isFormData = data instanceof FormData;
      // Handle Laravel's PUT method for FormData (use _method spoofing if needed)
      let method: any = 'PUT';
      if (isFormData) {
        method = 'POST';
        if (!data.has('_method')) data.append('_method', 'PUT');
      }

      const updated = await apiClient<SocialMediaPlatform>(`/admin/social-media/platforms/${id}`, {
        method: method,
        body: data,
        isFormData: isFormData,
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

  createActivity: async (data: any) => {
    set({ loading: true });
    try {
      const isFormData = data instanceof FormData;
      const activity = await apiClient<SocialMediaActivity>('/admin/social-media/activities', {
        method: 'POST',
        body: data,
        isFormData: isFormData,
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
