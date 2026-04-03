"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrderStore } from '@/store/useOrderStore';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

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
  created_at: string;
  receipt_path: string | null;
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-50 text-yellow-600',
  confirmed: 'bg-blue-50 text-blue-600',
  shipped:   'bg-purple-50 text-purple-600',
  delivered: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
};

const paymentColors: Record<string, string> = {
  unpaid: 'bg-red-50 text-red-500',
  paid:   'bg-green-50 text-green-600',
};

export default function OrdersPage() {
  const { token } = useAuth();
  const { orders, loading, fetchOrders, updateOrderStatus } = useOrderStore();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token, fetchOrders]);

  const updateStatus = async (id: number, field: 'status' | 'payment_status', value: string) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, { [field]: value });
    } catch {
      // Error handled by store
    }
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="p-[10px] md:p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="p-[10px] md:p-8 w-full">
      <AdminPageHeader 
        title="Orders" 
        description="Manage and track all customer orders"
        stats={{ label: "Total", value: orders.length }}
      />

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
          <svg className="mx-auto mb-4 text-gray-200" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Order Header Row */}
              <div
                className="flex flex-wrap items-center gap-4 px-8 py-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              >
                {/* Order ID */}
                <div className="font-black text-gray-400 text-sm w-16">#{order.id}</div>

                {/* Customer */}
                <div className="flex-1 min-w-[160px]">
                  <p className="font-bold text-gray-900 leading-tight">{order.customer_name}</p>
                  <p className="text-xs text-gray-400">{order.customer_email}</p>
                </div>

                {/* Items count */}
                <div className="text-sm text-gray-500 font-semibold w-24">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </div>

                {/* Total */}
                <div className="font-black text-gray-900 w-28 text-right">
                  ₦{Number(order.total_amount).toLocaleString()}
                </div>

                {/* Order Status */}
                <select
                  value={order.status}
                  disabled={updatingId === order.id}
                  onClick={e => e.stopPropagation()}
                  onChange={e => updateStatus(order.id, 'status', e.target.value)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-black ${statusColors[order.status]}`}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Payment Status */}
                <select
                  value={order.payment_status}
                  disabled={updatingId === order.id}
                  onClick={e => e.stopPropagation()}
                  onChange={e => updateStatus(order.id, 'payment_status', e.target.value)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-black ${paymentColors[order.payment_status]}`}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>

                {/* Date */}
                <div className="text-xs text-gray-400 font-medium w-24 text-right">
                  {new Date(order.created_at).toLocaleDateString()}
                </div>

                {/* Expand arrow */}
                <svg
                  className={`text-gray-400 transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`}
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {/* Expanded Products */}
              {expandedId === order.id && (
                <div className="border-t border-gray-100 bg-gray-50/50 px-8 py-6 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Order Items</h4>
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-5 bg-white rounded-xl p-4 border border-gray-100">
                      {/* Product image */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                        {item.product_image ? (
                          <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                          </div>
                        )}
                      </div>
                      {/* Name */}
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{item.product_name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      {/* Price */}
                      <p className="font-black text-gray-900">₦{(Number(item.price) * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}

                  {/* Delivery & Payment Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-12">
                    {(order.delivery_address || order.customer_phone) && (
                      <div className="text-sm text-gray-500 space-y-1">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Delivery Details</h5>
                        {order.customer_phone && <p><span className="font-bold text-gray-700">Phone:</span> {order.customer_phone}</p>}
                        {order.delivery_address && <p><span className="font-bold text-gray-700">Address:</span> {order.delivery_address}</p>}
                      </div>
                    )}
                    
                    {order.receipt_path && (
                      <div className="text-sm space-y-3">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Receipt</h5>
                        <a 
                          href={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '')}/storage/${order.receipt_path}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="group block relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-black transition-colors bg-white"
                        >
                          <img 
                            src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '')}/storage/${order.receipt_path}`} 
                            alt="Receipt" 
                            className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                          </div>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
