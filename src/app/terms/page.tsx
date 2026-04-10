"use client";

import Header from "@/components/Header";
import Link from "next/link";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing and using this website, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services."
  },
  {
    title: "2. Use of the Site",
    body: "You agree to use this site only for lawful purposes and in a manner that does not infringe the rights of others. You must not misuse our platform or attempt to gain unauthorised access to any part of it."
  },
  {
    title: "3. Products & Pricing",
    body: "All products are subject to availability. We reserve the right to limit quantities and discontinue products at any time. Prices are subject to change without notice."
  },
  {
    title: "4. Orders & Payment",
    body: "By placing an order, you confirm that all information provided is accurate. We reserve the right to refuse or cancel orders at our discretion. Payment must be completed before your order is processed."
  },
  {
    title: "5. Shipping & Delivery",
    body: "Delivery times are estimates and may vary. We are not liable for delays caused by third-party carriers or circumstances beyond our control."
  },
  {
    title: "6. Returns & Refunds",
    body: "Items may be returned within the specified return window if they are unused and in their original condition. Contact our support team to initiate a return."
  },
  {
    title: "7. Intellectual Property",
    body: "All content on this site, including text, images, and logos, is the property of this store and may not be reproduced without written permission."
  },
  {
    title: "8. Privacy",
    body: "Your personal information is handled in accordance with our Privacy Policy. By using this site, you consent to the collection and use of your data as described."
  },
  {
    title: "9. Limitation of Liability",
    body: "To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of this site or our products."
  },
  {
    title: "10. Changes to Terms",
    body: "We reserve the right to update these Terms and Conditions at any time. Continued use of the site after changes are posted constitutes your acceptance of the revised terms."
  }
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="max-w-3xl mx-auto px-[10px] md:px-8 py-12 md:py-24">
        <div className="mb-10 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">Terms &amp; Conditions</h1>
          <p className="text-gray-400 text-sm font-medium">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-base font-black uppercase tracking-widest text-gray-900 mb-3">{s.title}</h2>
              <p className="text-gray-500 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 md:mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">Questions about our terms?</p>
          <Link
            href="/contact"
            className="text-sm font-black uppercase tracking-widest text-black underline underline-offset-4 hover:text-gray-600 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
