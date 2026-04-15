"use client";
import React from 'react';
import { Order } from './types';
import ItemImage from './ItemImage';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
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
