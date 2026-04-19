import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface SocialMediaPlatform {
  id: number;
  name: string;
  url?: string;
  handle?: string;
  icon?: string;
  email?: string;
  phone_number?: string;
}

export interface SocialMediaActivity {
  id: number;
  platform_id: number;
  name: string;
  activity_type: string;
  description?: string;
  followers: number;
  posts_count: number;
  likes_count: number;
  comments_count: number;
  date: string;
  image_url?: string;
  platform?: SocialMediaPlatform;
}

interface SocialMediaState {
  platforms: SocialMediaPlatform[];
  activities: SocialMediaActivity[];
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  createPlatform: (formData: FormData) => Promise<void>;
  updatePlatform: (id: number, formData: FormData) => Promise<void>;
  deletePlatform: (id: number) => Promise<void>;
  createActivity: (formData: FormData) => Promise<void>;
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

  createPlatform: async (formData) => {
    const created = await apiClient<SocialMediaPlatform>('/admin/social-media/platforms', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
    set({ platforms: [...get().platforms, created] });
  },

  updatePlatform: async (id, formData) => {
    const updated = await apiClient<SocialMediaPlatform>(`/admin/social-media/platforms/${id}`, {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
    set({ platforms: get().platforms.map((p) => (p.id === id ? updated : p)) });
  },

  deletePlatform: async (id) => {
    await apiClient(`/admin/social-media/platforms/${id}`, { method: 'DELETE' });
    set({ platforms: get().platforms.filter((p) => p.id !== id) });
  },

  createActivity: async (formData) => {
    const created = await apiClient<SocialMediaActivity>('/admin/social-media/activities', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
    set({ activities: [...get().activities, created] });
  },

  deleteActivity: async (id) => {
    await apiClient(`/admin/social-media/activities/${id}`, { method: 'DELETE' });
    set({ activities: get().activities.filter((a) => a.id !== id) });
  },
}));
