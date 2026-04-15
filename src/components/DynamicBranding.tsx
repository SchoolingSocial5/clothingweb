"use client";
import { useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { getImageUrl } from "@/utils/image";

export default function DynamicBranding() {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;

    // 1. Dynamic Favicon
    if (settings.favicon) {
      const faviconUrl = getImageUrl(settings.favicon);
      if (faviconUrl) {
        // Update standard favicon
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = faviconUrl;

        // Update Apple touch icon
        let appleIcon: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
        if (!appleIcon) {
          appleIcon = document.createElement("link");
          appleIcon.rel = "apple-touch-icon";
          document.head.appendChild(appleIcon);
        }
        appleIcon.href = faviconUrl;
      }
    }

    // 2. Dynamic Title Override (Optional choice)
    if (settings.company_name && settings.company_name !== "Wink") {
      // document.title = settings.company_name;
    }
  }, [settings]);

  return null; // This component doesn't render anything UI-wise
}
