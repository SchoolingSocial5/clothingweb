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
  const { user } = useAuth();
  const { settings: globalSettings } = useSettings();
  const { createOrder, loading: submitting, error: storeError } = useOrderStore();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
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

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    fetch(`${apiBase}/settings`, { headers: { Accept: 'application/json' } })
      .then(r => r.json())
      .then(data => { if (data && data.bank_name) setSettings(data); })
      .catch((err) => { 
        console.error("Failed to load settings in Checkout:", err);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }
    setError('');
    
    // If settings are not loaded yet, we can't show payment info
    if (!settings && !globalSettings) {
      setError('Loading payment configuration... Please wait a moment and try again.');
      return;
    }
    
    setShowPaymentModal(true);
  };

  const handleConfirmOrder = async (receipt: File) => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    cart.forEach((item, index) => {
      formData.append(`items[${index}][product_id]`, item.id.toString());
      formData.append(`items[${index}][product_name]`, item.name);
      formData.append(`items[${index}][price]`, item.price);
      formData.append(`items[${index}][quantity]`, item.quantity.toString());
      if (item.image_url) formData.append(`items[${index}][product_image]`, item.image_url);
    });

    formData.append('receipt', receipt);

    try {
      const order = await createOrder(formData);
      setOrderId(order.id);
      setDone(true);
      clearCart();
    } catch (err: any) {
      setShowPaymentModal(false);
    }
  };

  // Success screen
  if (done) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="max-w-xl mx-auto px-[10px] md:px-8 py-32 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="text-green-500" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-3">Order Placed!</h1>
          <p className="text-gray-500 mb-2">Your order <span className="font-bold text-black">#{orderId}</span> has been received.</p>
          <p className="text-gray-500 mb-10">Please complete your payment using the details below.</p>

          {settings && (
            <div className="bg-gray-50 rounded-2xl p-8 text-left mb-10 border border-gray-100">
              <h3 className="font-black uppercase tracking-widest text-xs text-gray-400 mb-5">Payment Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between flex-col gap-1">
                  <span className="text-gray-500">Account Number</span>
                  <span className="font-black text-2xl tracking-widest text-black">{settings.account_number}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between">
                  <span className="text-gray-500">Amount to Pay</span>
                  <span className="font-black text-xl">{formatPrice(total, globalSettings?.currency_symbol)}</span>
                </div>
              </div>
            </div>
          )}

          <Link href="/" className="inline-block bg-black text-white px-10 py-4 rounded-xl font-bold hover:bg-gray-900 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[1100px] mx-auto px-[10px] md:px-8 py-16">
        <div className="flex items-center gap-3 mb-12">
          <Link href="/cart" className="text-gray-400 hover:text-black transition-colors font-medium flex items-center gap-2 text-sm cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Cart
          </Link>
        </div>

        <h1 className="text-4xl font-black uppercase tracking-tighter mb-12">Checkout</h1>        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Order Summary - First on Mobile, Right on Desktop */}
          <div className="lg:col-span-5 lg:order-2">
            <div className="bg-gray-50 rounded-2xl p-8 sticky top-28 border border-gray-100">
              <h2 className="font-black uppercase tracking-widest text-xs text-gray-400 border-b border-gray-200 pb-4 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                      {item.image_url && (
                        <img 
                          src={item.image_url.startsWith('http') ? item.image_url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''}${item.image_url.startsWith('/') ? '' : '/'}${item.image_url}`} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-800 leading-tight">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="text-gray-400 hover:text-black transition-colors p-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        <span className="text-xs font-black min-w-[12px] text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-400 hover:text-black transition-colors p-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                      </div>
                    </div>
                    <p className="font-bold text-sm">{formatPrice(Number(item.price) * item.quantity, globalSettings?.currency_symbol)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">{formatPrice(subtotal, globalSettings?.currency_symbol)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="font-bold text-black">
                    {shipping === 0 ? 'FREE' : formatPrice(shipping, globalSettings?.currency_symbol)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-black border-t border-gray-200 pt-3">
                  <span>Total</span>
                  <span>{formatPrice(total, globalSettings?.currency_symbol)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form - Second on Mobile, Left on Desktop */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 lg:order-1 space-y-5 px-0 md:px-0">
            <div className="bg-gray-50 rounded-2xl p-6 md:p-8 space-y-5 border border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <h2 className="font-black uppercase tracking-widest text-xs text-gray-400">Your Information</h2>
                {user && (!user.phone || !user.address) && (
                  <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-1 rounded-lg font-bold animate-pulse">
                    Please complete your profile
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Full Name *</label>
                  <input required value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="John Doe" />
                </div>
                {!user && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email Address *</label>
                      <input required type="email" value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="john@example.com" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Create Password (to save account) *</label>
                      <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Min 8 characters" />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Phone Number *</label>
                <input required value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="+234 800 000 0000" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Delivery Address *</label>
                <textarea required rows={3} value={form.delivery_address} onChange={e => setForm({ ...form, delivery_address: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  placeholder="Street, City, State" />
              </div>
            </div>

            {error || storeError ? <p className="text-red-500 text-sm font-semibold bg-red-50 px-4 py-3 rounded-xl">{error || storeError}</p> : null}
            <button type="submit" disabled={submitting || cart.length === 0}
              className="w-full bg-black text-white py-5 rounded-2xl font-bold shadow-xl shadow-black/10 hover:bg-gray-900 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest cursor-pointer">
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>

        {/* Payment Modal */}
        {showPaymentModal && settings && (
          <PaymentConfirmModal
            total={total}
            settings={settings || {
              company_name: globalSettings?.company_name || 'Store',
              bank_name: 'Contact Support',
              account_name: 'Payment Instruction Pending',
              account_number: 'N/A'
            }}
            onConfirm={handleConfirmOrder}
            onClose={() => setShowPaymentModal(false)}
            submitting={submitting}
            error={error || storeError || undefined}
          />
        )}
    </main>
  );
}
