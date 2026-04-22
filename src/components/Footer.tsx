"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';
import { useSocialMediaStore } from '@/store/useSocialMediaStore';
import { getImageUrl } from '@/utils/image';

export default function Footer() {
  const pathname = usePathname();
  const { settings, loading: settingsLoading } = useSettings();
  const { platforms, fetchData } = useSocialMediaStore();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hide footer on admin and dashboard pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')) {
    return null;
  }
  const companyName = settings?.company_name || 'Wink Ecommerce';
  const logoSrc = getImageUrl(settings?.logo);

  // Helper to render social icons
  const renderIcon = (platformName: string) => {
    const name = platformName.toLowerCase();
    if (name.includes('facebook')) return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
    if (name.includes('instagram')) return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
    if (name.includes('twitter') || name.includes(' x')) return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-1 2.17-2.75 3.85a9.14 9.14 0 0 1-13.5 1.15c-1.3-1.1-2-2.5-3.1-4.25A19.34 19.34 0 0 0 4 10a9.23 9.23 0 0 0 6.5 8.85c-2.3 1.12-4.1 1-6.5.6a9.27 9.27 0 0 0 8.5 6.4c-4.4 3-10.4 1-10.4 1 5.9 3.5 13 1 13-8.8a13.3 13.3 0 0 0 3.5-3.5Z"/></svg>;
    if (name.includes('linkedin')) return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
  };

  return (
    <footer className="w-full bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-800 py-12 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          {/* Brand/Logo Section */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="group">
              {settingsLoading ? (
                <div className="h-8 w-24 bg-gray-100 dark:bg-neutral-800 animate-pulse rounded-lg" />
              ) : logoSrc ? (
                <img src={logoSrc} alt={companyName} className="h-10 max-w-[140px] w-auto object-contain dark:invert transition-transform group-hover:scale-105" />
              ) : (
                <span className="text-xl font-black uppercase tracking-tight">{companyName}</span>
              )}
            </Link>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-xs text-center md:text-left">
              Elevating your style with curated collections and premium quality essentials.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {platforms.length > 0 ? platforms.map(platform => (
              <a 
                key={platform.name} 
                href={platform.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all active:scale-95"
                title={platform.name}
              >
                {renderIcon(platform.name)}
              </a>
            )) : (
              <div className="text-xs font-bold uppercase tracking-widest text-gray-300 dark:text-gray-700 italic">Follow us on social media</div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
              © {currentYear} {companyName}. All rights reserved.
            </p>
            <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-neutral-800"></span>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-300">
              Developed by <span className="text-black dark:text-white hover:underline cursor-default">Kenny Tech Studios</span>
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">Contact</Link>
            <Link href="/faq" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
