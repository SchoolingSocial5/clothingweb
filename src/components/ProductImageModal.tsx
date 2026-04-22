"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { formatPrice } from "@/utils/format";
import { getImageUrl } from "@/utils/image";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  color: string;
  quantity: number;
  image_url?: string;
}

interface ProductImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialIndex: number;
}

export default function ProductImageModal({ isOpen, onClose, products, initialIndex }: ProductImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();
  const { settings } = useSettings();

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || products.length === 0) return null;

  const currentProduct = products[currentIndex];
  const cartItem = cart.find(item => item.id === currentProduct.id);
  const isInCart = !!cartItem;
  const resolvedImg = getImageUrl(currentProduct.image_url);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const handleAddToCart = () => {
    if (currentProduct.quantity <= 0) return;
    addToCart(currentProduct);
  };

  const handleIncrement = () => {
    if (cartItem) updateQuantity(currentProduct.id, cartItem.quantity + 1);
  };

  const handleDecrement = () => {
    if (cartItem) {
      if (cartItem.quantity > 1) updateQuantity(currentProduct.id, cartItem.quantity - 1);
      else removeFromCart(currentProduct.id);
    }
  };



  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-300">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
        aria-label="Close modal"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      {/* Navigation - Prev */}
      <button 
        onClick={handlePrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Previous product"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      {/* Navigation - Next */}
      <button 
        onClick={handleNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Next product"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12 overflow-hidden">
        <div className="relative max-w-full max-h-full animate-in fade-in zoom-in duration-500">
          {resolvedImg ? (
            <img 
              src={resolvedImg} 
              alt={currentProduct.name}
              className="max-w-full max-h-[65vh] md:max-h-[85vh] object-contain shadow-2xl rounded-sm transition-all duration-500"
            />
          ) : (
            <div className="w-[400px] h-[600px] bg-neutral-800 rounded-2xl flex items-center justify-center">
              <span className="text-neutral-500 font-bold uppercase tracking-widest">No Image</span>
            </div>
          )}

      </div>

      {/* Floating Product Info & Cart Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[85%] md:w-auto min-w-[280px] bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-700 delay-150 z-[60]">
        <div className="text-center md:text-left">
          <h3 className="text-white font-bold text-lg md:text-xl leading-none">{currentProduct.name}</h3>
          <p className="text-white/60 text-xs font-medium uppercase tracking-wider mt-1.5">
            {currentProduct.category} • {formatPrice(currentProduct.price, settings?.currency_symbol)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isInCart ? (
            <div className="flex items-center gap-4 bg-white/20 rounded-2xl px-2 py-1.5 border border-white/10">
              <button 
                onClick={handleDecrement}
                className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <span className="text-white font-black min-w-[24px] text-center text-lg">{cartItem.quantity}</span>
              <button 
                onClick={handleIncrement}
                className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAddToCart}
              disabled={currentProduct.quantity <= 0}
              className={`px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 cursor-pointer
                ${currentProduct.quantity <= 0 
                  ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-neutral-200 shadow-xl shadow-white/5'
                }`}
            >
              {currentProduct.quantity <= 0 ? "Sold Out" : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
      </div>

      {/* Index indicator */}
      <div className="absolute bottom-4 left-6 text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
        {currentIndex + 1} / {products.length}
      </div>
    </div>
  );
}
