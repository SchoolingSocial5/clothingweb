"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import AdminTopHeader from '@/components/admin/AdminTopHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.status !== 'staff' && user.status !== 'admin'))) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  if (loading || !user || (user.status !== 'staff' && user.status !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 hidden md:flex flex-col transition-colors duration-300">
        <div className="h-20 flex items-center px-8 border-b border-gray-100 dark:border-neutral-800">
          <Link href="/" className="flex items-center">
            <img src="/clothinglog.png" alt="Logo" className="h-10 object-contain dark:invert" />
          </Link>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </Link>
          <Link href="/admin/customers" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/customers' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            Customers
          </Link>
          <Link href="/admin/staff" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/staff' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            Staff
          </Link>
          <Link href="/admin/orders" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/orders' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            Orders
          </Link>
          <Link href="/admin/products" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/products' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            Products
          </Link>
          <Link href="/admin/expenses" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/expenses' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            Expenses
          </Link>
          <Link href="/admin/social-media" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/social-media' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            Social Media
          </Link>
          <Link href="/admin/settings" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/settings' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-neutral-800">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <AdminTopHeader />

        {children}
      </main>
    </div>
  );
}
