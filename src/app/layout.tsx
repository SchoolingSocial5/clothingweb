import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hi Health Equipment",
  description: "Explore the various collection of Hi Health Equipment",
  manifest: "/manifest.json",
};

import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from '@/context/AuthContext';
import ThemeProvider from "@/components/ThemeProvider";
import Footer from "@/components/Footer";
import { SettingsProvider } from "@/context/SettingsContext";
import DynamicBranding from "@/components/DynamicBranding";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import PWARegister from "@/components/PWARegister";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} antialiased`}>
      <head>
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (const registration of registrations) {
                      registration.unregister().then((success) => {
                        if (success) {
                          console.log("Successfully cleared development Service Worker cache!");
                          window.location.reload();
                        }
                      });
                    }
                  });
                }
              `
            }}
          />
        )}
      </head>
      <body className="min-h-screen font-sans transition-colors duration-300 flex flex-col">
        <SettingsProvider>
          <DynamicBranding />
          <AuthProvider>
            <CartProvider>
              <ThemeProvider>
                <div className="flex-1 flex flex-col">
                  {children}
                </div>
                <Footer />
                <WhatsAppButton />
                <PWARegister />
              </ThemeProvider>
            </CartProvider>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
