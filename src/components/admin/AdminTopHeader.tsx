"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AdminTopHeaderProps {
  title?: string;
  onToggleSidebar?: () => void;
}

export default function AdminTopHeader({ title, onToggleSidebar }: AdminTopHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  // Derive title from pathname if not provided
  const derivedTitle = title || `Admin ${pathname === '/admin' ? 'Dashboard' : pathname.split('/').pop()?.replace(/-/g, ' ')}`;

  return (
    <header className="h-20 py-5 w-full bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
          aria-label="Toggle Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 className="text-lg md:text-xl font-bold capitalize text-gray-900 dark:text-gray-100 truncate max-w-[150px] sm:max-w-none">{derivedTitle}</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button className="relative text-gray-500 hover:text-black dark:hover:text-white p-2 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-900 leading-tight">{user.name}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.status}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center text-sm font-black shadow-lg shadow-black/10 uppercase transition-transform hover:scale-105 cursor-pointer">
            {user.name.substring(0, 2)}
          </div>
        </div>
      </div>
    </header>
  );
}
