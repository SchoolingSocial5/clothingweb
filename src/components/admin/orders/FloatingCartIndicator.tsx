"use client";
import React from 'react';

interface FloatingCartIndicatorProps {
  count: number;
  total: number;
  onClick: () => void;
}

export default function FloatingCartIndicator({ count, total, onClick }: FloatingCartIndicatorProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-10 right-10 bg-black text-white px-8 py-5 rounded-[30px] shadow-2xl flex items-center gap-6 group hover:scale-105 active:scale-95 transition-all z-[105] animate-in slide-in-from-right-10"
    >
      <div className="relative">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-black">
          {count}
        </span>
      </div>
      <div className="flex flex-col items-start pr-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/50 leading-tight">Proceed to Checkout</span>
        <span className="text-lg font-black leading-tight">₦{total.toLocaleString()}</span>
      </div>
      <div className="bg-white/20 p-2 rounded-xl group-hover:bg-white/30 transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </button>
  );
}
