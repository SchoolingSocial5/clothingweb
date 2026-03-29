"use client";

import Header from "@/components/Header";
import { useState } from "react";

const faqs = [
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for all unworn and unwashed items. Simply package your item and use the prepaid shipping label included in your original order."
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping typically takes 3-5 business days within the continental US. International shipping can take 7-14 business days depending on the destination."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location and will be calculated at checkout."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order ships, you will receive an email with a tracking number and a link to track your package in real-time."
  },
  {
    question: "What materials do you use?",
    answer: "We prioritize natural and sustainable fibers including organic cotton, silk, and recycled wool. Detailed material information is available on each product page."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <section className="max-w-3xl mx-auto px-8 py-24">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 transition-all">Common Questions</h1>
          <p className="text-gray-500 text-lg">
            Everything you need to know about Wink.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border-2 rounded-3xl transition-all duration-300 ${openIndex === index ? "border-black shadow-lg" : "border-gray-50 bg-gray-50/50 hover:bg-gray-50"}`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left"
              >
                <span className="font-bold text-lg tracking-tight">{faq.question}</span>
                <span className={`transform transition-transform duration-300 ${openIndex === index ? "rotate-45" : ""}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </span>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                <p className="px-8 pb-8 text-gray-500 leading-relaxed font-medium">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 p-12 bg-black text-white rounded-[3rem] text-center shadow-2xl">
           <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
           <p className="text-gray-400 mb-8 max-w-sm mx-auto">We're here to help you with anything you need. Our team is available 24/7.</p>
           <a href="/contact" className="inline-block bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors">
              Contact Support
           </a>
        </div>
      </section>
    </main>
  );
}
