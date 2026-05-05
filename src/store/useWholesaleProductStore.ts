import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface WholesaleProduct {
  id: number;
  name: string;
  category: string;
  price: string;
  cost_price: string;
  color: string;
  quantity: number;
  image_url?: string;
  description?: string;
  min_order_quantity?: number;
}

interface WholesaleProductState {
  wholesaleProducts: WholesaleProduct[];
  loading: boolean;
  error: string | null;
  fetchWholesaleProducts: () => Promise<void>;
  fetchWholesaleProductById: (id: string) => Promise<WholesaleProduct | null>;
  createWholesaleProduct: (formData: FormData) => Promise<WholesaleProduct>;
  updateWholesaleProduct: (id: number, formData: FormData) => Promise<WholesaleProduct>;
  deleteWholesaleProduct: (id: number) => Promise<void>;
  selectedProductIds: number[];
  toggleProductSelection: (id: number) => void;
  toggleAllProducts: () => void;
  clearProductSelection: () => void;
  bulkDeleteProducts: (ids: number[]) => Promise<void>;
}

export const useWholesaleProductStore = create<WholesaleProductState>((set, get) => ({
  wholesaleProducts: [],
  selectedProductIds: [],
  loading: false,
  error: null,

  fetchWholesaleProducts: async () => {
    if (get().wholesaleProducts.length === 0) set({ loading: true });
    try {
      const data = await apiClient<WholesaleProduct[]>('/wholesale-products');
      set({ wholesaleProducts: data, loading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchWholesaleProductById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient<WholesaleProduct>(`/wholesale-products/${id}`);
      set({ loading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  createWholesaleProduct: async (formData: FormData) => {
    set({ loading: true, error: null });
    try {
      const product = await apiClient<WholesaleProduct>('/wholesale-products', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });
      set({ 
        wholesaleProducts: [product, ...get().wholesaleProducts],
        loading: false 
      });
      return product;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateWholesaleProduct: async (id: number, formData: FormData) => {
    set({ loading: true, error: null });
    try {
      const product = await apiClient<WholesaleProduct>(`/wholesale-products/${id}`, {
        method: 'POST',
        body: formData,
        isFormData: true,
      });
      set({ 
        wholesaleProducts: get().wholesaleProducts.map(p => p.id === id ? product : p),
        loading: false 
      });
      return product;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteWholesaleProduct: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await apiClient(`/wholesale-products/${id}`, { method: 'DELETE' });
      set({ 
        wholesaleProducts: get().wholesaleProducts.filter(p => p.id !== id),
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  toggleProductSelection: (id) => {
    const { selectedProductIds } = get();
    if (selectedProductIds.includes(id)) {
      set({ selectedProductIds: selectedProductIds.filter(pid => pid !== id) });
    } else {
      set({ selectedProductIds: [...selectedProductIds, id] });
    }
  },

  toggleAllProducts: () => {
    const { wholesaleProducts, selectedProductIds } = get();
    if (selectedProductIds.length === wholesaleProducts.length && wholesaleProducts.length > 0) {
      set({ selectedProductIds: [] });
    } else {
      set({ selectedProductIds: wholesaleProducts.map(p => p.id) });
    }
  },

  clearProductSelection: () => set({ selectedProductIds: [] }),

  bulkDeleteProducts: async (ids) => {
    set({ loading: true, error: null });
    try {
      await Promise.all(ids.map(id => apiClient(`/wholesale-products/${id}`, { method: 'DELETE' })));
      set({ 
        wholesaleProducts: get().wholesaleProducts.filter(p => !ids.includes(p.id)),
        selectedProductIds: [],
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
