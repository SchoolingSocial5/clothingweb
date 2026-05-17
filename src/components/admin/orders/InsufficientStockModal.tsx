import React from 'react';

interface ShortageItem {
  productName: string;
  available: number;
  required: number;
  shortage: number;
}

interface InsufficientStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  items: ShortageItem[];
}

export default function InsufficientStockModal({
  isOpen,
  onClose,
  customerName,
  items
}: InsufficientStockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8">
          {/* Warning Icon */}
          <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="text-amber-500" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h3 className="text-2xl font-black text-center mb-3 text-gray-900 dark:text-gray-100 uppercase tracking-tight">
            Insufficient Stock
          </h3>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6 px-4">
            Cannot approve order for <span className="font-bold text-gray-800 dark:text-gray-200">{customerName}</span>. Please add more product stock first.
          </p>

          {/* Shortage details */}
          <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl p-5 mb-8 border border-gray-100 dark:border-neutral-800 space-y-4 max-h-[30vh] overflow-y-auto">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Stock Shortage Details
            </h4>
            <div className="divide-y divide-gray-100 dark:divide-neutral-800">
              {items.map((item, index) => (
                <div key={index} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{item.productName}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                      Available: {item.available} / Required: {item.required}
                    </p>
                  </div>
                  <span className="bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 font-bold px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider flex-shrink-0">
                    Shortage: +{item.shortage}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-black uppercase tracking-widest text-xs rounded-2xl active:scale-95 transition-all shadow-lg cursor-pointer"
          >
            Okay, I'll Restock
          </button>
        </div>
      </div>
    </div>
  );
}
