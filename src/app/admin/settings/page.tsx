"use client";
import { useState, useEffect } from 'react';
import { useSettingStore } from '@/store/useSettingStore';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { useBannerStore } from '@/store/useBannerStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import Link from 'next/link';

// Modular Components
import CompanyDetailsForm from '@/components/admin/settings/CompanyDetailsForm';
import PaymentDetailsForm from '@/components/admin/settings/PaymentDetailsForm';
import BrandAssetsForm from '@/components/admin/settings/BrandAssetsForm';
import CategoryManagement from '@/components/admin/settings/CategoryManagement';
import BannerManagement from '@/components/admin/settings/BannerManagement';
import BannerModal from '@/components/admin/settings/BannerModal';

export default function SettingsPage() {
  const { fetchSettings, settings: storeSettings } = useSettingStore();
  const { fetchBanners, deleteBanner } = useBannerStore();
  const { fetchCategories, deleteCategory } = useCategoryStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
  const [bannerToEdit, setBannerToEdit] = useState<any>(null);
  const [pendingDelete, setPendingDelete] = useState<{ type: 'banner' | 'category'; id: number; label: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchSettings();
      await fetchBanners();
      await fetchCategories();
    } catch (err: any) {
      console.error('Error loading settings page data:', err);
      setError(err.message || 'Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditBanner = (banner: any) => {
    setEditingBannerId(banner.id);
    setBannerToEdit(banner);
    setShowBannerModal(true);
  };

  const confirmPendingDelete = async () => {
    if (!pendingDelete) return;
    try {
      if (pendingDelete.type === 'banner') {
        await deleteBanner(pendingDelete.id);
      } else {
        await deleteCategory(pendingDelete.id);
      }
      setPendingDelete(null);
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  if (loading) {
    return (
      <div className="px-[10px] md:px-8 py-8 w-full max-w-7xl mx-auto">
        <AdminPageHeader title="Store Settings" description="Loading settings..." />
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black dark:border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-black uppercase tracking-widest text-gray-400">Loading your store settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-[10px] md:px-8 py-8 w-full max-w-7xl mx-auto">
        <AdminPageHeader title="Store Settings" description="Error loading settings." />
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 rounded-2xl p-10 text-center max-w-2xl mx-auto shadow-sm">
          <h3 className="text-xl font-black uppercase mb-2 text-gray-900 dark:text-gray-100">Connection Failed</h3>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">{error}</p>
          <button onClick={loadData} className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all cursor-pointer">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-[10px] md:px-8 py-8 w-full max-w-7xl mx-auto">
      <AdminPageHeader
        title="Store Settings"
        description="Update your store info, payment details, brand assets, and communication templates."
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-gray-50/50 dark:bg-neutral-800/30 p-1.5 rounded-2xl w-fit border border-gray-100 dark:border-neutral-800">
        <Link
          href="/admin/settings"
          className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer bg-black text-white dark:bg-white dark:text-black shadow-sm"
        >
          Store & Brand
        </Link>
        <Link
          href="/admin/settings/email"
          className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          Email Templates
        </Link>
        <Link
          href="/admin/settings/notification"
          className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          Notification Templates
        </Link>
      </div>

      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <CompanyDetailsForm initialData={storeSettings || {}} />
            <CategoryManagement onDeleteRequest={(id, label) => setPendingDelete({ type: 'category', id, label })} />
          </div>

          <div className="space-y-8">
            <PaymentDetailsForm initialData={storeSettings || {}} />
            <BrandAssetsForm initialData={storeSettings || {}} />
          </div>
        </div>

        <BannerManagement
          onAdd={() => { setEditingBannerId(null); setBannerToEdit(null); setShowBannerModal(true); }}
          onEdit={handleEditBanner}
          onDeleteRequest={(id, label) => setPendingDelete({ type: 'banner', id, label })}
        />
      </div>

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

      <BannerModal
        isOpen={showBannerModal}
        onClose={() => setShowBannerModal(false)}
        editingId={editingBannerId}
        bannerToEdit={bannerToEdit}
      />
    </div>
  );
}
