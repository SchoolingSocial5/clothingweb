"use client";

import Header from "@/components/Header";
import { useSettings } from "@/context/SettingsContext";

export default function ContactPage() {
  const { settings } = useSettings();

  const rawPhone = settings?.phone_number || "";
  const whatsappNumber = rawPhone.replace(/\D/g, "");
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello! I'd like to inquire about your products.")}`
    : "#";

  const phone = rawPhone || "+1 (555) 000-0000";
  const email = settings?.email || "hello@store.com";
  const address = settings?.address || "";

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
      <Header />

      <section className="max-w-[1400px] mx-auto px-[10px] md:px-8 py-10 md:py-20">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-24">
          <div className="space-y-12">
            <div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 text-gray-900 dark:text-gray-100">Contact Us</h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md">
                Have a question or just want to say hello? We&apos;d love to hear from you.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-10 h-10 bg-white dark:bg-neutral-800 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-neutral-700">
                  <svg className="text-gray-600 dark:text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Phone</h3>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{phone}</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-10 h-10 bg-white dark:bg-neutral-800 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-neutral-700">
                  <svg className="text-gray-600 dark:text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Email</h3>
                  <p className="font-bold text-lg text-gray-900 dark:text-gray-100">{email}</p>
                </div>
              </div>

              {address && (
                <div className="flex gap-6">
                  <div className="w-10 h-10 bg-white dark:bg-neutral-800 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-neutral-700">
                    <svg className="text-gray-600 dark:text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Address</h3>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{address}</p>
                  </div>
                </div>
              )}

              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-green-500/20 hover:bg-[#20BA5A] active:scale-[0.98] transition-all w-fit cursor-pointer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-[2rem] md:rounded-[2.5rem] px-[10px] py-6 md:p-12 border border-gray-100 dark:border-neutral-800 shadow-sm">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Full Name</label>
                  <input type="text" className="w-full px-6 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Email Address</label>
                  <input type="email" className="w-full px-6 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Subject</label>
                <input type="text" className="w-full px-6 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all" placeholder="What's this about?" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Message</label>
                <textarea rows={5} className="w-full px-6 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all resize-none" placeholder="How can we help?" />
              </div>
              <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black py-5 rounded-2xl font-bold shadow-xl shadow-black/10 hover:opacity-85 transition-all active:scale-[0.98] cursor-pointer">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

    </main>
  );
}
