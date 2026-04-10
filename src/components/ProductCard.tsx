"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { useWishlistStore } from "@/store/useWishlistStore";
import { formatPrice } from "@/utils/format";
import { getImageUrl } from "@/utils/image";

interface ProductCardProps {
  id: number;
  name: string;
  category: string;
  price: string;
  color: string;
  quantity: number;
  image_url?: string;
}

export default function ProductCard({ id, name, category, price, color, quantity, image_url }: ProductCardProps) {
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();
  const { settings } = useSettings();
  const { hydrated, hydrate, toggle, isWishlisted } = useWishlistStore();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const cartItem = cart.find(item => item.id === id);
  const isInCart = !!cartItem;
  const resolvedImg = getImageUrl(image_url);
  const showImage = resolvedImg && !imgError;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity <= 0) return;
    addToCart({ id, name, category, price, color, image_url, quantity });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) updateQuantity(id, cartItem.quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      if (cartItem.quantity > 1) updateQuantity(id, cartItem.quantity - 1);
      else removeFromCart(id);
    }
  };

  return (
    <Link href={`/products/${id}`} className={`group flex flex-col ${quantity <= 0 ? 'opacity-70' : ''} transition-colors duration-300`}>
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-neutral-800 mb-3 rounded-xl">
        {/* Sold out badge */}
        {quantity <= 0 && (
          <div className="absolute top-3 left-3 z-20 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black px-3 py-1.5 uppercase tracking-widest rounded-full shadow-xl">
            Sold Out
          </div>
        )}

        {/* Wishlist heart */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id); }}
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur shadow-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          title={isWishlisted(id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisted(id) ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 dark:text-gray-300">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          )}
        </button>

        {/* Product image */}
        {showImage ? (
          <img
            src={resolvedImg}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-100 dark:from-neutral-800 dark:to-neutral-700 group-hover:scale-105 transition-transform duration-700 ease-out" />
        )}

        {/* Mobile: price overlay at bottom of image */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent px-3 pt-6 pb-3 z-10">
          <span className="text-white font-black text-sm drop-shadow">
            {formatPrice(price, settings?.currency_symbol)}
          </span>
        </div>

        {/* Desktop: Quick add on hover */}
        <div className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <button
            onClick={handleAddToCart}
            disabled={quantity <= 0}
            className={`w-full py-3 text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-sm cursor-pointer
              ${quantity <= 0
                ? 'bg-gray-200 dark:bg-neutral-700 text-gray-400 cursor-not-allowed'
                : 'bg-white/90 dark:bg-neutral-900/90 backdrop-blur text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black'
              }`}
          >
            {quantity <= 0 ? "Out of Stock" : "Quick Add"}
          </button>
        </div>
      </div>

      {/* Text section */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:underline underline-offset-2">{name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">{category}</p>
        </div>
        {/* Desktop: price in text row */}
        <p className="hidden md:block font-bold text-sm text-gray-900 dark:text-gray-100 flex-shrink-0">
          {formatPrice(price, settings?.currency_symbol)}
        </p>
      </div>

      {/* Color + cart controls */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div
            className="w-4 h-4 rounded-full border border-gray-200 dark:border-neutral-700 shadow-inner flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-[10px] text-gray-400 capitalize hidden sm:block">{color}</span>
        </div>

        {/* Quantity / cart controls */}
        <div className="flex items-center gap-1 bg-gray-50 dark:bg-neutral-800 rounded-lg p-0.5 border border-gray-100 dark:border-neutral-700">
          {isInCart ? (
            <div className="flex items-center gap-2 px-1">
              <button onClick={handleDecrement} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-neutral-700 text-gray-500 hover:text-black dark:hover:text-white transition-all active:scale-90">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span className="text-xs font-black text-gray-900 dark:text-gray-100 min-w-[12px] text-center">{cartItem.quantity}</span>
              <button onClick={handleIncrement} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-neutral-700 text-gray-500 hover:text-black dark:hover:text-white transition-all active:scale-90">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={quantity <= 0}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-gray-400 hover:text-black dark:hover:text-white transition-all disabled:opacity-30 group/btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover/btn:scale-110 transition-transform"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span className="text-[10px] font-black uppercase tracking-widest pt-0.5">Add</span>
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
