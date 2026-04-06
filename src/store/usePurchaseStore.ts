import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface Purchase {
  id: number;
  product_id: number;
  product_name: string;
  product_category: string;
  quantity: number;
  cost_price: number;
  total_amount: number;
  created_at: string;
}

interface PurchaseState {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  fetchPurchases: () => Promise<void>;
  addPurchase: (data: { product_id: number; quantity: number|string; cost_price: number|string }) => Promise<void>;
}

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  purchases: [],
  loading: false,
  error: null,

  fetchPurchases: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient<Purchase[]>('/admin/purchases');
      set({ purchases: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addPurchase: async (data) => {
    set({ loading: true, error: null });
    try {
      await apiClient('/admin/purchases', {
        method: 'POST',
        body: data,
      });
      await get().fetchPurchases();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
