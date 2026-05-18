"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  id: number;
  name: string;
  category: string;
  price: string;
  color: string;
  image_url?: string;
  quantity: number;
  isWholesale?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<any>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("wink-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("wink-cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product: any) => {
    const isAddingWholesale = product.isWholesale || product.category?.toLowerCase() === 'wholesale';
    
    // Check if there are items in the cart to prevent mixing categories
    if (cart.length > 0) {
      const hasWholesale = cart.some(item => item.isWholesale || item.category?.toLowerCase() === 'wholesale');
      const hasRetail = cart.some(item => !item.isWholesale && item.category?.toLowerCase() !== 'wholesale');
      
      if ((isAddingWholesale && hasRetail) || (!isAddingWholesale && hasWholesale)) {
        setPendingProduct(product);
        setModalOpen(true);
        return;
      }
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => String(item.id) === String(product.id));
      if (existingItem) {
        return prevCart.map((item) =>
          String(item.id) === String(product.id) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => String(item.id) !== String(productId)));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        String(item.id) === String(productId) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      getCartTotal, 
      getItemCount,
      totalItems: getItemCount()
    }}>
      {children}
      {modalOpen && pendingProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-md w-full border border-gray-100 dark:border-neutral-800 shadow-2xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4 text-amber-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-2">
              Cart Conflict
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              You cannot mix retail and wholesale products in the same cart. Would you like to clear your cart and add <strong className="text-gray-900 dark:text-white font-bold">"{pendingProduct.name}"</strong> instead?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setPendingProduct(null);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setCart([{ ...pendingProduct, quantity: 1 }]);
                  setModalOpen(false);
                  setPendingProduct(null);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-black/10"
              >
                Clear & Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
