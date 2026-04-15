"use client";
import React from 'react';
import { getImageUrl } from '@/utils/image';
import { Order } from './types';

interface ReceiptModalProps {
  order: Order;
  onClose: () => void;
}

export default function ReceiptModal({ order, onClose }: ReceiptModalProps) {
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
