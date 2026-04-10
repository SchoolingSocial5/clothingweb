"use client";
import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { useBannerStore } from '@/store/useBannerStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { apiClient } from '@/utils/api';
import { compressImage } from '@/utils/image';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '');
function buildImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path.replace(/^http:\/\/localhost(?::\d+)?\//, `${BASE_URL}/`);
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

interface Settings {
  company_name: string;
  domain: string;
  email: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  currency_symbol: string;
  phone_number: string;
  address: string;
  hero_banner?: string;
  logo?: string;
  favicon?: string;
}

export default function SettingsPage() {
  const { refreshSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Settings>({
    company_name: '',
    domain: '',
    email: '',
    bank_name: '',
    account_name: '',
    account_number: '',
    currency_symbol: '₦',
    phone_number: '',
    address: ''
  });

  const { banners, fetchBanners, addBanner, deleteBanner } = useBannerStore();
  const { categories, fetchCategories, addCategory, deleteCategory } = useCategoryStore();
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: '', subtitle: '', category: 'Home', image: null as File | null });
  const [bannerPreview, setBannerPreview] = useState("");
  const [creatingBanner, setCreatingBanner] = useState(false);
  const [bannerError, setBannerError] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryMsg, setCategoryMsg] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ type: 'banner' | 'category'; id: number; label: string } | null>(null);

  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [files, setFiles] = useState<{ [key: string]: File }>({});

  // Load saved settings & banners
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Settings
      const data = await apiClient('/settings');
      if (data && data.id) {
        setFormData(prev => ({
          ...prev,
          ...data
        }));
      }
      
      // Fetch Banners
      await fetchBanners();
    } catch (err: any) {
      console.error('Error loading settings page data:', err);
      setError(err.message || 'Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchCategories();
  }, [fetchBanners, fetchCategories]);

  const handleChange = (field: keyof Settings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File) => {
    setFiles(prev => ({ ...prev, [field]: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFileChange = (file: File) => {
    setNewBanner(prev => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.image) return;
    setCreatingBanner(true);

    const data = new FormData();
    
    // Compress image before upload
    const compressedImage = await compressImage(newBanner.image);
    data.append('image', compressedImage);
    
    data.append('title', newBanner.title);
    data.append('subtitle', newBanner.subtitle);
    data.append('category', newBanner.category);

    try {
      await addBanner(data);
      setShowBannerModal(false);
      setNewBanner({ title: '', subtitle: '', category: 'Home', image: null });
      setBannerPreview("");
      setBannerError('');
    } catch (err: any) {
      const details = err.data?.errors
        ? Object.values(err.data.errors as Record<string, string[]>).flat().join(' ')
        : err.message || 'Upload failed. Please try again.';
      setBannerError(details);
    } finally {
      setCreatingBanner(false);
    }
  };

  const handleDeleteBanner = (id: number, title: string) => {
    setPendingDelete({ type: 'banner', id, label: title || 'this banner' });
  };

  const confirmPendingDelete = async () => {
    if (!pendingDelete) return;
    try {
      if (pendingDelete.type === 'banner') {
        await deleteBanner(pendingDelete.id);
      } else {
        await deleteCategory(pendingDelete.id);
      }
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      const val = formData[key as keyof Settings];
      if (val) data.append(key, val);
    });
    
    // Compress and append assets
    for (const key of Object.keys(files)) {
      const compressedFile = await compressImage(files[key]);
      data.append(key, compressedFile);
    }

    try {
      const result = await apiClient('/admin/settings', {
        method: 'POST',
        body: data,
        isFormData: true
      });
      setFormData(result);
      setFiles({});
      refreshSettings();

      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '');
      const toAbsolute = (p: string) => p.startsWith('http') ? p : `${apiBase}${p}`;

      // Write logo file locally if a new logo was uploaded
      if (files.logo && result.logo) {
        fetch('/api/update-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: toAbsolute(result.logo) }),
        }).catch(() => {});
      }

      // Write favicon file locally if a new favicon was uploaded
      if (files.favicon && result.favicon) {
        fetch('/api/update-favicon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: toAbsolute(result.favicon) }),
        }).catch(() => {});
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
      if (err.data) {
        console.log('Detailed API Error:', JSON.stringify(err.data, null, 2));
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-5 py-3.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all";
  const labelClass = "block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2";

  return (
    <div className="px-[10px] md:px-8 py-8 w-full max-w-7xl mx-auto">
      <AdminPageHeader 
        title="Store Settings" 
        description="Update your store info, payment details and managing your brand assets."
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-black uppercase tracking-widest text-gray-400">Loading your store settings...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-10 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h3 className="text-xl font-black uppercase mb-2 text-gray-900">Connection Failed</h3>
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            {error}
          </p>
          <button 
            onClick={loadData}
            className="px-8 py-3 bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            <div className="space-y-8">
              {/* Company Info Form */}
              <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 py-6 md:py-8 shadow-sm space-y-6 transition-colors px-0 md:px-0">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-800 pb-4 px-[10px] md:px-8">
                  <h3 className="font-black text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500">Company Information</h3>
                </div>
                <div className="space-y-4 px-[10px] md:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Company Name</label>
                      <input type="text" value={formData.company_name} onChange={e => handleChange('company_name', e.target.value)} className={inputClass} placeholder="Velure Store" />
                    </div>
                    <div>
                      <label className={labelClass}>Domain / Website</label>
                      <input type="text" value={formData.domain} onChange={e => handleChange('domain', e.target.value)} className={inputClass} placeholder="velure.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Email Address</label>
                      <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className={inputClass} placeholder="hello@velure.com" />
                    </div>
                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input type="text" value={formData.phone_number} onChange={e => handleChange('phone_number', e.target.value)} className={inputClass} placeholder="+234 800 000 0000" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Address</label>
                    <textarea value={formData.address} onChange={e => handleChange('address', e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="123 Fashion Ave, Lagos, Nigeria" />
                  </div>
                </div>
                <div className="pt-4 px-[10px] md:px-8 border-t border-gray-50 dark:border-neutral-800">
                  <button type="submit" disabled={saving} className="w-full md:w-auto text-[10px] font-black uppercase tracking-widest bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 cursor-pointer">
                    {saving ? 'Saving...' : 'Save Info'}
                  </button>
                </div>
              </form>

              {/* Product Categories */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors">
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/30 dark:bg-neutral-800/30">
                  <h3 className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-gray-100">Product Categories</h3>
                  <p className="text-xs text-gray-400 mt-1 font-bold">Manage the categories available for categorising products</p>
                </div>
                <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex gap-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Spring Collection"
                    onKeyDown={async e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!newCategoryName.trim()) return;
                        setAddingCategory(true);
                        try {
                          await addCategory(newCategoryName.trim());
                          setNewCategoryName('');
                          setCategoryMsg('Category added!');
                          setTimeout(() => setCategoryMsg(''), 2500);
                        } catch { setCategoryMsg('Already exists or failed.'); setTimeout(() => setCategoryMsg(''), 2500); }
                        finally { setAddingCategory(false); }
                      }
                    }}
                    className="flex-1 px-5 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                  <button
                    type="button"
                    disabled={addingCategory || !newCategoryName.trim()}
                    onClick={async () => {
                      if (!newCategoryName.trim()) return;
                      setAddingCategory(true);
                      try {
                        await addCategory(newCategoryName.trim());
                        setNewCategoryName('');
                        setCategoryMsg('Category added!');
                        setTimeout(() => setCategoryMsg(''), 2500);
                      } catch { setCategoryMsg('Already exists or failed.'); setTimeout(() => setCategoryMsg(''), 2500); }
                      finally { setAddingCategory(false); }
                    }}
                    className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    {addingCategory ? 'Adding...' : 'Add'}
                  </button>
                </div>
                {categoryMsg && (
                  <p className={`px-6 py-2 text-xs font-bold ${categoryMsg.includes('added') ? 'text-green-600' : 'text-red-500'}`}>{categoryMsg}</p>
                )}
                <div className="divide-y divide-gray-50 dark:divide-neutral-800 max-h-72 overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="px-8 py-10 text-center text-gray-400 text-sm font-bold uppercase tracking-widest italic">No categories yet. Add your first!</p>
                  ) : (
                    categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between px-8 py-2 hover:bg-gray-50/30 dark:hover:bg-neutral-800/30 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-black dark:bg-white opacity-30"/>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{cat.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPendingDelete({ type: 'category', id: cat.id, label: cat.name })}
                          className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Bank / Payment Info Form */}
              <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 py-6 md:py-8 shadow-sm space-y-6 transition-colors px-0 md:px-0">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-800 pb-4 px-[10px] md:px-8">
                  <h3 className="font-black text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500">Payment Details</h3>
                </div>
                <div className="space-y-4 px-[10px] md:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Bank Name</label>
                      <input type="text" value={formData.bank_name} onChange={e => handleChange('bank_name', e.target.value)} className={inputClass} placeholder="First Bank Nigeria" />
                    </div>
                    <div>
                      <label className={labelClass}>Account Name</label>
                      <input type="text" value={formData.account_name} onChange={e => handleChange('account_name', e.target.value)} className={inputClass} placeholder="VELURE CLOTHING" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Account Number</label>
                    <input type="text" value={formData.account_number} onChange={e => handleChange('account_number', e.target.value)} className={inputClass} placeholder="0011223344" />
                  </div>
                  <div>
                    <label className={labelClass}>Currency Symbol</label>
                    <input
                      type="text"
                      value={formData.currency_symbol}
                      onChange={e => handleChange('currency_symbol', e.target.value)}
                      className={inputClass}
                      placeholder="e.g. ₦, $, €, £"
                      maxLength={5}
                    />
                    <p className="text-xs text-gray-400 mt-1 font-medium">Used for all price displays across the store</p>
                  </div>
                </div>
                <div className="pt-4 px-[10px] md:px-8 border-t border-gray-50 dark:border-neutral-800">
                  <button type="submit" disabled={saving} className="w-full md:w-auto text-[10px] font-black uppercase tracking-widest bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 cursor-pointer">
                    {saving ? 'Saving...' : 'Save Bank'}
                  </button>
                </div>
              </form>

              {/* Logo & Favicon Form */}
              <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 py-6 md:py-8 shadow-sm space-y-6 px-0 md:px-0 transition-colors">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-800 pb-4 px-[10px] md:px-8">
                  <h3 className="font-black text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500">Brand Assets</h3>
                </div>
                <div className="grid grid-cols-2 gap-6 px-[10px] md:px-8">
                  <div>
                    <label className={labelClass}>Store Logo</label>
                    <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-gray-200 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-colors w-24 h-24 bg-gray-50 dark:bg-neutral-800 flex items-center justify-center p-2">
                      {(previews.logo || formData.logo) ? (
                        <img src={previews.logo || buildImageUrl(formData.logo || '')} alt="Logo" className="max-w-full max-h-full object-contain" />
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
                        <img src={previews.favicon || buildImageUrl(formData.favicon || '')} alt="Favicon" className="w-6 h-6 object-contain" />
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
                  <button type="submit" disabled={saving} className="w-full md:w-auto text-[10px] font-black uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl hover:opacity-85 transition-all disabled:opacity-50 cursor-pointer">
                    {saving ? 'Saving...' : 'Save Brand'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        {/* Hero Banners Management - Full Width */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors">
          <div className="p-8 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50/30 dark:bg-neutral-800/30">
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-gray-100">Hero Banners</h3>
              <p className="text-xs text-gray-400 mt-1 font-bold">Manage images and text for the homepage carousel</p>
            </div>
            <button
              type="button"
              onClick={() => { setShowBannerModal(true); setBannerError(''); }}
              className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add New Banner
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-neutral-800/50 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-4">Preview</th>
                  <th className="px-8 py-4">Title</th>
                  <th className="px-8 py-4">Subtitle</th>
                  <th className="px-8 py-4">Category</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-widest italic">
                      No banners added yet. Add your first hero banner!
                    </td>
                  </tr>
                ) : (
                  banners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-gray-50/30 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="px-8 py-4">
                        <div className="w-24 h-12 rounded-lg bg-gray-100 dark:bg-neutral-800 overflow-hidden border border-gray-100 dark:border-neutral-700">
                          <img src={buildImageUrl(banner.image_path)} alt="" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-8 py-4 text-sm font-black text-gray-900 dark:text-gray-100">{banner.title}</td>
                      <td className="px-8 py-4 text-xs font-bold text-gray-400 dark:text-gray-500">{banner.subtitle}</td>
                      <td className="px-8 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          banner.category === 'About'
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {banner.category || 'Home'}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteBanner(banner.id, banner.title)}
                          className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      )}

      <DeleteConfirmModal
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmPendingDelete}
        title={pendingDelete?.type === 'banner' ? 'Delete Banner' : 'Delete Category'}
        message={pendingDelete?.type === 'banner'
          ? `Are you sure you want to delete the banner "${pendingDelete?.label}"? This action cannot be undone.`
          : `Are you sure you want to delete the category "${pendingDelete?.label}"? This action cannot be undone.`
        }
      />

      {/* Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBannerModal(false)}></div>
          <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-xl relative shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50/50 dark:bg-neutral-800/50 flex-shrink-0 rounded-t-3xl">
              <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100">Add New Banner</h3>
              <button onClick={() => setShowBannerModal(false)} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1 cursor-pointer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleCreateBanner} className="p-8 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <label className={labelClass}>Banner Image</label>
                <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 hover:border-black transition-colors aspect-[16/8] bg-gray-50 flex items-center justify-center">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <svg className="mx-auto text-gray-300 mb-2" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select Image</p>
                    </div>
                  )}
                  <input type="file" required onChange={e => e.target.files?.[0] && handleBannerFileChange(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Banner Title</label>
                <input 
                  type="text" 
                  value={newBanner.title} 
                  onChange={e => setNewBanner(prev => ({...prev, title: e.target.value}))} 
                  className={inputClass} 
                  placeholder="e.g. New Summer Collection" 
                />
              </div>

              <div>
                <label className={labelClass}>Banner Subtitle</label>
                <input
                  type="text"
                  value={newBanner.subtitle}
                  onChange={e => setNewBanner(prev => ({...prev, subtitle: e.target.value}))}
                  className={inputClass}
                  placeholder="e.g. Up to 50% Off Everything"
                />
              </div>

              <div>
                <label className={labelClass}>Banner Category</label>
                <input
                  type="text"
                  value={newBanner.category}
                  onChange={e => setNewBanner(prev => ({...prev, category: e.target.value}))}
                  className={inputClass}
                  placeholder="e.g. Home, About, Sale"
                />
              </div>

              {bannerError && (
                <p className="text-red-500 text-sm font-semibold bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-100 dark:border-red-800">
                  {bannerError}
                </p>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={creatingBanner || !newBanner.image}
                  className="w-full py-4 bg-black text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-gray-900 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {creatingBanner ? 'Uploading...' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
