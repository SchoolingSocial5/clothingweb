"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useEffect, useState } from 'react';
import AdminTopHeader from '@/components/admin/AdminTopHeader';
import ThemeToggle from '@/components/ThemeToggle';
import { getImageUrl } from '@/utils/image';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const { settings, loading: settingsLoading } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [contentOpen, setContentOpen] = useState(pathname.startsWith('/admin/faq') || pathname.startsWith('/admin/blog') || pathname.startsWith('/admin/terms') || pathname.startsWith('/admin/social-media'));
  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith('/admin/settings') || pathname.startsWith('/admin/staff'));
  const logoSrc = getImageUrl(settings?.logo);

  useEffect(() => {
    if (!loading && (!user || (user.status !== 'staff' && user.status !== 'admin'))) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  // Consolidate roles for RBAC check
  const allRoles = `${user?.role || ''},${user?.staffRole || ''}`.toLowerCase();
  const hasAccess = (moduleName: string) => {
    if (user?.status === 'admin') return true;
    if (allRoles.includes('all')) return true;
    return allRoles.includes(moduleName.toLowerCase());
  };

  // Close sidebar on path change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (loading || !user || (user.status !== 'staff' && user.status !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex transition-colors duration-300 overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 
        transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        <div className="h-20 flex items-center justify-between px-8 border-b border-gray-100 dark:border-neutral-800">
          <Link href="/" className="flex items-center">
            {settingsLoading ? (
                <div className="h-8 w-24 bg-gray-100 dark:bg-neutral-800 animate-pulse rounded-lg" />
              ) : logoSrc ? (
                <img src={logoSrc} alt={settings?.company_name || "Logo"} className="h-10 max-w-[130px] w-auto object-contain" />
              ) : (
                <span className="text-lg font-black uppercase tracking-tight">{settings?.company_name || "Store"}</span>
              )}
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-gray-500 hover:text-black dark:hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </Link>
          {hasAccess('customer') && (
            <Link href="/admin/customers" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/customers' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
              Customers
            </Link>
          )}
          {hasAccess('order') && (
            <>
              <Link href="/admin/orders" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/orders' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                Orders
              </Link>
              <Link href="/admin/transactions" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/transactions' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                Transactions
              </Link>
            </>
          )}
          {hasAccess('product') && (
            <Link href="/admin/products" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/products' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              Products
            </Link>
          )}
          {hasAccess('expense') && (
            <Link href="/admin/expenses" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/expenses' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              Expenses
            </Link>
          )}
          {hasAccess('purchase') && (
            <Link href="/admin/purchases" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/purchases' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              Purchases
            </Link>
          )}

          <Link href="/admin/profile" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/profile' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            My Profile
          </Link>
          {hasAccess('content') && (
            <div>
              <button
                onClick={() => setContentOpen((o) => !o)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${contentOpen ? 'text-black bg-gray-50 dark:bg-neutral-800 dark:text-white' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}
              >
                <span className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  Content
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${contentOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {contentOpen && (
                <div className="ml-7 mt-1 space-y-0.5 border-l border-gray-100 dark:border-neutral-800 pl-4">
                  <Link href="/admin/social-media" className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${pathname.startsWith('/admin/social-media') ? 'text-black dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                    Social Media
                  </Link>
                  {settings?.show_blog !== false && (
                    <Link href="/admin/blog" className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${pathname.startsWith('/admin/blog') ? 'text-black dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                      Blog
                    </Link>
                  )}
                  <Link href="/admin/faq" className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${pathname.startsWith('/admin/faq') ? 'text-black dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                    FAQ
                  </Link>
                  <Link href="/admin/terms" className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${pathname.startsWith('/admin/terms') ? 'text-black dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                    Terms & Conditions
                  </Link>
                </div>
              )}
            </div>
          )}

          {hasAccess('setting') && (
            <div>
              {/* Settings Menu */}
            <button
              onClick={() => setSettingsOpen((o) => !o)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${settingsOpen ? 'text-black bg-gray-50 dark:bg-neutral-800 dark:text-white' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}
            >
              <span className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Settings
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {settingsOpen && (
              <div className="ml-7 mt-1 space-y-0.5 border-l border-gray-100 dark:border-neutral-800 pl-4">
                <Link href="/admin/settings" className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/settings' ? 'text-black dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                  Company
                </Link>
                <Link href="/admin/settings/positions" className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/settings/positions' ? 'text-black dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                  Position
                </Link>
                <Link href="/admin/staff" className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/staff' ? 'text-black dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                  Staff
                </Link>
              </div>
            )}
            </div>
          )}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-neutral-800 flex items-center gap-2">
          <button
            onClick={logout}
            className="flex-1 flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Log out
          </button>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <AdminTopHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {children}
      </main>
    </div>
  );
}
