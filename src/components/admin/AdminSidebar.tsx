"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useEffect, useState, useRef } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { getImageUrl } from '@/utils/image';
import { useOrderStore } from '@/store/useOrderStore';
import { apiClient } from '@/utils/api';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const [contentOpen, setContentOpen] = useState(
    pathname.startsWith('/admin/faq') ||
    pathname.startsWith('/admin/blog') ||
    pathname.startsWith('/admin/terms') ||
    pathname.startsWith('/admin/social-media') ||
    pathname.startsWith('/admin/pages/banners')
  );
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.startsWith('/admin/settings') ||
    pathname.startsWith('/admin/staff')
  );
  const logoSrc = getImageUrl(settings?.logo);
  const { unpaidCount } = useOrderStore();

  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const isDispatcher = user?.staffPosition?.toLowerCase().includes('dispatch');

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const toggleLocationTracking = async () => {
    if (isTracking) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTracking(false);
      try {
        await apiClient('/admin/users/profile/location', {
          method: 'PATCH',
          body: { isTrackingEnabled: false }
        });
      } catch (err) {
        console.error('Failed to disable location tracking:', err);
      }
    } else {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
      }

      setIsTracking(true);
      try {
        await apiClient('/admin/users/profile/location', {
          method: 'PATCH',
          body: { isTrackingEnabled: true }
        });
      } catch (err) {
        console.error('Failed to enable location tracking:', err);
      }

      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await apiClient('/admin/users/profile/location', {
              method: 'PATCH',
              body: { latitude, longitude, isTrackingEnabled: true }
            });
          } catch (err) {
            console.error('Failed to send coordinates update:', err);
          }
        },
        (error) => {
          let errorMsg = 'Unknown location error';
          if (error.code === 1) errorMsg = 'Permission denied - Please enable browser location services';
          else if (error.code === 2) errorMsg = 'Position unavailable - GPS signal or network disconnected';
          else if (error.code === 3) errorMsg = 'Timeout occurred while waiting for GPS coordinates';
          
          console.error(`Error watching location (Code ${error.code}): ${error.message || errorMsg}`);
          alert(`Location tracking error: ${errorMsg}`);
          
          // Reset tracking state on failure
          setIsTracking(false);
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
        },
        {
          enableHighAccuracy: false, // Prevents satellite timeout failures on desktop browsers
          timeout: 30000,            // Throttles timeout back to 30 seconds
          maximumAge: 0
        }
      );

      watchIdRef.current = watchId;
    }
  };

  const isSuper =
    user?.role === 'admin' ||
    user?.status === 'admin' ||
    user?.staffPosition === 'Director' ||
    user?.staffPosition === 'Developer';
  const staffType = user?.staff_type || user?.staffType || 'Retail';

  const canShowRetail = isSuper || staffType === 'Retail' || staffType === 'All';
  const canShowWholesale = isSuper || staffType === 'Wholesale' || staffType === 'All';

  // Consolidate roles for RBAC check
  const allRoles = `${user?.role || ''},${user?.staffRole || ''}`.toLowerCase();
  const hasAccess = (moduleName: string) => {
    if (user?.status === 'admin') return true;
    if (allRoles.includes('all')) return true;
    if (user?.staffPosition === 'Manager' && moduleName !== 'setting') {
      return true;
    }
    return allRoles.includes(moduleName.toLowerCase());
  };

  const shouldShowMenu = (label: string) => {
    // My Profile is always shown
    if (label.toLowerCase() === 'my profile') return true;

    // Super admins or staff with staffRole "All" see all allowed menus
    const staffRoleStr = user?.staffRole || '';
    const hasAll = staffRoleStr.toLowerCase().trim() === 'all' || isSuper;
    if (hasAll) {
      if (label === 'Customers') return hasAccess('customer');
      if (label === 'Whole Sale Products') return hasAccess('product');
      if (label === 'Expenses') return hasAccess('expense');
      if (label === 'Content') return hasAccess('content');
      if (label === 'Settings') return hasAccess('setting');
      if (label === 'Purchases' || label === 'Wholesale Purchases') return hasAccess('purchase');
      if (label === 'Orders' || label === 'Wholesale Orders' || label === 'Transactions' || label === 'Wholesale Trans') {
        return hasAccess('order');
      }
      return true;
    }

    // Otherwise, check if menu name is in user's staffRole (case-insensitive comma-separated check)
    const userRoles = staffRoleStr.split(',').map(r => r.trim().toLowerCase()).filter(Boolean);
    const searchLabel = label.toLowerCase();
    const hasSettingsRole = userRoles.includes('settings');

    return userRoles.some(role => {
      // Direct matches or smart mapping:
      if (role === 'orders' && (searchLabel === 'orders' || searchLabel === 'wholesale orders')) return true;
      if (role === 'transactions' && (searchLabel === 'transactions' || searchLabel === 'wholesale trans')) return true;
      if (role === 'products' && (searchLabel === 'retail products' || searchLabel === 'whole sale products' || searchLabel === 'products')) return true;
      if (role === 'purchases' && (searchLabel === 'purchases' || searchLabel === 'wholesale purchases')) return true;
      if (role === 'content' && searchLabel === 'content') return true;
      if (role === 'settings' && searchLabel === 'settings') return true;

      // Allow settings parent menu if they have access to any setting submenus
      if (searchLabel === 'settings' && (
        role === 'company' ||
        role === 'email template' ||
        role === 'notification template' ||
        role === 'finance' ||
        role === 'position' ||
        role === 'staff'
      )) return true;

      // Submenus allow if they have settings permission or explicit submenu permission
      const settingSubmenus = ['company', 'email template', 'notification template', 'finance', 'position', 'staff'];
      if (settingSubmenus.includes(searchLabel) && hasSettingsRole) return true;

      if (searchLabel === 'company' && role === 'company') return true;
      if (searchLabel === 'email template' && role === 'email template') return true;
      if (searchLabel === 'notification template' && role === 'notification template') return true;
      if (searchLabel === 'finance' && role === 'finance') return true;
      if (searchLabel === 'position' && role === 'position') return true;
      if (searchLabel === 'staff' && role === 'staff') return true;

      return searchLabel === role || searchLabel.includes(role) || role.includes(searchLabel);
    });
  };

  // Close sidebar on path change (mobile)
  const lastPathname = useRef(pathname);
  useEffect(() => {
    if (lastPathname.current !== pathname) {
      onClose();
      lastPathname.current = pathname;
    }
  }, [pathname, onClose]);

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 
      transform transition-transform duration-300 ease-in-out md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
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
          onClick={onClose}
          className="md:hidden p-2 text-gray-500 hover:text-black dark:hover:text-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-thin">
        {shouldShowMenu('Dashboard') && (
          <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </Link>
        )}
        {shouldShowMenu('Customers') && (
          <Link href="/admin/customers" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/customers' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            Customers
          </Link>
        )}
        {canShowRetail && shouldShowMenu('Orders') && (
          <Link href="/admin/orders" className={`flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/orders' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span>Orders</span>
            </div>
            {unpaidCount > 0 && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md flex items-center justify-center min-w-[20px] transition-colors
                ${pathname === '/admin/orders' 
                  ? 'bg-white text-black dark:bg-black dark:text-white' 
                  : 'bg-black text-white dark:bg-white dark:text-black'
                }`}
              >
                {unpaidCount}
              </span>
            )}
          </Link>
        )}
        {canShowWholesale && shouldShowMenu('Wholesale Orders') && (
          <Link href="/admin/wholesale-orders" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/wholesale-orders' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            Wholesale Orders
          </Link>
        )}
        {canShowRetail && shouldShowMenu('Transactions') && (
          <Link href="/admin/transactions" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/transactions' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            Transactions
          </Link>
        )}
        {canShowWholesale && shouldShowMenu('Wholesale Trans') && (
          <Link href="/admin/wholesale-transactions" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/wholesale-transactions' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            Wholesale Trans
          </Link>
        )}
        {canShowRetail && shouldShowMenu('Retail Products') && (
          <Link href="/admin/products" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/products' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            Retail Products
          </Link>
        )}
        {canShowWholesale && shouldShowMenu('Whole Sale Products') && (
          <Link href="/admin/whole-sale-products" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/whole-sale-products' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            Whole Sale Products
          </Link>
        )}
        {shouldShowMenu('Expenses') && (
          <Link href="/admin/expenses" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/expenses' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            Expenses
          </Link>
        )}
        {canShowRetail && shouldShowMenu('Purchases') && (
          <Link href="/admin/purchases" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/purchases' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            Purchases
          </Link>
        )}
        {canShowWholesale && shouldShowMenu('Wholesale Purchases') && (
          <Link href="/admin/wholesale-purchases" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/wholesale-purchases' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            Wholesale Purchases
          </Link>
        )}
        {shouldShowMenu('My Profile') && (
          <Link href="/admin/profile" className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/profile' ? 'text-white bg-black dark:bg-white dark:text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            My Profile
          </Link>
        )}
        {shouldShowMenu('Content') && (
          <div>
            <button
              onClick={() => setContentOpen((o) => !o)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${contentOpen ? 'text-black bg-gray-50 dark:bg-neutral-800 dark:text-white' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}
            >
              <span className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                Content
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${contentOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {contentOpen && (
              <div className="ml-7 mt-1 space-y-0.5 border-l border-gray-100 dark:border-neutral-800 pl-4">
                <Link href="/admin/social-media" className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${pathname.startsWith('/admin/social-media') ? 'text-black dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                  Social Media
                </Link>
                <Link href="/admin/pages/banners" className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${pathname.startsWith('/admin/pages/banners') ? 'text-black dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                  Banners
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

        {shouldShowMenu('Settings') && (
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {settingsOpen && (
              <div className="ml-7 mt-1 space-y-0.5 border-l border-gray-100 dark:border-neutral-800 pl-4">
                {shouldShowMenu('Company') && (
                  <Link href="/admin/settings" className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/settings' ? 'text-black dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                    Company
                  </Link>
                )}
                {shouldShowMenu('Email Template') && (
                  <Link href="/admin/settings/email" className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/settings/email' ? 'text-black dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                    Email Template
                  </Link>
                )}
                {shouldShowMenu('Notification Template') && (
                  <Link href="/admin/settings/notification" className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/settings/notification' ? 'text-black dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                    Notification Template
                  </Link>
                )}
                {shouldShowMenu('Finance') && (
                  <Link href="/admin/finance" className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/finance' ? 'text-black dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                    Finance
                  </Link>
                )}
                {shouldShowMenu('Position') && (
                  <Link href="/admin/settings/positions" className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/settings/positions' ? 'text-black dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                    Position
                  </Link>
                )}
                {shouldShowMenu('Staff') && (
                  <Link href="/admin/staff" className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${pathname === '/admin/staff' ? 'text-black dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-400 hover:text-black hover:bg-gray-50 dark:hover:bg-neutral-800 dark:hover:text-white'}`}>
                    Staff
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </nav>
      {isDispatcher && (
        <div className="mx-4 mb-4 p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isTracking ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isTracking ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Dispatch Status</span>
            </div>
            <span className="text-[10px] font-bold text-gray-450 dark:text-gray-400">
              {isTracking ? 'Tracking ON' : 'Offline'}
            </span>
          </div>
          <button
            onClick={toggleLocationTracking}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${isTracking ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-102 active:scale-98' : 'bg-red-600 text-white hover:bg-red-700 hover:scale-102 active:scale-98'}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {isTracking ? 'Disable Location' : 'Enable Location'}
          </button>
        </div>
      )}
      <div className="p-4 border-t border-gray-100 dark:border-neutral-800 flex items-center gap-2">
        <button
          onClick={logout}
          className="flex-1 flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Log out
        </button>
        <ThemeToggle />
      </div>
    </aside>
  );
}
