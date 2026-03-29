"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-gray-100 dark:border-neutral-800 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
        {/* Logo - Left */}
        <Link href="/" className="flex-shrink-0 group">
          <img src="/clothinglog.png" alt="Wink Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105 dark:invert" />
        </Link>

        {/* Menu - Center (Desktop) */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">{link.name}</Link>
          ))}
          {user && (
             <Link href={user.status === 'staff' ? '/admin' : '/dashboard'} className="text-sm font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">
               {user.status === 'staff' ? 'Admin' : 'Dashboard'}
             </Link>
          )}
        </nav>

        {/* Actions - Right */}
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400 hidden lg:block">Hi, {user.name.split(' ')[0]}</span>
                <button 
                  onClick={logout}
                  className="text-xs font-black uppercase tracking-widest bg-gray-50 dark:bg-neutral-800 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer text-gray-900 dark:text-gray-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/sign-in" className="text-sm font-black uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-400 transition-colors text-gray-900 dark:text-gray-100">
                Sign In
              </Link>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <Link href="/checkout" className="relative p-2 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-full transition-colors group text-gray-900 dark:text-gray-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-110 transition-transform"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full scale-90 border-2 border-white dark:border-neutral-900">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Hamburger Menu Icon (Mobile) */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-black transition-colors cursor-pointer"
          >
            {isMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top duration-300 overflow-hidden">
          <nav className="p-8 flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-black uppercase tracking-widest text-gray-900 border-b border-gray-50 pb-2"
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <>
                <Link 
                  href={user.status === 'staff' ? '/admin' : '/dashboard'} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-black uppercase tracking-widest text-gray-900 border-b border-gray-50 pb-2"
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
                className="text-lg font-black uppercase tracking-widest text-gray-900"
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
