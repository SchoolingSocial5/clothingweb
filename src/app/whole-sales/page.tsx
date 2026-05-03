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
import ProductImageModal from "@/components/ProductImageModal";
import { getImageUrl } from "@/utils/image";
import { useBlogStore, Blog } from "@/store/useBlogStore";

const PER_PAGE = 20;

export default function WholeSales() {
  const products = useProductStore(state => state.products);
  const productsLoading = useProductStore(state => state.loading);
  const fetchProducts = useProductStore(state => state.fetchProducts);
  
  const allBanners = useBannerStore(state => state.banners);
  const bannersLoading = useBannerStore(state => state.loading);
  const fetchBanners = useBannerStore(state => state.fetchBanners);
  
  const fetchPublicBlogs = useBlogStore(state => state.fetchPublicBlogs);
  const banners = allBanners.filter(b => b.category === 'Whole Sales');
  const [page, setPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Infinity]);
  const [wholeBlog, setWholeBlog] = useState<Blog | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchBanners();

    fetchPublicBlogs()
      .then(data => {
        const blog = data.find(b => b.category?.toLowerCase() === 'whole sales');
        if (blog) setWholeBlog(blog);
      })
      .catch(() => {});
  }, [fetchProducts, fetchBanners, fetchPublicBlogs]);

  // Filter by product_type === 'Whole', category, colors and price, then sort by availability (in-stock first)
  const filtered = products.filter((p) => {
    if (p.product_type !== 'Whole') return false;
    if (selectedCategory !== "All Products" && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (selectedColors.length > 0 && !selectedColors.includes((p.color || "").trim().toLowerCase())) return false;
    const price = parseFloat(p.price);
    if (!isNaN(price) && price > priceRange[1]) return false;
    return true;
  }).sort((a, b) => {
    const aAvailable = Number(a.quantity) > 0 ? 1 : 0;
    const bAvailable = Number(b.quantity) > 0 ? 1 : 0;
    return bAvailable - aAvailable;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const changePage = (p: number) => {
    setPage(p);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  return (
    <main className="w-full min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
      <Header />

      {/* Hero Section */}
      <section className="w-full h-[40vh] bg-neutral-900 relative">
        {bannersLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : banners.length > 0 ? (
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
                    src={getImageUrl(banner.image_url) || "/menstore3.jpg"}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 z-10"></div>

                  <div className="z-20 text-center px-4 max-w-5xl">
                    <h2 className="text-white text-sm md:text-base font-bold tracking-[0.4em] uppercase mb-4">
                      {banner.subtitle || "Wholesale Opportunity"}
                    </h2>
                    <h1 className="text-3xl md:text-5xl font-sans font-black text-white uppercase tracking-tighter mb-8 leading-[0.9]">
                      {banner.title || "Whole Sales Collection"}
                    </h1>
                    <button
                      onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                      className="btn bg-white text-black px-10 py-4 text-sm font-black tracking-widest uppercase hover:bg-gray-100"
                    >
                      View Deals
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 to-neutral-800 opacity-90"></div>
            <div className="z-20 text-center px-4">
              <h2 className="text-white text-sm font-bold tracking-[0.3em] uppercase mb-4">B2B Solutions</h2>
              <h1 className="text-3xl md:text-5xl font-sans font-black text-white uppercase tracking-tighter mb-8 max-w-4xl leading-none">
                Premium Whole Sales<br />for Your Business
              </h1>
              <button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-gray-200"
              >
                Explore Inventory
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Whole Sales Intro */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row gap-8 items-center bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-8 md:p-12 rounded-[2.5rem] shadow-sm">
           <div className="flex-1">
             <h2 className="text-3xl font-bold mb-6 tracking-tight text-gray-900 dark:text-gray-100 uppercase italic">
                {wholeBlog?.title || 'Wholesale Partnership'}
              </h2>
              {wholeBlog ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: wholeBlog.content }}
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                  We offer exclusive wholesale pricing for retailers and business partners. Access our full catalog at competitive rates to grow your business with Hi Health Equipment.
                </p>
              )}
           </div>
        </div>
      </section>

      {/* Products Area */}
      <section id="products" className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-12 flex gap-6 items-start">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          selectedColors={selectedColors}
          onColorsChange={(colors) => { setSelectedColors(colors); setPage(1); }}
          priceRange={priceRange}
          onPriceRangeChange={(range) => { setPriceRange(range); setPage(1); }}
          allProducts={products.filter(p => p.product_type === 'Whole')}
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap justify-between items-end mb-10 pb-4 border-b border-gray-100 dark:border-neutral-800 gap-3">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">
                {selectedCategory === "All Products" ? "Whole Sales Inventory" : selectedCategory}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {productsLoading
                  ? 'Loading wholesale products...'
                  : filtered.length === 0
                    ? 'No products found'
                    : `Showing wholesale items`
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {productsLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-neutral-800 rounded-2xl h-80 animate-pulse" />
              ))
              : paginated.length > 0
                ? paginated.map((p, index) => (
                  <ProductCard 
                    key={p.id} 
                    {...p} 
                    onImageClick={() => {
                      setPreviewIndex((page - 1) * PER_PAGE + index);
                      setIsPreviewOpen(true);
                    }}
                  />
                ))
                : (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No wholesale products found</p>
                  </div>
                )
            }
          </div>

          {!productsLoading && totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-3">
               {/* Simplified pagination for example */}
               {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => changePage(p)}
                  className={`min-w-[40px] h-10 rounded-full text-sm font-bold transition-all ${p === page
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'border border-gray-200 dark:border-neutral-800 text-gray-500 hover:border-black'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <ProductImageModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        products={filtered}
        initialIndex={previewIndex}
      />
    </main>
  );
}
