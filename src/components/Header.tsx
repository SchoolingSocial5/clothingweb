"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useProductStore, Product } from "@/store/useProductStore";
import { getImageUrl } from "@/utils/image";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const { products, fetchProducts } = useProductStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const logoSrc = getImageUrl(settings?.logo);

  const navLinks = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
  ];

  // Ensure products are loaded when search opens
  useEffect(() => {
    if (isSearchOpen) {
      if (products.length === 0) fetchProducts();
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [isSearchOpen]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isSearchOpen]);

  // Search results: filter by name or category
  const searchResults: Product[] = searchQuery.trim().length > 0
    ? products.filter((p) => {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q);
      }).slice(0, 8)
    : [];

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-gray-100 dark:border-neutral-800 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo - Left */}
        <Link href="/" className="flex-shrink-0 group">
          {settingsLoading ? (
            <div className="h-8 w-24 bg-gray-100 dark:bg-neutral-800 animate-pulse rounded-lg" />
          ) : logoSrc ? (
            <img src={logoSrc} alt={settings?.company_name || "Logo"} className="h-10 max-w-[140px] w-auto object-contain transition-transform group-hover:scale-105" />
          ) : (
            <span className="text-xl font-black uppercase tracking-tight">{settings?.company_name || "Store"}</span>
          )}
        </Link>

        {/* Center: Nav (desktop, hidden when search open) */}
        {!isSearchOpen && (
          <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-label hover:text-foreground transition-colors">{link.name}</Link>
            ))}
            {user && (
              <Link href={user.status === 'staff' ? '/admin' : '/dashboard'} className="text-label hover:text-foreground transition-colors">
                {user.status === 'staff' ? 'Admin' : 'Dashboard'}
              </Link>
            )}
          </nav>
        )}

        {/* Center: Search input expanded (desktop) */}
        {isSearchOpen && (
          <div className="hidden md:flex flex-1 max-w-xl mx-auto relative">
            <div className="w-full flex items-center gap-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white transition-all">
              <svg className="text-gray-400 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or categories..."
                className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
            {/* Dropdown results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden z-50">
                {searchResults.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    {getImageUrl(p.image_url) ? (
                      <img src={getImageUrl(p.image_url)!} alt={p.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 dark:bg-neutral-800 rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                    </div>
                    <span className="text-sm font-black text-gray-900 dark:text-gray-100 flex-shrink-0">
                      {settings?.currency_symbol || "₦"}{Number(p.price).toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            {searchQuery.trim().length > 0 && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-xl px-4 py-6 text-center z-50">
                <p className="text-sm text-gray-400 font-medium">No products found for &ldquo;{searchQuery}&rdquo;</p>
              </div>
            )}
          </div>
        )}

        {/* Actions - Right */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {/* Desktop: sign-in / logout (hidden when search open) */}
          {!isSearchOpen && (
            <div className="hidden md:flex items-center gap-4 mr-2">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-label hidden lg:block">Hi, {user.name.split(' ')[0]}</span>
                  <button onClick={logout} className="btn btn-ghost btn-sm text-xs">Logout</button>
                </div>
              ) : (
                <Link href="/sign-in" className="text-label hover:text-foreground transition-colors">Sign In</Link>
              )}
            </div>
          )}

          {/* Search icon button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
            aria-label="Search"
          >
            {isSearchOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            )}
          </button>

          {/* Theme + Cart (hidden on mobile when search open) */}
          <div className={`flex items-center gap-2 ${isSearchOpen ? 'hidden md:flex' : 'flex'}`}>
            <ThemeToggle />
            <Link href="/checkout" className="relative p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors group text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-110 transition-transform"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full scale-90 border-2 border-white dark:border-neutral-900">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            {isMenuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile: Search expand area */}
      {isSearchOpen && (
        <div className="md:hidden px-4 pb-3 relative">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white transition-all">
            <svg className="text-gray-400 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products or categories..."
              className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
          {searchResults.length > 0 && (
            <div className="absolute left-4 right-4 top-full mt-1 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden z-50">
              {searchResults.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  {getImageUrl(p.image_url) ? (
                    <img src={getImageUrl(p.image_url)!} alt={p.name} className="w-9 h-9 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 bg-gray-100 dark:bg-neutral-800 rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                  </div>
                  <span className="text-sm font-black text-gray-900 dark:text-gray-100 flex-shrink-0">
                    {settings?.currency_symbol || "₦"}{Number(p.price).toLocaleString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
          {searchQuery.trim().length > 0 && searchResults.length === 0 && (
            <div className="absolute left-4 right-4 top-full mt-1 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-xl px-4 py-6 text-center z-50">
              <p className="text-sm text-gray-400 font-medium">No products found for &ldquo;{searchQuery}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && !isSearchOpen && (
        <div className="md:hidden bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800 animate-in slide-in-from-top duration-300 overflow-hidden">
          <nav className="p-8 flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-neutral-800 pb-2"
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  href={user.status === 'staff' ? '/admin' : '/dashboard'}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-neutral-800 pb-2"
                >
                  {user.status === 'staff' ? 'Admin' : 'Dashboard'}
                </Link>
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="text-left text-lg font-black uppercase tracking-widest text-red-500"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <Link
                href="/sign-in"
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-gray-100"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
