import { create } from 'zustand';
import { apiClient } from '@/utils/api';

import { Order, OrderItem } from '@/components/admin/orders/types';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'admin' | 'customer' | 'user' | 'staff';
  created_at: string;
  orders?: Order[];
  totalOrders: number;
  totalSpent: number;
  orders_count?: number;
  orders_sum_total_amount?: number;
  address?: string;
  positionId?: string;
  staffPosition?: string;
  staffRole?: string;
  staffDuties?: string;
  staffSalary?: string;
}

interface Pagination {
  total: number;
  page: number;
  last_page: number;
  per_page: number;
}

interface CustomerState {
  customers: Customer[];
  pagination: Pagination;
  userOrders: Order[];
  userOrdersPagination: Pagination;
  selectedCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  fetchCustomers: (page?: number, search?: string) => Promise<void>;
  fetchUserOrders: (id: string, page?: number, filters?: { startDate?: string; endDate?: string }) => Promise<void>;
  fetchCustomerDetails: (id: string) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  pagination: { total: 0, page: 1, last_page: 1, per_page: 10 },
  userOrders: [],
  userOrdersPagination: { total: 0, page: 1, last_page: 1, per_page: 10 },
  selectedCustomer: null,
  loading: false,
  error: null,

  fetchCustomers: async (page = 1, search = '') => {
    if (get().customers.length === 0) set({ loading: true });
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set('search', search);
      const data = await apiClient<{ customers: Customer[]; pagination: Pagination }>(`/admin/users/customers?${params}`);
      set({ customers: data.customers, pagination: data.pagination, loading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchUserOrders: async (id, page = 1, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      
      const data = await apiClient<{ orders: Order[]; pagination: Pagination }>(`/admin/users/${id}/orders?${params}`);
      set({ 
        userOrders: data.orders, 
        userOrdersPagination: data.pagination, 
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchCustomerDetails: async (id) => {
    set({ loading: true, error: null, selectedCustomer: null });
    try {
      const data = await apiClient<Customer>(`/admin/users/${id}`);
      set({ selectedCustomer: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateCustomer: async (id, data) => {
    try {
      const updatedCustomer = await apiClient<Customer>(`/admin/users/${id}/role`, {
        method: 'PATCH',
        body: data,
      });
      set({
        customers: get().customers.map((c) => (c.id === id ? { ...c, ...updatedCustomer } : c)),
        selectedCustomer: get().selectedCustomer?.id === id ? { ...get().selectedCustomer!, ...updatedCustomer } : get().selectedCustomer
      });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteCustomer: async (id) => {
    try {
      await apiClient(`/admin/users/${id}`, { method: 'DELETE' });
      set({
        customers: get().customers.filter((c) => c.id !== id),
        selectedCustomer: get().selectedCustomer?.id === id ? null : get().selectedCustomer
      });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
}));
