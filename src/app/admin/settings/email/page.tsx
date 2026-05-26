"use client";
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import Link from 'next/link';
import EmailTemplateManagement from '@/components/admin/settings/EmailTemplateManagement';

export default function EmailSettingsPage() {
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
          className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          Store & Brand
        </Link>
        <Link
          href="/admin/settings/email"
          className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer bg-black text-white dark:bg-white dark:text-black shadow-sm"
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
        <EmailTemplateManagement />
      </div>
    </div>
  );
}
