"use client";

import Header from "@/components/Header";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-neutral-900 text-white">
        <div className="absolute inset-0 opacity-40">
           <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-700 to-black"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">Our Story</h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium tracking-tight">
            Redefining modern elegance since 2026.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-8 py-24">
        <div className="space-y-16">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 tracking-tight">The Vision</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Wink was founded on the belief that clothing is more than just fabric—it's an expression of identity. We curate collections that balance timeless silhouettes with contemporary edge.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our mission is to provide high-quality, sustainable fashion that empowers individuals to feel confident and stylish in every moment of their lives.
              </p>
            </div>
            <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-2xl">
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-50 flex items-center justify-center">
                 <span className="text-gray-300 font-black text-6xl uppercase transform -rotate-12">Artistry</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-16 grid md:grid-cols-3 gap-12 text-center">
             <div className="space-y-4">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path></svg>
                </div>
                <h3 className="font-bold text-xl uppercase tracking-tight">Ethical</h3>
                <p className="text-gray-500 text-sm">We ensure fair wages and safe working conditions across our supply chain.</p>
             </div>
             <div className="space-y-4">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <h3 className="font-bold text-xl uppercase tracking-tight">Quality</h3>
                <p className="text-gray-500 text-sm">Only the finest premium materials make it into our limited collections.</p>
             </div>
             <div className="space-y-4">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                </div>
                <h3 className="font-bold text-xl uppercase tracking-tight">Global</h3>
                <p className="text-gray-500 text-sm">Shipping worldwide to bring elegance to every corner of the globe.</p>
             </div>
          </div>
        </div>
      </section>
    </main>
  );
}
