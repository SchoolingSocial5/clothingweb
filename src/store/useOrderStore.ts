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
  unpaidCount: number;
  fetchOrders: (page?: number, from?: string, to?: string, search?: string, paymentStatus?: string, trash?: boolean) => Promise<void>;
  fetchCustomerOrders: () => Promise<void>;
  updateOrderStatus: (id: number, data: Partial<Order>, page?: number, from?: string, to?: string, search?: string, paymentStatus?: string, trash?: boolean) => Promise<void>;
  bulkUpdateStatus: (ids: number[], data: Partial<Order>, page?: number, from?: string, to?: string, search?: string, paymentStatus?: string, trash?: boolean) => Promise<void>;
  bulkDeleteOrders: (ids: number[]) => Promise<void>;
  deleteOrder: (id: number) => Promise<void>;
  restoreOrder: (id: number) => Promise<void>;
  bulkRestoreOrders: (ids: number[]) => Promise<void>;
  deleteOrderPermanent: (id: number) => Promise<void>;
  bulkDeleteOrdersPermanent: (ids: number[]) => Promise<void>;
  createOrder: (formData: FormData) => Promise<Order>;
  toggleOrderSelection: (id: number) => void;
  toggleAllSelection: () => void;
  clearSelection: () => void;
  fetchUnpaidCount: () => Promise<void>;
  setUnpaidCount: (count: number) => void;
  addLiveOrder: (order: any) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  pagination: {
    total: 0,
    page: 1,
    last_page: 1,
    per_page: 20,
  },
  selectedOrderIds: [],
  loading: false,
  error: null,
  unpaidCount: 0,

  fetchOrders: async (page = 1, from = '', to = '', search = '', paymentStatus = '', trash = false) => {
    if (get().orders.length === 0) set({ loading: true });
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (search) params.set('search', search);
      if (paymentStatus) params.set('payment_status', paymentStatus);
      if (trash) params.set('trash', 'true');
      const response = await apiClient<any>(`/admin/orders?${params.toString()}`);
      set({ orders: response.orders, pagination: response.pagination, loading: false, error: null });
      await get().fetchUnpaidCount();
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

  updateOrderStatus: async (id, data, page = 1, from = '', to = '', search = '', paymentStatus = '', trash = false) => {
    try {
      const response = await apiClient<any>(`/admin/orders/${id}`, {
        method: 'PATCH',
        body: data,
      });
      await get().fetchOrders(page, from, to, search, paymentStatus, trash);
      await get().fetchUnpaidCount();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  bulkUpdateStatus: async (ids, data, page = 1, from = '', to = '', search = '', paymentStatus = '', trash = false) => {
    try {
      set({ loading: true });
      await apiClient<any>('/admin/orders/bulk-status', {
        method: 'POST',
        body: { ids, ...data },
      });
      set({ selectedOrderIds: [] }); // Clear selection after bulk action
      await get().fetchOrders(page, from, to, search, paymentStatus, trash);
      await get().fetchUnpaidCount();
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
      await get().fetchUnpaidCount();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteOrder: async (id) => {
    try {
      await apiClient(`/admin/orders/${id}`, { method: 'DELETE' });
      await get().fetchOrders(get().pagination.page);
      await get().fetchUnpaidCount();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  restoreOrder: async (id) => {
    try {
      set({ loading: true });
      await apiClient<any>(`/admin/orders/${id}/restore`, { method: 'POST' });
      await get().fetchOrders(get().pagination.page, '', '', '', '', true);
      await get().fetchUnpaidCount();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  bulkRestoreOrders: async (ids) => {
    try {
      set({ loading: true });
      await apiClient<any>('/admin/orders/bulk-restore', {
        method: 'POST',
        body: { ids },
      });
      set({ selectedOrderIds: [] });
      await get().fetchOrders(get().pagination.page, '', '', '', '', true);
      await get().fetchUnpaidCount();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteOrderPermanent: async (id) => {
    try {
      set({ loading: true });
      await apiClient(`/admin/orders/${id}?permanent=true`, { method: 'DELETE' });
      await get().fetchOrders(get().pagination.page, '', '', '', '', true);
      await get().fetchUnpaidCount();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  bulkDeleteOrdersPermanent: async (ids) => {
    try {
      set({ loading: true });
      await apiClient<any>('/admin/orders/bulk-delete?permanent=true', {
        method: 'DELETE',
        body: { ids },
      });
      set({ selectedOrderIds: [] });
      await get().fetchOrders(get().pagination.page, '', '', '', '', true);
      await get().fetchUnpaidCount();
    } catch (err: any) {
      set({ error: err.message, loading: false });
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

  fetchUnpaidCount: async () => {
    try {
      const response = await apiClient<{ total: number; unpaid: number }>('/admin/orders/count');
      set({ unpaidCount: response.unpaid });
    } catch (err: any) {
      console.error('Failed to fetch unpaid count:', err);
    }
  },

  setUnpaidCount: (count: number) => set({ unpaidCount: count }),

  addLiveOrder: (order: any) => {
    const { orders, pagination, unpaidCount } = get();
    if (orders.some(o => o.id === order.id)) return;
    set({
      orders: [order, ...orders],
      unpaidCount: unpaidCount + 1,
      pagination: {
        ...pagination,
        total: pagination.total + 1
      }
    });
  },
}));
