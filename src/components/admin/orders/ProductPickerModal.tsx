"use client";
import React, { useState, useEffect } from 'react';
import { useProductStore, Product as StoreProduct } from '@/store/useProductStore';
import { getImageUrl } from '@/utils/image';

interface ProductPickerModalProps {
  onClose: () => void;
  onAddToCart: (p: StoreProduct) => void;
  onUpdateQty: (id: number, val: number) => void;
  cartItems: any[];
}

export default function ProductPickerModal({ onClose, onAddToCart, onUpdateQty, cartItems }: ProductPickerModalProps) {
  const { products, fetchProducts, loading } = useProductStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-neutral-900 rounded-[40px] w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="px-8 py-6 border-b border-gray-50 dark:border-neutral-800 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black">Add Products to Order</h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
          {loading && Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-16 bg-gray-50 dark:bg-neutral-800 animate-pulse rounded-2xl" />
          ))}
          {!loading && filtered.map(product => {
            const inCart = cartItems.find(item => item.id === product.id);
            return (
              <div 
                key={product.id} 
                className="flex items-center gap-4 py-2 border-b border-gray-50 dark:border-neutral-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-all group px-2"
              >
                <div className="w-[60px] h-[60px] rounded-xl overflow-hidden bg-gray-50 dark:bg-neutral-800 flex-shrink-0">
                  <img 
                    src={getImageUrl(product.image_url) || ''} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{product.name}</h4>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">{product.category}</p>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-sm font-black text-gray-900 dark:text-gray-100">₦{Number(product.price).toLocaleString()}</span>
                  
                  {inCart ? (
                    <div className="flex items-center bg-gray-50 dark:bg-neutral-800 rounded-xl p-1 border border-gray-100 dark:border-neutral-700 animate-in fade-in zoom-in-95 duration-200">
                      <button 
                        onClick={() => onUpdateQty(product.id, -1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      </button>
                      
                      <input
                        type="number"
                        value={inCart.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            onUpdateQty(product.id, val - inCart.quantity);
                          }
                        }}
                        className="w-12 text-center bg-transparent border-none focus:ring-0 font-black text-sm p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />

                      <button 
                        onClick={() => onUpdateQty(product.id, 1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onAddToCart(product)}
                      className="p-2.5 bg-black text-white hover:scale-110 active:scale-95 cursor-pointer rounded-xl transition-all"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
