import { create } from 'zustand';
import { apiClient } from '@/utils/api';

import { Order, OrderItem } from '@/components/admin/orders/types';

interface OrderState {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    last_page: number;
    per_page: number;
  };
  selectedOrderIds: number[];
  loading: boolean;
  error: string | null;
  fetchOrders: (page?: number, from?: string, to?: string, search?: string, paymentStatus?: string) => Promise<void>;
  fetchCustomerOrders: () => Promise<void>;
  updateOrderStatus: (id: number, data: Partial<Order>) => Promise<void>;
  bulkUpdateStatus: (ids: number[], data: Partial<Order>) => Promise<void>;
  bulkDeleteOrders: (ids: number[]) => Promise<void>;
  deleteOrder: (id: number) => Promise<void>;
  createOrder: (formData: FormData) => Promise<Order>;
  toggleOrderSelection: (id: number) => void;
  toggleAllSelection: () => void;
  clearSelection: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  pagination: {
    total: 0,
    page: 1,
    last_page: 1,
    per_page: 10,
  },
  selectedOrderIds: [],
  loading: false,
  error: null,

  fetchOrders: async (page = 1, from = '', to = '', search = '', paymentStatus = '') => {
    if (get().orders.length === 0) set({ loading: true });
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (search) params.set('search', search);
      if (paymentStatus) params.set('payment_status', paymentStatus);
      const response = await apiClient<any>(`/admin/orders?${params.toString()}`);
      set({ orders: response.orders, pagination: response.pagination, loading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchCustomerOrders: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient<Order[]>("/customer/orders");
      set({ orders: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateOrderStatus: async (id, data) => {
    try {
      const response = await apiClient<any>(`/admin/orders/${id}`, {
        method: 'PATCH',
        body: data,
      });
      // The API returns { message, orders } but with pagination it might be different now
      // Let's re-fetch the current page to keep it consistent
      await get().fetchOrders(get().pagination.page);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  bulkUpdateStatus: async (ids, data) => {
    try {
      set({ loading: true });
      await apiClient<any>('/admin/orders/bulk-status', {
        method: 'POST',
        body: { ids, ...data },
      });
      set({ selectedOrderIds: [] }); // Clear selection after bulk action
      await get().fetchOrders(get().pagination.page);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  bulkDeleteOrders: async (ids) => {
    try {
      set({ loading: true });
      await apiClient<any>('/admin/orders/bulk-delete', {
        method: 'DELETE',
        body: { ids },
      });
      set({ selectedOrderIds: [] });
      await get().fetchOrders(get().pagination.page);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteOrder: async (id) => {
    try {
      await apiClient(`/admin/orders/${id}`, { method: 'DELETE' });
      await get().fetchOrders(get().pagination.page);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  toggleOrderSelection: (id) => {
    const { selectedOrderIds } = get();
    if (selectedOrderIds.includes(id)) {
      set({ selectedOrderIds: selectedOrderIds.filter((oid) => oid !== id) });
    } else {
      set({ selectedOrderIds: [...selectedOrderIds, id] });
    }
  },

  toggleAllSelection: () => {
    const { orders, selectedOrderIds } = get();
    if (selectedOrderIds.length === orders.length) {
      set({ selectedOrderIds: [] });
    } else {
      set({ selectedOrderIds: orders.map((o) => o.id) });
    }
  },

  clearSelection: () => set({ selectedOrderIds: [] }),

  createOrder: async (formData: FormData) => {
    set({ loading: true, error: null });
    try {
      const order = await apiClient<Order>('/orders', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });
      set({ loading: false });
      return order;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
