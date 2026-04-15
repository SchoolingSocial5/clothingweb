export interface OrderItem {
  id?: number;
  _id?: string;
  productName: string;
  product_name?: string;
  productImage: string | null;
  product_image?: string | null;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_address: string | null;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'paid';
  payment_method: 'cash' | 'pos' | 'transfer' | 'online';
  created_at: string;
  receipt_path: string | null;
  receipt_number?: string | null;
  approved_by?: string | null;
  items: OrderItem[];
}
