"use client";

import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getItemCount } = useCart();

  const subtotal = getCartTotal();
  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + shipping;

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="max-w-[1400px] mx-auto px-8 py-16">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/" className="group flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-medium">
            <svg className="group-hover:-translate-x-1 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Shopping
          </Link>
        </div>

        <h1 className="text-4xl font-black uppercase tracking-tighter mb-12">Your Cart ({getItemCount()})</h1>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
            <svg className="text-gray-200 mb-6" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/" className="bg-black text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-black/20 hover:bg-neutral-800 transition-colors cursor-pointer">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Items List */}
            <div className="lg:col-span-8 space-y-8">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-8 pb-8 border-b border-gray-100 group">
                  <div className="w-32 h-40 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 relative border border-gray-100">
                    <img 
                      src={item.image_url || "/placeholder.png"} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                      </div>
                      <p className="font-bold text-lg">${item.price}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors cursor-pointer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors cursor-pointer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 cursor-pointer"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-gray-50 rounded-3xl p-8 sticky top-32 border border-gray-100">
                <h2 className="text-xl font-bold mb-8">Order Summary</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-bold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className="text-gray-900 font-bold">{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-black">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Link href="/checkout" className="block w-full bg-black text-white py-5 rounded-2xl font-bold shadow-xl shadow-black/10 hover:bg-neutral-800 transition-all active:scale-[0.98] mb-4 text-center cursor-pointer">
                  Checkout Now
                </Link>
                
                <div className="flex flex-col gap-3">
                   <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-white/50 p-3 rounded-xl border border-dashed border-gray-200">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                      Secure checkout powered by VELURE
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
