"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/context/SettingsContext";

interface PageLoaderProps {
  isLoading: boolean;
}

export default function PageLoader({ isLoading }: PageLoaderProps) {
  const { settings } = useSettings();
  const [visible, setVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Butter-smooth fade out transition
      const fadeTimeout = setTimeout(() => setVisible(false), 100);
      const unmountTimeout = setTimeout(() => setShouldRender(false), 500);
      return () => {
        clearTimeout(fadeTimeout);
        clearTimeout(unmountTimeout);
      };
    } else {
      setVisible(true);
      setShouldRender(true);
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  const companyName = settings?.company_name || "Hi-Health";

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-neutral-950 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
      }`}
    >
      {/* Immersive Glowing Aura Background */}
      <div className="absolute w-72 h-72 bg-neutral-100 dark:bg-neutral-900/50 rounded-full blur-[80px] -z-10 animate-pulse duration-[3000ms]" />

      <div className="relative flex flex-col items-center gap-8">
        {/* State-of-the-art Dual Ring Spinner */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Outer Ring - Slow clockwise */}
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 dark:border-neutral-800" />
          <div className="absolute inset-0 rounded-full border-[3px] border-t-black dark:border-t-white animate-spin duration-[1500ms]" />

          {/* Inner Ring - Fast counter-clockwise */}
          <div className="absolute w-16 h-16 rounded-full border-2 border-gray-50 dark:border-neutral-900" />
          <div className="absolute w-16 h-16 rounded-full border-2 border-b-black/40 dark:border-b-white/40 animate-spin-reverse duration-[1000ms]" />
          
          {/* Center Pulsate dot */}
          <div className="w-3.5 h-3.5 bg-black dark:bg-white rounded-full animate-ping duration-1000" />
        </div>

        {/* Shimmering Text Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-sans font-black tracking-[0.2em] uppercase bg-gradient-to-r from-neutral-950 via-neutral-600 to-neutral-950 dark:from-white dark:via-neutral-400 dark:to-white bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto] transition-all">
            {companyName}
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-neutral-500 animate-pulse">
            Loading Essentials
          </p>
        </div>
      </div>

      {/* Global CSS Inject for spin-reverse and shimmering keyframes */}
      <style jsx global>{`
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1s linear infinite;
        }
        @keyframes shimmer {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .animate-shimmer {
          animation: shimmer 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
