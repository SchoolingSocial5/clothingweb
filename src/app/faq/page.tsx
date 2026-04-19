"use client";

import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { useFaqStore } from "@/store/useFaqStore";

export default function FAQPage() {
  const { faqs, loading, fetchFaqs } = useFaqStore();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
      <Header />

      <section className="max-w-3xl mx-auto px-[10px] md:px-8 py-12 md:py-24">
        <div className="text-center mb-12 md:mb-20">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 text-gray-900 dark:text-gray-100 transition-all">Common Questions</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Everything you need to know.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 dark:border-neutral-700 border-t-black dark:border-t-white rounded-full animate-spin" />
          </div>
        ) : faqs.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 font-medium italic py-12">No FAQs available yet.</p>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={`border-2 rounded-2xl md:rounded-3xl transition-all duration-300 ${
                  openIndex === index
                    ? "border-black dark:border-white shadow-lg dark:shadow-black/30"
                    : "border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-[10px] md:px-8 py-5 md:py-6 flex items-center justify-between text-left gap-4"
                >
                  <span className="font-bold text-base md:text-lg tracking-tight text-gray-900 dark:text-gray-100">{faq.question}</span>
                  <span className={`flex-shrink-0 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${openIndex === index ? "rotate-45" : ""}`}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </span>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="px-[10px] md:px-8 pb-6 md:pb-8 text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 md:mt-20 p-8 md:p-12 bg-black dark:bg-white text-white dark:text-black rounded-[2rem] md:rounded-[3rem] text-center shadow-2xl">
          <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
          <p className="text-gray-400 dark:text-gray-600 mb-8 max-w-sm mx-auto">We&apos;re here to help you with anything you need.</p>
          <a href="/contact" className="inline-block bg-white dark:bg-black text-black dark:text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-85 transition-all">
            Contact Support
          </a>
        </div>
      </section>
    </main>
  );
}
