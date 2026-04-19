import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface Setting {
  id?: string;
  company_name: string;
  domain: string;
  email: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  phone_number: string;
  address: string;
  logo?: string;
  favicon?: string;
  currency_symbol: string;
  show_blog: boolean;
}

interface SettingState {
  settings: Setting | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<Setting | null>;
  updateSettings: (formData: FormData) => Promise<Setting>;
}

export const useSettingStore = create<SettingState>((set, get) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient<Setting>('/settings');
      set({ settings: data, loading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  updateSettings: async (formData: FormData) => {
    set({ loading: true, error: null });
    try {
      const result = await apiClient<Setting>('/admin/settings', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });
      set({ settings: result, loading: false });

      // Trigger local asset updates if applicable
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
      const toAbsolute = (p: string) => p.startsWith('http') ? p : `${apiBase}${p}`;

      if (formData.has('logo') && result.logo) {
        fetch('/api/update-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: toAbsolute(result.logo) }),
        }).catch(() => {});
      }

      if (formData.has('favicon') && result.favicon) {
        fetch('/api/update-favicon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: toAbsolute(result.favicon) }),
        }).catch(() => {});
      }

      return result;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
