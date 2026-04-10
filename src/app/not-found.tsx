"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-[10px] md:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[28vw] font-black text-gray-50 tracking-tighter leading-none whitespace-nowrap">
          404
        </p>
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Icon */}
        <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-black/20">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="12"/>
            <line x1="11" y1="16" x2="11.01" y2="16"/>
          </svg>
        </div>

        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-none">
          Oops!
        </h1>
        <p className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-300 mb-4">
          Page Not Found
        </p>
        <p className="text-gray-400 font-medium mb-10 leading-relaxed max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-3 px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-black uppercase tracking-widest text-sm hover:border-black hover:text-black transition-all active:scale-95 cursor-pointer w-full sm:w-auto justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Go Back
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-900 shadow-2xl shadow-black/20 transition-all active:scale-95 w-full sm:w-auto justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
