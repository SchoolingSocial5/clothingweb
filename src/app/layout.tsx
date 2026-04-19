import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wink Ecommerce",
  description: "Explore the various collection of Wink",
};

import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from '@/context/AuthContext';
import ThemeProvider from "@/components/ThemeProvider";
import Footer from "@/components/Footer";
import { SettingsProvider } from "@/context/SettingsContext";
import DynamicBranding from "@/components/DynamicBranding";
import WhatsAppButton from "@/components/common/WhatsAppButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} antialiased`}>
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
              </ThemeProvider>
            </CartProvider>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
