"use client";
import { useState, useEffect } from "react";
import { useSettingStore, Setting } from "@/store/useSettingStore";
import { getImageUrl, compressImage } from "@/utils/image";

interface Props {
  initialData: Partial<Setting>;
}

export default function BrandAssetsForm({ initialData }: Props) {
  const { updateSettings } = useSettingStore();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [files, setFiles] = useState<{ [key: string]: File }>({});

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleFileChange = (field: string, file: File) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews((prev) => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(files).length === 0) return;
    setSaving(true);

    const data = new FormData();
    for (const key of Object.keys(files)) {
      const compressedFile = await compressImage(files[key]);
      data.append(key, compressedFile);
    }

    try {
      const result = await updateSettings(data);
      setFormData(result);
      setFiles({});
    } catch (err) {
      console.error("Error saving brand assets:", err);
    } finally {
      setSaving(false);
    }
  };

  const labelClass = "block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2";

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 py-6 md:py-8 shadow-sm space-y-6 px-0 md:px-0 transition-colors">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-800 pb-4 px-[10px] md:px-8">
        <h3 className="font-black text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500">Brand Assets</h3>
      </div>
      <div className="grid grid-cols-2 gap-6 px-[10px] md:px-8">
        <div>
          <label className={labelClass}>Store Logo</label>
          <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-gray-200 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-colors w-24 h-24 bg-gray-50 dark:bg-neutral-800 flex items-center justify-center p-2">
            {(previews.logo || formData.logo) ? (
              <img src={previews.logo || getImageUrl(formData.logo) || undefined} alt="Logo" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-center">
                <svg className="mx-auto text-gray-300 dark:text-neutral-600 mb-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <p className="text-[8px] font-black uppercase text-gray-400 dark:text-gray-500">Logo</p>
              </div>
            )}
            <input type="file" onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFileChange('logo', file);
            }} className="absolute inset-0 opacity-0 cursor-pointer" title="Change Logo" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Favicon</label>
          <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-gray-200 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-colors w-20 h-20 bg-gray-50 dark:bg-neutral-800 flex items-center justify-center p-4">
            {(previews.favicon || formData.favicon) ? (
              <img src={previews.favicon || getImageUrl(formData.favicon) || undefined} alt="Favicon" className="w-6 h-6 object-contain" />
            ) : (
              <div className="text-center">
                <svg className="mx-auto text-gray-300 dark:text-neutral-600 mb-1" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                <p className="text-[8px] font-black uppercase text-gray-400 dark:text-gray-500">Favicon</p>
              </div>
            )}
            <input type="file" onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFileChange('favicon', file);
            }} className="absolute inset-0 opacity-0 cursor-pointer" title="Change Favicon" />
          </div>
        </div>
      </div>
      <div className="pt-4 px-[10px] md:px-8 border-t border-gray-50 dark:border-neutral-800">
        <button type="submit" disabled={saving || Object.keys(files).length === 0} className="w-full md:w-auto text-[10px] font-black uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl hover:opacity-85 transition-all disabled:opacity-50 cursor-pointer">
          {saving ? 'Saving...' : 'Save Brand'}
        </button>
      </div>
    </form>
  );
}
