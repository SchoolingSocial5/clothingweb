"use client";
import { useState, useEffect } from "react";
import { useSettingStore, Setting } from "@/store/useSettingStore";

interface Props {
  initialData: Partial<Setting>;
}

export default function PaymentDetailsForm({ initialData }: Props) {
  const { updateSettings } = useSettingStore();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof Setting, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    const fields: (keyof Setting)[] = ['bank_name', 'account_name', 'account_number', 'currency_symbol'];
    fields.forEach(key => {
      if (formData[key]) data.append(key, String(formData[key]));
    });

    try {
      await updateSettings(data);
    } catch (err) {
      console.error("Error saving payment details:", err);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-5 py-3.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all";
  const labelClass = "block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2";

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 py-6 md:py-8 shadow-sm space-y-6 transition-colors px-0 md:px-0">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-800 pb-4 px-[10px] md:px-8">
        <h3 className="font-black text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500">Payment Details</h3>
      </div>
      <div className="space-y-4 px-[10px] md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Bank Name</label>
            <input type="text" value={formData.bank_name || ''} onChange={e => handleChange('bank_name', e.target.value)} className={inputClass} placeholder="First Bank Nigeria" />
          </div>
          <div>
            <label className={labelClass}>Account Name</label>
            <input type="text" value={formData.account_name || ''} onChange={e => handleChange('account_name', e.target.value)} className={inputClass} placeholder="VELURE CLOTHING" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Account Number</label>
            <input type="text" value={formData.account_number || ''} onChange={e => handleChange('account_number', e.target.value)} className={inputClass} placeholder="0011223344" />
          </div>
          <div>
            <label className={labelClass}>Currency Symbol</label>
            <input
              type="text"
              value={formData.currency_symbol || ''}
              onChange={e => handleChange('currency_symbol', e.target.value)}
              className={inputClass}
              placeholder="e.g. ₦, $, €, £"
              maxLength={5}
            />
            <p className="text-[10px] text-gray-400 mt-1 font-medium">Used for all price displays across the store</p>
          </div>
        </div>
      </div>
      <div className="pt-4 px-[10px] md:px-8 border-t border-gray-50 dark:border-neutral-800">
        <button type="submit" disabled={saving} className="w-full md:w-auto text-[10px] font-black uppercase tracking-widest bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 cursor-pointer">
          {saving ? 'Saving...' : 'Save Bank'}
        </button>
      </div>
    </form>
  );
}
