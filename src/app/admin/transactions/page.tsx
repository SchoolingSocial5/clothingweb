"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrderStore } from '@/store/useOrderStore';
import { useProductStore, Product as StoreProduct } from '@/store/useProductStore';
import { useSettings } from '@/context/SettingsContext';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import Pagination from '@/components/common/Pagination';
import TableLoader from '@/components/admin/TableLoader';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import { getImageUrl } from '@/utils/image';
import Toast from '@/components/admin/Toast';

// Extracted Components
import { Order } from '@/components/admin/orders/types';
import OrderDetailsModal from '@/components/admin/orders/OrderDetailsModal';
import PrintSlipModal from '@/components/admin/orders/PrintSlipModal';
import ReceiptModal from '@/components/admin/orders/ReceiptModal';
import ProductPickerModal from '@/components/admin/orders/ProductPickerModal';
import CheckoutModal from '@/components/admin/orders/CheckoutModal';
import FloatingCartIndicator from '@/components/admin/orders/FloatingCartIndicator';

const paymentColors: Record<string, string> = {
  unpaid: 'bg-red-50 text-red-500',
  paid: 'bg-green-50 text-green-600',
};

const paymentMethodColors: Record<string, string> = {
  cash: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  pos: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  transfer: 'bg-purple-50 text-purple-600 border-purple-100',
  online: 'bg-gray-50 text-gray-600 border-gray-100',
};

export default function TransactionsPage() {
  const { token } = useAuth();
  const orders = useOrderStore(state => state.orders);
  const pagination = useOrderStore(state => state.pagination);
  const selectedOrderIds = useOrderStore(state => state.selectedOrderIds);
  const loading = useOrderStore(state => state.loading);
  const fetchOrders = useOrderStore(state => state.fetchOrders);
  const updateOrderStatus = useOrderStore(state => state.updateOrderStatus);
  const bulkUpdateStatus = useOrderStore(state => state.bulkUpdateStatus);
  const toggleOrderSelection = useOrderStore(state => state.toggleOrderSelection);
  const toggleAllSelection = useOrderStore(state => state.toggleAllSelection);

  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  
  // New POS cart state
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleAddToCart = (product: StoreProduct) => {
    const existing = cartItems.find(i => i.id === product.id);
    if (existing) {
      setCartItems(cartItems.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1, price: parseFloat(product.price) }]);
    }
  };

  const updateCartQty = (id: number, delta: number) => {
    setCartItems(prev => prev.map(i => {
      if (i.id === id) {
        const next = i.quantity + delta;
        return next > 0 ? { ...i, quantity: next } : null;
      }
      return i;
    }).filter((i): i is any => i !== null));
  };

  const removeFromCart = (id: number) => {
    setCartItems(cartItems.filter(i => i.id !== id));
  };

  const onOrderCreated = () => {
    setCartItems([]);
    setShowCheckout(false);
    fetchOrders(1, '', '', '', 'paid');
    setToast({ message: 'Order created successfully!', type: 'success' });
  };

  const today = new Date().toISOString().split('T')[0];

  const { settings, refreshSettings } = useSettings();

  useEffect(() => {
    fetchOrders(1, '', '', '', 'paid');
  }, [token, fetchOrders]);

  const handleFilter = () => fetchOrders(1, from, to, search, 'paid');

  const handleClear = () => {
    setFrom('');
    setTo('');
    setSearch('');
    fetchOrders(1, '', '', '', 'paid');
  };

  const updateStatus = async (id: number, field: 'status' | 'payment_status', value: string) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, { [field]: value });
    } catch {}
    setUpdatingId(null);
  };

  const handleBulkUpdate = async (field: 'status' | 'payment_status', value: string) => {
    if (selectedOrderIds.length === 0) return;
    setBulkUpdating(true);
    try {
      await bulkUpdateStatus(selectedOrderIds, { [field]: value });
    } catch {}
    setBulkUpdating(null as any);
  };

  return (
    <div className="p-[10px] md:p-8 w-full">
      <AdminPageHeader
        title="Financial Transactions"
        description="Review and manage paid orders and completed business transactions"
        stats={{ label: "Processed", value: pagination?.total || 0 }}
      >
        <button
          onClick={() => setShowProductPicker(true)}
          className="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-900 transition-all flex items-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Record Order
        </button>
      </AdminPageHeader>

      {/* Filter Bar */}
      <div className="mb-4 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm px-5 py-4 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Search</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); fetchOrders(1, from, to, e.target.value, 'paid'); }}
              placeholder="Name, email, phone, receipt..."
              className="w-full pl-9 pr-9 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100 dark:placeholder-gray-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">From</label>
          <input
            type="date"
            value={from}
            max={to || today}
            onChange={e => setFrom(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">To</label>
          <input
            type="date"
            value={to}
            min={from}
            max={today}
            onChange={e => setTo(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100"
          />
        </div>
        <button
          onClick={handleFilter}
          disabled={!from && !to}
          className="px-5 py-2.5 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Apply
        </button>
        {(from || to) && (
          <button
            onClick={handleClear}
            className="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        )}
        {loading && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black ml-2 self-center" />
        )}
      </div>

      <div className="mb-4 flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
        <label className="flex items-center gap-4 cursor-pointer group">
          <input
            type="checkbox"
            checked={orders.length > 0 && orders.every(o => selectedOrderIds.includes(o.id))}
            onChange={() => toggleAllSelection()}
            className="w-5 h-5 rounded-lg border-gray-200 text-black focus:ring-black cursor-pointer transition-all"
          />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">Select All Records</span>
        </label>
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Showing {orders.length} of {pagination.total} Transactions
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-50 dark:border-neutral-800">
                  <th className="pl-4 py-5 w-10 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">#</th>
                  <th className="px-2 py-5 w-8"></th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Customer</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 text-right">Amount</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 text-center">Receipt ID</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 text-center">Method</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Staff</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Payment</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 text-right">Date/Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && !loading && (
                  <tr>
                    <td colSpan={9} className="px-6 py-20 text-center">
                      <svg className="mx-auto mb-4 text-gray-200" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No transactions yet</p>
                    </td>
                  </tr>
                )}
                {orders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`group hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors cursor-pointer border-b border-gray-50 dark:border-neutral-800 last:border-0 ${updatingId === order.id ? 'opacity-60' : ''}`}
                    onClick={() => setDetailsOrder(order as any)}
                  >
                    <td className="pl-4 py-5 font-black text-gray-400 text-[11px]">
                      {((pagination?.page || 1) - 1) * (pagination?.per_page || 10) + index + 1}
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
                        <div>
                          <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight">{order.customer_name}</p>
                          <p className="text-[11px] text-gray-400">{order.customer_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <span className="font-black text-gray-900 dark:text-gray-100">₦{parseFloat(order.total_amount as any).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-5 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex flex-col items-center gap-1.5">
                        {order.receipt_number ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black bg-black text-white px-2.5 py-1.5 rounded-lg uppercase tracking-tighter shadow-sm inline-flex items-center gap-1.5">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                              {order.receipt_number}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Pending</span>
                        )}
                        {order.payment_status === 'paid' && (
                          <button
                            onClick={() => setPrintOrder(order as any)}
                            className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                            title="Print Order Slip"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="6 9 6 2 18 2 18 9" />
                              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                              <rect x="6" y="14" width="12" height="8" />
                            </svg>
                            Print
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border ${paymentMethodColors[order.payment_method] || paymentMethodColors.online}`}>
                        {order.payment_method === 'transfer' ? 'Trans' : order.payment_method}
                      </span>
                    </td>
                    <td className="px-4 py-5" onClick={e => e.stopPropagation()}>
                      {order.approved_by ? (
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-gray-900 dark:text-gray-100 leading-tight">{order.approved_by}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Approved</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-5" onClick={e => e.stopPropagation()}>
                      {updatingId === order.id ? (
                        <div className="flex items-center gap-2 px-3 py-1.5">
                          <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Updating…</span>
                        </div>
                      ) : (
                        <select
                          value={order.payment_status}
                          onChange={e => updateStatus(order.id, 'payment_status', e.target.value)}
                          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-black transition-all ${paymentColors[order.payment_status]}`}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                        </select>
                      )}
                    </td>
                    <td className="pr-4 py-5 text-right">
                      <div className="text-[10px] uppercase tracking-wider font-bold leading-tight inline-block text-right">
                        <div className="text-black font-black">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-gray-400">{new Date(order.created_at).toLocaleDateString()}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              {loading && <TableLoader colSpan={8} />}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 dark:bg-neutral-800/50 border-t border-gray-100 dark:border-neutral-800">
            <Pagination
              currentPage={pagination?.page || 1}
              totalPages={pagination?.last_page || 1}
              onPageChange={(page) => fetchOrders(page, from, to, search, 'paid')}
            />
          </div>
        </div>

      {/* Bulk Actions */}
      {selectedOrderIds.length > 0 && (
        <div className="mt-8 bg-black text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 ring-1 ring-white/10">
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-lg">
              {selectedOrderIds.length} Selected
            </span>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Actions</span>
              <button onClick={() => handleBulkUpdate('payment_status', 'paid')} disabled={bulkUpdating} className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 bg-white text-black rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 active:scale-95">Mark Paid</button>
              <button onClick={() => handleBulkUpdate('payment_status', 'unpaid')} disabled={bulkUpdating} className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 active:scale-95">Mark Unpaid</button>
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                disabled={bulkUpdating}
                className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                Delete
              </button>
            </div>
          </div>
          <button onClick={() => useOrderStore.getState().clearSelection()} className="text-white/40 hover:text-white transition-all p-2 flex items-center gap-2 group active:scale-90">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Clear</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={() => useOrderStore.getState().bulkDeleteOrders(selectedOrderIds)}
        title="Delete Records"
        message={`Are you sure you want to delete ${selectedOrderIds.length} selected transaction${selectedOrderIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
      />

      {/* Order Details Modal */}
      {detailsOrder && <OrderDetailsModal order={detailsOrder} onClose={() => setDetailsOrder(null)} />}

      {/* Receipt Image Modal */}
      {receiptOrder && <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />}

      {/* Print Slip Modal */}
      {printOrder && <PrintSlipModal order={printOrder} settings={settings} onClose={() => setPrintOrder(null)} />}

      {/* Product Picker Modal */}
      {showProductPicker && (
        <ProductPickerModal 
          onClose={() => setShowProductPicker(false)} 
          onAddToCart={handleAddToCart}
          onUpdateQty={updateCartQty}
          cartItems={cartItems}
        />
      )}

      {showCheckout && (
        <CheckoutModal 
          cartItems={cartItems}
          onClose={() => setShowCheckout(false)}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onOrderCreated={onOrderCreated}
          onError={(msg) => setToast({ message: msg, type: 'error' })}
        />
      )}

      {/* Floating Cart */}
      {cartItems.length > 0 && !showCheckout && (
        <FloatingCartIndicator 
          count={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
          total={cartTotal}
          onClick={() => { setShowProductPicker(false); setShowCheckout(true); }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} visible={!!toast} onClose={() => setToast(null)} />}
    </div>
  );
}
