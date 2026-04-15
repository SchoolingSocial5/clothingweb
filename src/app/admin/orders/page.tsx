"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrderStore } from '@/store/useOrderStore';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import Pagination from '@/components/common/Pagination';
import TableLoader from '@/components/admin/TableLoader';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

import { getImageUrl } from '@/utils/image';

interface OrderItem {
  id?: number;
  _id?: string;
  productName: string;
  productImage: string | null;
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
  approved_by?: string | null;
  items: OrderItem[];
}

const paymentColors: Record<string, string> = {
  unpaid: 'bg-red-50 text-red-500',
  paid: 'bg-green-50 text-green-600',
};

function ItemImage({ item }: { item: OrderItem }) {
  const [error, setError] = useState(false);
  const src = getImageUrl(item.productImage);
  if (src && !error) {
    return (
      <img
        src={src || undefined}
        alt={item.productName}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center text-gray-300">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}

function OrderDetailsModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 px-[10px] md:px-8 py-6 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">{order.customer_name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{order.customer_email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-[10px] md:px-8 py-6 space-y-8">
          {/* Cart Items */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              Order Items
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[10px] font-black">{order.items.length}</span>
            </h4>
            <div className="bg-black text-white rounded-3xl p-4 md:p-6">
              <div className="divide-y divide-white/10">
                {order.items.map((item, idx) => (
                  <div key={item.id || item._id || idx} className="flex items-center gap-4 py-4 px-2">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-neutral-800 flex-shrink-0 border border-white/10">
                      <ItemImage item={item} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm leading-tight truncate">{item.productName}</p>
                      <p className="text-[11px] text-white/50 font-semibold mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-black text-white text-sm flex-shrink-0">
                      ₦{(parseFloat(item.price as any) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fulfillment */}
          {(order.customer_phone || order.delivery_address) && (
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Delivery Info</h4>
              <div className="bg-black text-white rounded-2xl p-4 md:p-6 space-y-5">
                  {order.customer_phone && (
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-50 block mb-1">Phone</label>
                      <p className="text-sm font-bold">{order.customer_phone}</p>
                    </div>
                  )}
                  {order.delivery_address && (
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-50 block mb-1">Address</label>
                      <p className="text-sm font-bold leading-relaxed">{order.delivery_address}</p>
                    </div>
                  )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-black text-white rounded-2xl px-[10px] md:px-6 py-5">
              <span className="text-[10px] font-black uppercase tracking-widest">Total Payment</span>
              <span className="text-xl font-black">₦{parseFloat(order.total_amount as any).toLocaleString()}</span>
            </div>
            {order.approved_by && (
              <div className="flex items-center justify-between bg-gray-50 dark:bg-neutral-800 rounded-2xl px-6 py-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Processed By</span>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{order.approved_by}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PrintSlipModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const handlePrint = () => {
    const items = order.items.map(item =>
      `<div class="row"><span>${item.productName} &times;${item.quantity}</span><span>&#8358;${(parseFloat(item.price as any) * item.quantity).toLocaleString()}</span></div>`
    ).join('');

    const w = window.open('', '_blank', 'width=420,height=680');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt #${order.id}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Courier New',monospace;font-size:13px;padding:24px;color:#111;background:#fff}
  h2{text-align:center;font-size:18px;font-weight:900;letter-spacing:2px;margin-bottom:4px}
  .center{text-align:center;color:#555;font-size:11px;margin-bottom:2px}
  .divider{border:none;border-top:1px dashed #aaa;margin:12px 0}
  .label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px}
  .value{font-weight:700;margin-bottom:8px}
  .row{display:flex;justify-content:space-between;margin:5px 0;font-size:12px}
  .total-row{display:flex;justify-content:space-between;font-weight:900;font-size:15px;margin-top:4px}
  .footer{text-align:center;margin-top:16px;font-size:11px;color:#888}
  .btn{display:block;margin:20px auto 0;padding:10px 32px;background:#000;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;letter-spacing:1px}
  @media print{.btn{display:none}}
</style></head><body>
<h2>RECEIPT</h2>
<p class="center">Order #${order.id}</p>
${order.receipt_number ? `<p class="center">Receipt ID: <strong>${order.receipt_number}</strong></p>` : ''}
<p class="center">${new Date(order.created_at).toLocaleString()}</p>
<hr class="divider">
<div class="label">Customer</div><div class="value">${order.customer_name}</div>
<div class="label">Email</div><div class="value">${order.customer_email}</div>
${order.customer_phone ? `<div class="label">Phone</div><div class="value">${order.customer_phone}</div>` : ''}
${order.delivery_address ? `<div class="label">Delivery Address</div><div class="value">${order.delivery_address}</div>` : ''}
<hr class="divider">
<div class="label">Items</div>
${items}
<hr class="divider">
<div class="total-row"><span>TOTAL</span><span>&#8358;${parseFloat(order.total_amount as any).toLocaleString()}</span></div>
<div class="footer">Thank you for your purchase!</div>
<button class="btn" onclick="window.print()">&#128438; Print</button>
</body></html>`);
    w.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="font-black text-gray-900 dark:text-gray-100">Order Receipt</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Order #{order.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Slip Preview */}
        <div className="px-6 py-5 font-mono text-xs space-y-1 border-b border-dashed border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-800/50">
          <p className="text-center font-black text-sm tracking-widest uppercase mb-1">Receipt</p>
          <p className="text-center text-gray-900 text-[10px] font-black">Order #{order.id}</p>
          {order.receipt_number && (
            <p className="text-center text-[10px] font-black text-gray-500">Receipt ID: <span className="text-black">{order.receipt_number}</span></p>
          )}
          <p className="text-center text-gray-400 text-[10px]">{new Date(order.created_at).toLocaleString()}</p>
          <div className="border-t border-dashed border-gray-300 my-2" />
          <div><span className="text-gray-400 uppercase text-[9px] tracking-widest">Customer</span><p className="font-bold">{order.customer_name}</p></div>
          {order.delivery_address && <div><span className="text-gray-400 uppercase text-[9px] tracking-widest">Address</span><p className="font-bold leading-tight">{order.delivery_address}</p></div>}
          <div className="border-t border-dashed border-gray-300 my-2" />
          {order.items.map((item, idx) => (
            <div key={item.id || item._id || idx} className="flex justify-between">
              <span className="text-gray-700 truncate max-w-[60%]">{item.productName} &times;{item.quantity}</span>
              <span className="font-bold">&#8358;{(parseFloat(item.price as any) * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-dashed border-gray-300 my-2" />
          <div className="flex justify-between font-black text-sm">
            <span>TOTAL</span>
            <span>&#8358;{parseFloat(order.total_amount as any).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiptModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const receiptUrl = getImageUrl(order.receipt_path);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="font-black text-gray-900 dark:text-gray-100">Payment Receipt</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{order.customer_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <img
            src={receiptUrl || undefined}
            alt="Payment Receipt"
            className="w-full rounded-2xl object-contain max-h-[70vh]"
          />
        </div>
        <div className="px-6 pb-6">
          <a
            href={receiptUrl || undefined}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Open in New Tab
          </a>
        </div>
      </div>
    </div>
  );
}

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

  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (token) fetchOrders(1, '', '', '');
  }, [token, fetchOrders]);

  const handleFilter = () => fetchOrders(1, from, to, search);

  const handleClear = () => {
    setFrom('');
    setTo('');
    setSearch('');
    fetchOrders(1, '', '', '');
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
        title="Orders"
        description="Manage and track all customer orders"
        stats={{ label: "Total", value: pagination?.total || 0 }}
      />

      {/* Filter Bar */}
      <div className="mb-4 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm px-5 py-4 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Search</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); fetchOrders(1, from, to, e.target.value); }}
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
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">Select All Orders</span>
        </label>
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Showing {orders.length} of {pagination.total} Orders
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
                  <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Staff</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Payment</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 text-right">Date/Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <svg className="mx-auto mb-4 text-gray-200" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No orders yet</p>
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
                        {order.receipt_path && (
                          <button
                            onClick={e => { e.stopPropagation(); setReceiptOrder(order as any); }}
                            className="p-1.5 bg-gray-100 rounded-lg text-gray-400 hover:text-black hover:bg-gray-200 transition-colors flex-shrink-0"
                            title="View Payment Receipt"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        )}
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
                          <span className="text-[10px] font-black bg-black text-white px-2.5 py-1.5 rounded-lg uppercase tracking-tighter shadow-sm inline-flex items-center gap-1.5">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                            {order.receipt_number}
                          </span>
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
              onPageChange={(page) => fetchOrders(page, from, to, search)}
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
        title="Delete Orders"
        message={`Are you sure you want to delete ${selectedOrderIds.length} selected order${selectedOrderIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
      />

      {/* Order Details Modal */}
      {detailsOrder && <OrderDetailsModal order={detailsOrder} onClose={() => setDetailsOrder(null)} />}

      {/* Receipt Image Modal */}
      {receiptOrder && <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />}

      {/* Print Slip Modal */}
      {printOrder && <PrintSlipModal order={printOrder} onClose={() => setPrintOrder(null)} />}
    </div>
  );
}
