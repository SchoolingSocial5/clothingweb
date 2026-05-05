"use client";
import { useState } from 'react';
import { useWholesaleOrderStore } from '@/store/useWholesaleOrderStore';
import { getImageUrl } from '@/utils/image';

interface WholesaleCheckoutModalProps {
  cartItems: any[];
  onClose: () => void;
  onUpdateQty: (id: number, val: number) => void;
  onRemove: (id: number) => void;
  onOrderCreated: () => void;
  onError: (message: string) => void;
}

export default function WholesaleCheckoutModal({ cartItems, onClose, onUpdateQty, onRemove, onOrderCreated, onError }: WholesaleCheckoutModalProps) {
  const { createOrder } = useWholesaleOrderStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSubmit = async (paymentMethod: string) => {
    if (!formData.name || !formData.phone) {
      onError('Please fill in customer name and phone number');
      return;
    }

    // Check min order quantity
    const invalidItems = cartItems.filter(item => item.quantity < (item.min_order_quantity || 1));
    if (invalidItems.length > 0) {
      onError(`Some items do not meet the minimum order quantity requirement.`);
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('customer_name', formData.name);
      fd.append('customer_phone', formData.phone);
      fd.append('total_amount', String(total));
      fd.append('payment_method', paymentMethod);
      fd.append('items', JSON.stringify(cartItems.map(i => ({
        productId: i.id,
        productName: i.name,
        productImage: i.image_url,
        price: i.price,
        quantity: i.quantity
      }))));

      await createOrder(fd);
      onOrderCreated();
    } catch (err: any) {
      onError(err.message || 'Failed to create wholesale order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-neutral-900 rounded-[40px] w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-gray-50 dark:border-neutral-800 flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-900 dark:text-white">Wholesale Checkout</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="max-h-[30vh] overflow-y-auto space-y-4 pr-1">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center gap-4">
                <img src={getImageUrl(item.image_url) || ''} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-bold truncate leading-tight dark:text-white">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">₦{item.price.toLocaleString()}</p>
                    {item.min_order_quantity > 1 && (
                      <span className="text-[9px] font-bold text-red-400 uppercase">Min: {item.min_order_quantity}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-50 dark:bg-neutral-800 rounded-lg p-1">
                    <button onClick={() => onUpdateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                    <span className="w-6 text-center text-xs font-black dark:text-white">{item.quantity}</span>
                    <button onClick={() => onUpdateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                  </div>
                  <button onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-600 p-1 cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 dark:bg-neutral-800 p-6 rounded-3xl space-y-2">
            <div className="flex justify-between text-xs text-gray-400 font-bold uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="dark:text-gray-200">₦{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-gray-200 dark:border-neutral-700 font-black">
              <span className="text-sm dark:text-white">Total</span>
              <span className="text-xl dark:text-white">₦{total.toLocaleString()}</span>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Customer Name</label>
              <input
                required
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white font-bold dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
              <input
                required
                type="tel"
                placeholder="080XXXXXXXX"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white font-bold dark:text-white"
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('cash')}
                className="flex items-center justify-center gap-3 py-3 px-4 flex-1 min-w-[100px] bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all disabled:opacity-50 group cursor-pointer"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Cash</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('pos')}
                className="flex items-center justify-center gap-3 py-3 px-4 flex-1 min-w-[100px] bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 group cursor-pointer"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">POS</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('transfer')}
                className="flex items-center justify-center gap-3 py-3 px-4 flex-1 min-w-[100px] bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all disabled:opacity-50 group cursor-pointer"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Trans</span>
              </button>
            </div>
            {loading && (
              <p className="text-center text-[10px] font-black uppercase tracking-widest text-gray-400 animate-pulse">Processing Wholesale Order...</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
