import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  cost_price: string;
  color: string;
  quantity: number;
  image_url?: string;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  createProduct: (formData: FormData) => Promise<Product>;
  updateProduct: (id: number, formData: FormData) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient<Product[]>('/products');
      set({ products: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createProduct: async (formData: FormData) => {
    set({ loading: true, error: null });
    try {
      const product = await apiClient<Product>('/products', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });
      set({ 
        products: [product, ...get().products],
        loading: false 
      });
      return product;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateProduct: async (id: number, formData: FormData) => {
    set({ loading: true, error: null });
    try {
      const product = await apiClient<Product>(`/products/${id}`, {
        method: 'POST', // Laravel requires POST with _method=PUT for multipart/form-data
        body: formData,
        isFormData: true,
      });
      set({ 
        products: get().products.map(p => p.id === id ? product : p),
        loading: false 
      });
      return product;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteProduct: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await apiClient(`/products/${id}`, { method: 'DELETE' });
      set({ 
        products: get().products.filter(p => p.id !== id),
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
