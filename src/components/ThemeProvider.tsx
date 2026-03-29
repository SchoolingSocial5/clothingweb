"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle system theme changes if needed or just rely on store
  
  return <>{children}</>;
}
