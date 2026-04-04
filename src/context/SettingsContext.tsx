"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiClient } from "@/utils/api";

interface Settings {
  company_name: string;
  currency_symbol: string;
  logo?: string;
  favicon?: string;
  email?: string;
  phone_number?: string;
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      // Direct fetch to ensure we get the latest settings
      const data = await apiClient("/settings");
      if (data && typeof data === 'object') {
        setSettings({
          company_name: data.company_name || "Wink",
          currency_symbol: data.currency_symbol || "₦",
          logo: data.logo,
          favicon: data.favicon,
          email: data.email,
          phone_number: data.phone_number,
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      // Fallback settings if the API is unreachable
      setSettings(prev => prev || {
        company_name: "Wink",
        currency_symbol: "₦",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
