interface ProductCardProps {
  name: string;
  category: string;
  price: string;
  color: string;
  quantity: number;
  image_url?: string;
}

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { formatPrice } from "@/utils/format";

export default function ProductCard({ id, name, category, price, color, quantity, image_url }: ProductCardProps & { id: number }) {
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();
  const { settings } = useSettings();
  const [isAdding, setIsAdding] = useState(false);

  // Find if item is in cart
  const cartItem = cart.find(item => item.id === id);
  const isInCart = !!cartItem;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity <= 0) return;
    setIsAdding(true);
    addToCart({ id, name, category, price, color, image_url, quantity });
    setTimeout(() => setIsAdding(false), 1000);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(id, cartItem.quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      if (cartItem.quantity > 1) {
        updateQuantity(id, cartItem.quantity - 1);
      } else {
        removeFromCart(id);
      }
    }
  };

  return (
    <div className={`group cursor-pointer flex flex-col ${quantity <= 0 ? 'opacity-70' : ''} transition-colors duration-300`}>
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-neutral-800 mb-5">
        {quantity <= 0 && (
          <div className="absolute top-4 left-4 z-20 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black px-3 py-1.5 uppercase tracking-widest rounded-full shadow-xl">
            Sold Out
          </div>
        )}
        {/* Product Image or Placeholder */}
        {image_url ? (
          <img
            src={(() => {
              const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
              if (image_url.startsWith('http')) {
                // Normalize old localhost URLs that might have wrong port
                return image_url.replace(/^http:\/\/localhost(?::\d+)?\//, `${base}/`);
              }
              return `${base}${image_url.startsWith('/') ? '' : '/'}${image_url}`;
            })()}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-100 dark:from-neutral-800 dark:to-neutral-900 group-hover:scale-105 transition-transform duration-700 ease-out"></div>
        )}
        
        {/* Quick add button on hover */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button 
            onClick={handleAddToCart}
            disabled={quantity <= 0}
            className={`w-full py-3 ${quantity <= 0 ? 'bg-gray-200 dark:bg-neutral-700 text-gray-400 dark:text-neutral-500 cursor-not-allowed' : isAdding ? "bg-black dark:bg-white text-white dark:text-black" : "bg-white/90 dark:bg-neutral-900/90 backdrop-blur text-black dark:text-white"} text-xs font-bold tracking-widest uppercase hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 shadow-sm cursor-pointer`}
          >
            {quantity <= 0 ? "Out of Stock" : isAdding ? "Added!" : "Quick Add"}
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">{name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{category}</p>
        </div>
        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{formatPrice(price, settings?.currency_symbol)}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1 items-center">
          <div className="w-4 h-4 rounded-full border border-gray-200 dark:border-neutral-700 shadow-inner" style={{ backgroundColor: color }}></div>
        </div>
        
        {/* Quantity Controls */}
        <div className="flex items-center gap-1 bg-gray-50 dark:bg-neutral-800 rounded-lg p-0.5 border border-gray-100 dark:border-neutral-700">
          {isInCart ? (
            <div className="flex items-center gap-2 px-1">
              <button 
                onClick={handleDecrement}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-neutral-700 text-gray-500 hover:text-black dark:hover:text-white transition-all active:scale-90"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <span className="text-xs font-black text-gray-900 dark:text-gray-100 min-w-[12px] text-center">{cartItem.quantity}</span>
              <button 
                onClick={handleIncrement}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-neutral-700 text-gray-500 hover:text-black dark:hover:text-white transition-all active:scale-90"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAddToCart}
              disabled={quantity <= 0}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-gray-400 hover:text-black dark:hover:text-white transition-all disabled:opacity-30 group/btn"
              title="Add to cart"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover/btn:scale-110 transition-transform"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span className="text-[10px] font-black uppercase tracking-widest pt-0.5">Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
