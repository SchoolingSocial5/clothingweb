"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Manage Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === 'development') {
        // Unregister existing service workers in development to prevent caching loops
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().then((success) => {
              if (success) {
                console.log("Successfully unregistered active development Service Worker to prevent caching loops!");
                // Force reload the page once the service worker is cleared to clean up the cached shell
                window.location.reload();
              }
            });
          }
        });
      } else {
        // Register Service Worker in production only
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Service Worker registered successfully:", reg.scope);
            reg.update(); // Force update verification immediately
          })
          .catch((err) => {
            console.error("Service Worker registration failed:", err);
          });
      }
    }

    // Capture the install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show custom install prompt banner
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Detect if app was already installed
    window.addEventListener("appinstalled", () => {
      console.log("Hi-Health App was installed successfully!");
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the browser install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-sm z-[100] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-gray-100 dark:border-neutral-800 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192x192.png" alt="Logo" className="w-10 h-10 object-contain rounded-lg" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Install Hi-Health</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Add to home screen for instant access.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setShowInstallBanner(false)} 
          className="px-3 py-2 text-xs font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          Later
        </button>
        <button 
          onClick={handleInstallClick} 
          className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-black rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-lg shadow-black/10 cursor-pointer"
        >
          Install
        </button>
      </div>
    </div>
  );
}
