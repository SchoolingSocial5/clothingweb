"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import PaymentConfirmModal from '@/components/PaymentConfirmModal';
import { useOrderStore } from '@/store/useOrderStore';
import { useSettings } from '@/context/SettingsContext';
import { formatPrice } from '@/utils/format';
import { getImageUrl } from '@/utils/image';

interface Settings {
  company_name: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  phone_number: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart, updateQuantity } = useCart();
  const { user, login } = useAuth();
  const { settings: globalSettings, refreshSettings: fetchSettings } = useSettings();
  const { createOrder, loading: submitting, error: storeError } = useOrderStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const settings = globalSettings;
  const [orderId, setOrderId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    password: '',
  });

  const subtotal = getCartTotal();
  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + shipping;

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: user.phone || prev.customer_phone,
        delivery_address: user.address || prev.delivery_address,
      }));
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) { setError('Your cart is empty'); return; }
    setError('');
    if (!settings && !globalSettings) {
      setError('Loading payment configuration... Please wait a moment and try again.');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmOrder = async (receipt: File) => {
    const formData = new FormData();
    formData.append('customer_name', form.customer_name);
    formData.append('customer_phone', form.customer_phone);
    formData.append('delivery_address', form.delivery_address);
    if (!user) {
      formData.append('customer_email', form.customer_email);
      if (form.password) formData.append('password', form.password);
    } else {
      formData.append('customer_email', user.email);
    }
    formData.append('total_amount', total.toString());
    formData.append('items', JSON.stringify(cart.map(item => ({
      productId: item.id,
      productName: item.name,
      productImage: item.image_url,
      price: parseFloat(item.price as any),
      quantity: item.quantity
    }))));
    formData.append('receipt', receipt);
    try {
      const response = await createOrder(formData) as any;
      setOrderId(response.id);
      if (response.auth) login(response.auth.access_token, response.auth.user);
      setDone(true);
      clearCart();
    } catch {}
  };

  const inputCls = "w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all";
  const labelCls = "text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-2";

  if (done) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
        <Header />
        <div className="max-w-xl mx-auto px-4 md:px-8 py-32 text-center">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="text-green-500" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 mb-3">Order Successful!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">We have received your order details and payment submission.</p>
          <p className="text-gray-500 dark:text-gray-400 mb-10">You can now relax. We will notify you once your order is confirmed.</p>
          {settings && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 text-left mb-10 border border-gray-100 dark:border-neutral-800">
              <h3 className="font-black uppercase tracking-widest text-xs text-gray-400 dark:text-gray-500 mb-5">Payment Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 dark:text-gray-400">Account Number</span>
                  <span className="font-black text-2xl tracking-widest text-gray-900 dark:text-gray-100">{settings.account_number}</span>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Amount to Pay</span>
                  <span className="font-black text-xl text-gray-900 dark:text-gray-100">{formatPrice(total, globalSettings?.currency_symbol)}</span>
                </div>
              </div>
            </div>
          )}
          <Link href="/" className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:opacity-85 transition-all">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
      <Header />
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="flex items-center gap-3 mb-10">
          <Link href="/cart" className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors font-medium flex items-center gap-2 text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            Back to Cart
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-5 lg:order-2">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 sticky top-24 border border-gray-100 dark:border-neutral-800 shadow-sm">
              <h2 className="font-black uppercase tracking-widest text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-neutral-800 pb-4 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img src={getImageUrl(item.image_url) || ''} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button type="button" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </button>
                        <span className="text-xs font-black min-w-[12px] text-center text-gray-900 dark:text-gray-100">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </button>
                      </div>
                    </div>
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{formatPrice(parseFloat(item.price as any) * item.quantity, globalSettings?.currency_symbol)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t border-gray-100 dark:border-neutral-800 pt-4 text-sm">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{formatPrice(subtotal, globalSettings?.currency_symbol)}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{shipping === 0 ? 'FREE' : formatPrice(shipping, globalSettings?.currency_symbol)}</span>
                </div>
                <div className="flex justify-between text-lg font-black border-t border-gray-100 dark:border-neutral-800 pt-3 text-gray-900 dark:text-gray-100">
                  <span>Total</span>
                  <span>{formatPrice(total, globalSettings?.currency_symbol)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 lg:order-1 space-y-5">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 md:p-8 space-y-5 border border-gray-100 dark:border-neutral-800 shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-800 pb-4">
                <h2 className="font-black uppercase tracking-widest text-xs text-gray-400 dark:text-gray-500">Your Information</h2>
                {user && (!user.phone || !user.address) && (
                  <span className="text-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg font-bold animate-pulse">
                    Please complete your profile
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input required value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} className={inputCls} placeholder="John Doe" />
                </div>
                {!user && (
                  <>
                    <div>
                      <label className={labelCls}>Email Address *</label>
                      <input required type="email" value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} className={inputCls} placeholder="john@example.com" />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Create Password (to save account) *</label>
                      <div className="relative">
                        <input 
                          required 
                          type={showPassword ? "text" : "password"} 
                          minLength={8} 
                          value={form.password} 
                          onChange={e => setForm({ ...form, password: e.target.value })} 
                          className={inputCls} 
                          placeholder="Min 8 characters" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition-colors p-2"
                        >
                          {showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div>
                <label className={labelCls}>Phone Number *</label>
                <input required value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} className={inputCls} placeholder="+234 800 000 0000" />
              </div>
              <div>
                <label className={labelCls}>Delivery Address *</label>
                <textarea required rows={3} value={form.delivery_address} onChange={e => setForm({ ...form, delivery_address: e.target.value })} className={`${inputCls} resize-none`} placeholder="Street, City, State" />
              </div>
            </div>
            {(error || storeError) && (
              <p className="text-red-500 text-sm font-semibold bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-100 dark:border-red-800">{error || storeError}</p>
            )}
            <button type="submit" disabled={submitting || cart.length === 0}
              className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-black/10 hover:opacity-85 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer">
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentConfirmModal
          total={total}
          settings={globalSettings ?? { company_name: 'Store', bank_name: 'Bank Transfer', account_name: 'Payment Instructions', account_number: 'Contact Support' }}
          onConfirm={handleConfirmOrder}
          onClose={() => setShowPaymentModal(false)}
          submitting={submitting}
          error={error || storeError || undefined}
        />
      )}
    </main>
  );
}
