"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCustomerStore } from '@/store/useCustomerStore';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-600',
  confirmed: 'bg-blue-50 text-blue-600',
  shipped: 'bg-purple-50 text-purple-600',
  delivered: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
};

const paymentColors: Record<string, string> = {
  unpaid: 'bg-red-50 text-red-500',
  paid: 'bg-green-50 text-green-600',
};

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const { selectedCustomer, loading, fetchCustomerDetails } = useCustomerStore();
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (token && id) {
      fetchCustomerDetails(Number(id));
    }
  }, [token, id, fetchCustomerDetails]);

  if (loading && !selectedCustomer) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!selectedCustomer && !loading) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Customer not found</h2>
        <Link href="/admin/customers" className="text-black font-bold underline">Back to Customers</Link>
      </div>
    );
  }

  const orders = selectedCustomer?.orders || [];
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      {/* Back Link */}
      <Link href="/admin/customers" className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-medium mb-8 group w-fit cursor-pointer">
        <svg className="group-hover:-translate-x-1 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Customers
      </Link>

      {/* Customer Header */}
      <div className="flex flex-wrap items-end justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-black text-white flex items-center justify-center text-3xl font-black">
            {selectedCustomer?.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-black uppercase tracking-tighter">{selectedCustomer?.name}</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedCustomer?.status === 'admin' || selectedCustomer?.status === 'staff' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                }`}>
                {selectedCustomer?.status}
              </span>
            </div>
            <p className="text-gray-500 font-medium flex items-center gap-4">
              <span>{selectedCustomer?.email}</span>
              {selectedCustomer?.phone && (
                <>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-gray-900 font-bold">{selectedCustomer.phone}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 min-w-[140px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Spent</p>
            <p className="text-2xl font-black">₦{totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 min-w-[140px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Orders</p>
            <p className="text-2xl font-black text-center">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="space-y-6">
        <h2 className="text-xl font-black uppercase tracking-tight border-b border-gray-100 pb-4">Order History</h2>

        {orders.length === 0 ? (
          <div className="py-20 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No orders placed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div
                  className="flex flex-wrap items-center gap-6 px-8 py-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                >
                  <div className="w-16 font-black text-gray-400 text-sm">#{order.id}</div>
                  <div className="flex-1 font-bold text-gray-900">
                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="w-28 text-right font-black text-gray-900">
                    ₦{Number(order.total_amount).toLocaleString()}
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${statusColors[order.status]}`}>
                    {order.status}
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${paymentColors[order.payment_status]}`}>
                    {order.payment_status}
                  </div>
                  <svg
                    className={`text-gray-400 transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`}
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>

                {expandedOrderId === order.id && (
                  <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100">
                        <div className="w-12 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{item.product_name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <div className="font-black text-sm">₦{(item.price * item.quantity).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
