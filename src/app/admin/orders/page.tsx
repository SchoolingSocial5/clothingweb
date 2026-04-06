"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrderStore } from '@/store/useOrderStore';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import Pagination from '@/components/common/Pagination';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '');

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
  receipt_number?: string | null;
  items: OrderItem[];
}

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

export default function OrdersPage() {
  const { token } = useAuth();
  const {
    orders,
    pagination,
    selectedOrderIds,
    loading,
    fetchOrders,
    updateOrderStatus,
    bulkUpdateStatus,
    toggleOrderSelection,
    toggleAllSelection
  } = useOrderStore();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);

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

  const handleBulkUpdate = async (field: 'status' | 'payment_status', value: string) => {
    if (selectedOrderIds.length === 0) return;
    setBulkUpdating(true);
    try {
      await bulkUpdateStatus(selectedOrderIds, { [field]: value });
    } catch {
      // Error handled by store
    }
    setBulkUpdating(null as any);
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
        stats={{ label: "Total", value: pagination.total }}
      />


      <div className="mb-4 flex items-center justify-between px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <label className="flex items-center gap-4 cursor-pointer group">
          <input
            type="checkbox"
            checked={orders.length > 0 && orders.every(o => selectedOrderIds.includes(o.id))}
            onChange={() => toggleAllSelection()}
            className="w-5 h-5 rounded-lg border-gray-200 text-black focus:ring-black cursor-pointer transition-all"
          />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">Select All Orders</span>
        </label>

        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Showing {orders.length} of {pagination.total} Orders
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
          <svg className="mx-auto mb-4 text-gray-200" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No orders yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pl-4 py-5 w-10 text-[10px] font-black uppercase tracking-widest text-gray-400">#</th>
                <th className="px-2 py-5 w-8"></th>
                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Amount</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Receipt ID</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Payment</th>
                <th className="pr- link:pr-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Date/Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <>
                  <tr
                    key={order.id}
                    className={`group hover:bg-gray-50/50 transition-colors cursor-pointer ${expandedId === order.id ? 'bg-gray-50/50' : ''}`}
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    <td className="pl-4 py-5 font-black text-gray-400 text-[11px]">
                      {(pagination.page - 1) * pagination.per_page + index + 1}
                    </td>
                    <td className="px-2 py-5" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                        className="w-5 h-5 rounded-lg border-gray-200 text-black focus:ring-black cursor-pointer transition-all"
                      />
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        {order.receipt_path && (
                          <a
                            href={`${BASE_URL}${order.receipt_path.startsWith('/') ? '' : '/'}${order.receipt_path}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="p-1.5 bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-colors"
                            title="View Receipt"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </a>
                        )}
                        <div>
                          <p className="font-bold text-gray-900 leading-tight">{order.customer_name}</p>
                          <p className="text-[11px] text-gray-400">{order.customer_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <span className="font-black text-gray-900">₦{Number(order.total_amount).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      {order.receipt_number ? (
                        <span className="text-[10px] font-black bg-black text-white px-2.5 py-1.5 rounded-lg uppercase tracking-tighter shadow-sm inline-flex items-center gap-1.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"></path></svg>
                          {order.receipt_number}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-5" onClick={e => e.stopPropagation()}>
                      <select
                        value={order.payment_status}
                        disabled={updatingId === order.id}
                        onChange={e => updateStatus(order.id, 'payment_status', e.target.value)}
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-black transition-all ${paymentColors[order.payment_status]}`}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>
                    <td className="pr-4 py-5 text-right">
                      <div className="text-[10px] uppercase tracking-wider font-bold leading-tight inline-block text-right">
                        <div className="text-black font-black">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-gray-400">{new Date(order.created_at).toLocaleDateString()}</div>
                      </div>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr className="bg-gray-50/50 border-t border-gray-100">
                      <td colSpan={7} className="px-8 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                              Ordered Items
                              <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md">{order.items.length}</span>
                            </h4>
                            <div className="space-y-3">
                              {order.items.map(item => (
                                <div key={item.id} className="flex items-center gap-5 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm transition-transform hover:scale-[1.01]">
                                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                    {item.product_image ? (
                                      <img
                                        src={item.product_image.startsWith('http') ? item.product_image : `${BASE_URL}${item.product_image.startsWith('/') ? '' : '/'}${item.product_image}`}
                                        alt={item.product_name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-bold text-gray-900 leading-tight mb-0.5">{item.product_name}</p>
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="font-black text-gray-900">₦{(Number(item.price) * item.quantity).toLocaleString()}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-8">
                            <div>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Fulfillment Details</h4>
                              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
                                {(order.delivery_address || order.customer_phone) ? (
                                  <div className="grid grid-cols-2 gap-8">
                                    {order.customer_phone && (
                                      <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Phone Number</label>
                                        <p className="text-sm font-bold text-gray-900">{order.customer_phone}</p>
                                      </div>
                                    )}
                                    {order.delivery_address && (
                                      <div className="col-span-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Shipping Address</label>
                                        <p className="text-sm font-bold text-gray-900 leading-relaxed">{order.delivery_address}</p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 italic text-gray-300 text-xs">No delivery information provided</div>
                                )}
                              </div>
                            </div>

                            {order.receipt_path && (
                              <div className="hidden lg:block">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Payment Verification</h4>
                                <a
                                  href={`${BASE_URL}${order.receipt_path.startsWith('/') ? '' : '/'}${order.receipt_path}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="group block relative w-full h-48 rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm ring-1 ring-black/5 hover:ring-black transition-all"
                                >
                                  <img
                                    src={`${BASE_URL}${order.receipt_path.startsWith('/') ? '' : '/'}${order.receipt_path}`}
                                    alt="Receipt"
                                    className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-40 transition-all duration-700"
                                  />
                                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-black text-white p-3 rounded-2xl shadow-xl">
                                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest mt-3 text-black">Open in New Tab</span>
                                  </div>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          </div>

          <div className="bg-gray-50 border-t border-gray-100">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.last_page}
              onPageChange={(page) => fetchOrders(page)}
            />
          </div>
        </div>
      )}

      {/* Bulk Actions Toolbar - Positioned below table */}
      {selectedOrderIds.length > 0 && (
        <div className="mt-8 bg-black text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 ring-1 ring-white/10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-lg">
                {selectedOrderIds.length} Selected
              </span>
            </div>

            <div className="h-6 w-px bg-white/10"></div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Actions</span>
              <button
                onClick={() => handleBulkUpdate('payment_status', 'paid')}
                disabled={bulkUpdating}
                className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 bg-white text-black rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 active:scale-95"
              >
                Mark Paid
              </button>
              <button
                onClick={() => handleBulkUpdate('payment_status', 'unpaid')}
                disabled={bulkUpdating}
                className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 active:scale-95"
              >
                Mark Unpaid
              </button>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedOrderIds.length} orders? This action cannot be undone.`)) {
                    useOrderStore.getState().bulkDeleteOrders(selectedOrderIds);
                  }
                }}
                disabled={bulkUpdating}
                className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                Delete
              </button>
            </div>
          </div>

          <button
            onClick={() => useOrderStore.getState().clearSelection()}
            className="text-white/40 hover:text-white transition-all p-2 flex items-center gap-2 group active:scale-90"
            title="Clear selection"
          >
            <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Clear</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      )}
    </div>
  );
}

