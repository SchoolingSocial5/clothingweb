"use client";

import Header from "@/components/Header";
import { useBannerStore } from "@/store/useBannerStore";
import { useEffect, useState } from "react";
import { getImageUrl } from "@/utils/image";
import { useBlogStore, Blog } from "@/store/useBlogStore";

export default function AboutPage() {
  const { banners: allBanners, fetchBanners } = useBannerStore();
  const { fetchPublicBlogs } = useBlogStore();
  const [aboutBlog, setAboutBlog] = useState<Blog | null>(null);

  useEffect(() => {
    fetchBanners();
    fetchPublicBlogs()
      .then(data => {
        const blog = data.find(b => b.category?.toLowerCase() === 'about');
        if (blog) setAboutBlog(blog);
      })
      .catch(() => {});
  }, [fetchBanners, fetchPublicBlogs]);

  const aboutBanner = allBanners.find(b => b.category === 'About');

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-neutral-900 text-white">
        {aboutBanner ? (
          <>
            <img
              src={getImageUrl(aboutBanner.image_url) || ''}
              alt={aboutBanner.title || 'About'}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <div className="absolute inset-0 opacity-40">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-700 to-black" />
          </div>
        )}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            {aboutBanner?.title || 'Our Story'}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium tracking-tight">
            {aboutBanner?.subtitle || 'Redefining modern elegance since 2026.'}
          </p>
        </div>
      </section>

      <style>{`
        .about-content * { max-width: 100% !important; word-break: break-word !important; overflow-wrap: break-word !important; box-sizing: border-box !important; }
        .about-content table { table-layout: fixed !important; width: 100% !important; }
        .about-content img { height: auto !important; }
        .about-content pre { white-space: pre-wrap !important; }
      `}</style>
      <section className="max-w-6xl mx-auto px-[10px] md:px-8 py-24 overflow-x-hidden">
        <div className="space-y-16">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1 min-w-0 pr-[10px] md:pr-8">
              <h2 className="text-3xl font-bold mb-6 tracking-tight text-gray-900 dark:text-gray-100">
                {aboutBlog?.title || 'The Vision'}
              </h2>
              {aboutBlog ? (
                <div
                  className="about-content prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: aboutBlog.content }}
                />
              ) : (
                <>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    Wink was founded on the belief that clothing is more than just fabric—it&apos;s an expression of identity. We curate collections that balance timeless silhouettes with contemporary edge.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Our mission is to provide high-quality, sustainable fashion that empowers individuals to feel confident and stylish in every moment of their lives.
                  </p>
                </>
              )}
            </div>
            <div className="w-full md:w-80 lg:w-96 flex-shrink-0 aspect-square bg-gray-100 dark:bg-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
              {aboutBlog?.image_url ? (
                <img
                  src={getImageUrl(aboutBlog.image_url) || ''}
                  alt={aboutBlog.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 dark:from-neutral-700 to-gray-50 dark:to-neutral-900 flex items-center justify-center">
                  <span className="text-gray-300 dark:text-neutral-600 font-black text-6xl uppercase transform -rotate-12">Artistry</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-neutral-800 pt-16 grid md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path></svg>
              </div>
              <h3 className="font-bold text-xl uppercase tracking-tight text-gray-900 dark:text-gray-100">Ethical</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">We ensure fair wages and safe working conditions across our supply chain.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <h3 className="font-bold text-xl uppercase tracking-tight text-gray-900 dark:text-gray-100">Quality</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Only the finest premium materials make it into our limited collections.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              </div>
              <h3 className="font-bold text-xl uppercase tracking-tight text-gray-900 dark:text-gray-100">Global</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Shipping worldwide to bring elegance to every corner of the globe.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
