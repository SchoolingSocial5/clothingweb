"use client";
import { useState } from 'react';
import { useSettings } from "@/context/SettingsContext";
import { formatPrice } from "@/utils/format";

interface Settings {
  company_name: string;
  bank_name: string;
  account_name: string;
  account_number: string;
}

interface PaymentConfirmModalProps {
  total: number;
  settings: Settings;
  onConfirm: (receipt: File) => Promise<void>;
  onClose: () => void;
  submitting: boolean;
  error?: string;
}

export default function PaymentConfirmModal({ 
  total, 
  settings, 
  onConfirm, 
  onClose, 
  submitting, 
  error 
}: PaymentConfirmModalProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const { settings: globalSettings } = useSettings();

  const handleConfirm = () => {
    if (receiptFile) {
      onConfirm(receiptFile);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-[10px] md:p-8">
          <div className="flex justify-between items-start mb-6 px-2 md:px-0">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100">Complete Payment</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Please transfer the total amount.</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-2 cursor-pointer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-neutral-800 rounded-2xl p-[10px] md:p-6 space-y-4 mb-8 border border-gray-100 dark:border-neutral-700">
            <div className="flex justify-between border-b border-gray-200 dark:border-neutral-700 pb-3 px-2 md:px-0">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Amount to Pay</span>
              <span className="text-xl font-black text-gray-900 dark:text-gray-100">{formatPrice(total, globalSettings?.currency_symbol)}</span>
            </div>
            <div className="space-y-3 text-sm px-2 md:px-0">
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Bank</span><span className="font-bold text-gray-900 dark:text-gray-100">{settings.bank_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Account Name</span><span className="font-bold text-gray-900 dark:text-gray-100">{settings.account_name}</span></div>
              <div className="flex justify-between flex-col gap-1">
                <span className="text-gray-500 dark:text-gray-400">Account Number</span>
                <span className="font-black text-2xl tracking-widest text-black dark:text-white">{settings.account_number}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-2 md:px-0">
            <label className="block">
              <span className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Upload Payment Receipt *</span>
              <div className="relative group">
                <input
                  required
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${receiptFile ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10' : 'border-gray-200 dark:border-neutral-700 group-hover:border-black dark:group-hover:border-white bg-gray-50 dark:bg-neutral-800'}`}>
                  <div className="w-12 h-12 bg-white dark:bg-neutral-700 rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3">
                    {receiptFile ? (
                      <svg className="text-green-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg className="text-gray-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    )}
                  </div>
                  <p className={`text-sm font-bold ${receiptFile ? 'text-green-700' : 'text-gray-500'}`}>
                    {receiptFile ? receiptFile.name : 'Click to upload screenshot'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">JPG, PNG up to 5MB</p>
                </div>
              </div>
            </label>

            {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl">{error}</p>}

            <button
              onClick={handleConfirm}
              disabled={submitting || !receiptFile}
              className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest shadow-xl shadow-black/10 cursor-pointer"
            >
              {submitting ? 'Verifying...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
