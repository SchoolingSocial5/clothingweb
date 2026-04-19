"use client";
import { useState, useEffect } from "react";
import { useSettingStore, Setting } from "@/store/useSettingStore";
import { useSettings } from "@/context/SettingsContext";

interface Props {
  initialData: Partial<Setting>;
}

export default function CompanyDetailsForm({ initialData }: Props) {
  const { updateSettings } = useSettingStore();
  const { refreshSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof Setting, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    // Only append fields managed by this component
    const fields: (keyof Setting)[] = ['company_name', 'domain', 'email', 'phone_number', 'address', 'show_blog'];
    fields.forEach(key => {
      if (formData[key] !== undefined) {
        data.append(key, String(formData[key]));
      }
    });

    try {
      await updateSettings(data);
      refreshSettings();
    } catch (err) {
      console.error("Error saving company details:", err);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-5 py-3.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all";
  const labelClass = "block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2";

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 py-6 md:py-8 shadow-sm space-y-6 transition-colors px-0 md:px-0">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-800 pb-4 px-[10px] md:px-8">
        <h3 className="font-black text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500">Company Information</h3>
      </div>
      <div className="space-y-4 px-[10px] md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Company Name</label>
            <input type="text" value={formData.company_name || ''} onChange={e => handleChange('company_name', e.target.value)} className={inputClass} placeholder="Velure Store" />
          </div>
          <div>
            <label className={labelClass}>Domain / Website</label>
            <input type="text" value={formData.domain || ''} onChange={e => handleChange('domain', e.target.value)} className={inputClass} placeholder="velure.com" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email Address</label>
            <input type="email" value={formData.email || ''} onChange={e => handleChange('email', e.target.value)} className={inputClass} placeholder="hello@velure.com" />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input type="text" value={formData.phone_number || ''} onChange={e => handleChange('phone_number', e.target.value)} className={inputClass} placeholder="+234 800 000 0000" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Address</label>
          <input type="text" value={formData.address || ''} onChange={e => handleChange('address', e.target.value)} className={inputClass} placeholder="123 Fashion Ave, Lagos, Nigeria" />
        </div>
        <div className="flex items-center justify-between py-4 border-t border-gray-50 dark:border-neutral-800">
          <div>
            <span className="block text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">Show Blog Menu</span>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Toggle visibility of the blog link in the navigation menu</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange('show_blog', !formData.show_blog)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
              formData.show_blog ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-neutral-800"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${
                formData.show_blog ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
      <div className="pt-4 px-[10px] md:px-8 border-t border-gray-50 dark:border-neutral-800">
        <button type="submit" disabled={saving} className="w-full md:w-auto text-[10px] font-black uppercase tracking-widest bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 cursor-pointer">
          {saving ? 'Saving...' : 'Save Info'}
        </button>
      </div>
    </form>
  );
}
