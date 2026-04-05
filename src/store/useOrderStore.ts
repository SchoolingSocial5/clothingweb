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
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_address: string | null;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'paid';
  receipt_path: string | null;
  receipt_number?: string | null;
  created_at: string;
  items: OrderItem[];
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (id: number, data: Partial<Order>) => Promise<void>;
  deleteOrder: (id: number) => Promise<void>;
  createOrder: (formData: FormData) => Promise<Order>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient<Order[]>('/admin/orders');
      set({ orders: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateOrderStatus: async (id, data) => {
    try {
      const updatedOrder = await apiClient<any>(`/admin/orders/${id}`, {
        method: 'PATCH',
        body: data,
      });
      // Just fetch all orders again to be safe and get the new receipt number
      await get().fetchOrders();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteOrder: async (id) => {
    try {
      await apiClient(`/admin/orders/${id}`, { method: 'DELETE' });
      set({ orders: get().orders.filter((o) => o.id !== id) });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

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
