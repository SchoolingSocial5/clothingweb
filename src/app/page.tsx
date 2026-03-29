"use client";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import { useProductStore } from "@/store/useProductStore";
import { useBannerStore } from "@/store/useBannerStore";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductCard from "@/components/ProductCard";

const PER_PAGE = 8;

export default function Home() {
  const { products, loading: productsLoading, fetchProducts } = useProductStore();
  const { banners, fetchBanners } = useBannerStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchProducts();
    fetchBanners();
  }, [fetchProducts, fetchBanners]);

  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const paginated = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const changePage = (p: number) => {
    setPage(p);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="w-full min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
      <Header />

      {/* Immersive Hero Section with Swiper */}
      <section className="w-full h-[75vh] bg-neutral-900 relative">
        {banners.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="w-full h-full"
          >
            {banners.map((banner) => (
              <SwiperSlide key={banner.id}>
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <img
                    src={banner.image_path}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 z-10 transition-opacity group-hover:bg-black/50"></div>

                  <div className="z-20 text-center px-4 max-w-5xl">
                    <h2 className="text-white text-sm md:text-base font-bold tracking-[0.4em] uppercase mb-6 animate-in slide-in-from-bottom-4 duration-700">
                      {banner.subtitle || "New Arrival"}
                    </h2>
                    <h1 className="text-5xl md:text-8xl font-sans font-black text-white uppercase tracking-tighter mb-10 leading-[0.9] animate-in slide-in-from-bottom-8 duration-1000">
                      {banner.title || "The New Collection"}
                    </h1>
                    <button
                      onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-white text-black px-12 py-5 text-sm font-black tracking-widest uppercase hover:bg-gray-100 transition-all active:scale-95 shadow-2xl shadow-black/20"
                    >
                      Explore More
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src="/menstore3.jpg"
              alt="Default Hero"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="z-20 text-center px-4">
              <h2 className="text-white text-sm font-bold tracking-[0.3em] uppercase mb-4">Fall / Winter 2026</h2>
              <h1 className="text-5xl md:text-7xl font-sans font-black text-white uppercase tracking-tighter mb-8 max-w-4xl leading-none">
                The New Definition<br />of Elegance
              </h1>
              <button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-gray-200"
              >
                Shop Collection
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Main Content Area */}
      <section id="products" className="max-w-[1600px] mx-auto px-8 py-20 flex gap-12">
        <Sidebar />

        <div className="flex-1">
          <div className="flex justify-between items-end mb-10 pb-4 border-b border-gray-100 dark:border-neutral-800 transition-colors">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white transition-colors">New Arrivals</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">
                {products.length === 0
                  ? 'Loading products...'
                  : `Showing ${Math.min((page - 1) * PER_PAGE + 1, products.length)}–${Math.min(page * PER_PAGE, products.length)} of ${products.length} items`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Sort by:</span>
              <select className="text-sm font-bold bg-transparent border-none outline-none cursor-pointer text-gray-900 dark:text-gray-100">
                <option className="bg-white dark:bg-neutral-900">Newest Arrivals</option>
                <option className="bg-white dark:bg-neutral-900">Price: High to Low</option>
                <option className="bg-white dark:bg-neutral-900">Price: Low to High</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsLoading
              ? Array.from({ length: PER_PAGE }).map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-neutral-800 rounded-2xl h-80 animate-pulse" />
              ))
              : paginated.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))
            }
          </div>

          {/* Pagination */}
          {!productsLoading && totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              {/* Prev */}
              <button
                onClick={() => changePage(page - 1)}
                disabled={page === 1}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => changePage(p)}
                  className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${p === page
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
                    }`}
                >
                  {p}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() => changePage(page + 1)}
                disabled={page === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
