import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_customers: number;
  total_sales: number;
  recent_customers: any[];
  recent_orders: any[];
  top_products: any[];
  revenue_by_month: any[];
  // Today's metrics
  today_sales: number;
  today_customers: number;
  today_orders: number;
  today_items_sold: number;
  // Trend fields
  customers_trend: string;
  customers_positive: boolean;
  revenue_trend: string;
  revenue_positive: boolean;
  orders_trend: string;
  orders_positive: boolean;
  sales_trend: string;
  sales_positive: boolean;
}

interface AnalyticsState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchDashboardStats: (from?: string, to?: string) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  stats: null,
  loading: false,
  error: null,

  fetchDashboardStats: async (from = '', to = '') => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const data = await apiClient<DashboardStats>(`/admin/analytics${queryString}`);
      set({ stats: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
