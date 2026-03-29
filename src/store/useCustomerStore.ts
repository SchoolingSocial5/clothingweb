import { create } from 'zustand';
import { apiClient } from '@/utils/api';

interface OrderItem {
  id: number;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'paid';
  created_at: string;
  items: OrderItem[];
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: 'admin' | 'customer' | 'user' | 'staff';
  created_at: string;
  orders?: Order[];
  orders_count?: number;
  orders_sum_total_amount?: string | number;
}

interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  fetchCustomerDetails: (id: number) => Promise<void>;
  updateCustomer: (id: number, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,

  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient<Customer[]>('/admin/customers');
      set({ customers: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchCustomerDetails: async (id) => {
    set({ loading: true, error: null, selectedCustomer: null });
    try {
      const data = await apiClient<Customer>(`/admin/customers/${id}`);
      set({ selectedCustomer: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateCustomer: async (id, data) => {
    try {
      const updatedCustomer = await apiClient<Customer>(`/admin/customers/${id}`, {
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
      await apiClient(`/admin/customers/${id}`, { method: 'DELETE' });
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
