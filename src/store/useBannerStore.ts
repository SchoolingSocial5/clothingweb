import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface Banner {
  id: number;
  image_url: string;
  title: string;
  subtitle: string;
  category: string;
  order: number;
}

interface BannerState {
  banners: Banner[];
  loading: boolean;
  error: string | null;
  fetchBanners: () => Promise<void>;
  addBanner: (formData: FormData) => Promise<Banner>;
  updateBanner: (id: number, formData: FormData) => Promise<Banner>;
  deleteBanner: (id: number) => Promise<void>;
}

export const useBannerStore = create<BannerState>((set, get) => ({
  banners: [],
  loading: false,
  error: null,

  fetchBanners: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient<Banner[]>('/banners');
      set({ banners: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addBanner: async (formData: FormData) => {
    set({ loading: true, error: null });
    try {
      const banner = await apiClient<Banner>('/admin/banners', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });
      set({ 
        banners: [...get().banners, banner],
        loading: false 
      });
      return banner;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateBanner: async (id: number, formData: FormData) => {
    set({ loading: true, error: null });
    try {
      const banner = await apiClient<Banner>(`/admin/banners/${id}`, {
        method: 'PATCH',
        body: formData,
        isFormData: true,
      });
      set({ 
        banners: get().banners.map(b => b.id === id ? banner : b),
        loading: false 
      });
      return banner;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteBanner: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await apiClient(`/admin/banners/${id}`, { method: 'DELETE' });
      set({ 
        banners: get().banners.filter(b => b.id !== id),
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
