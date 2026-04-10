import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface Purchase {
  id: number;
  product_id: number;
  product_name: string;
  product_category: string;
  product_image: string | null;
  quantity: number;
  cost_price: number;
  total_amount: number;
  created_at: string;
}

interface PurchasePagination {
  total: number;
  page: number;
  last_page: number;
  per_page: number;
}

interface PurchaseState {
  purchases: Purchase[];
  pagination: PurchasePagination;
  loading: boolean;
  error: string | null;
  fetchPurchases: (page?: number, from?: string, to?: string) => Promise<void>;
  addPurchase: (data: { product_id: number; quantity: number|string; cost_price: number|string }) => Promise<void>;
}

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  purchases: [],
  pagination: { total: 0, page: 1, last_page: 1, per_page: 10 },
  loading: false,
  error: null,

  fetchPurchases: async (page = 1, from = '', to = '') => {
    if (get().purchases.length === 0) set({ loading: true });
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const data = await apiClient<{ purchases: Purchase[]; pagination: PurchasePagination }>(
        `/admin/purchases?${params.toString()}`
      );
      set({ purchases: data.purchases, pagination: data.pagination, loading: false });
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
      const { pagination } = get();
      await get().fetchPurchases(pagination.page);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
