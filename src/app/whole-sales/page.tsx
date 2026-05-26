"use client";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import { useWholesaleProductStore } from "@/store/useWholesaleProductStore";
import { useBannerStore } from "@/store/useBannerStore";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ProductImageModal from "@/components/ProductImageModal";
import { getImageUrl } from "@/utils/image";
import { useBlogStore, Blog } from "@/store/useBlogStore";
import PageLoader from "@/components/common/PageLoader";

const PER_PAGE = 20;

export default function WholeSales() {
  const wholesaleProducts = useWholesaleProductStore(state => state.wholesaleProducts);
  const productsLoading = useWholesaleProductStore(state => state.loading);
  const fetchWholesaleProducts = useWholesaleProductStore(state => state.fetchWholesaleProducts);
  
  const allBanners = useBannerStore(state => state.banners);
  const bannersLoading = useBannerStore(state => state.loading);
  const fetchBanners = useBannerStore(state => state.fetchBanners);
  
  const fetchPublicBlogs = useBlogStore(state => state.fetchPublicBlogs);
  const banners = allBanners.filter(b => b.category === 'Whole Sales');
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Infinity]);
  const [wholeBlog, setWholeBlog] = useState<Blog | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [blogsLoading, setBlogsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchWholesaleProducts();
    fetchBanners();

    fetchPublicBlogs()
      .then(data => {
        const blog = data.find(b => b.category?.toLowerCase() === 'whole sales');
        if (blog) setWholeBlog(blog);
      })
      .catch(() => {})
      .finally(() => setBlogsLoading(false));
  }, [fetchWholesaleProducts, fetchBanners, fetchPublicBlogs]);

  // Filter by category and price, then sort by availability (in-stock first)
  const filtered = wholesaleProducts.filter((p) => {
    if (selectedCategory !== "All Products" && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
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

  const isPageLoading = productsLoading || bannersLoading || blogsLoading || !mounted;

  return (
    <main className="w-full min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
      <PageLoader isLoading={isPageLoading} />
      <Header />

      {/* Spacer to replace hero section and separate header from main content */}
      <div className="h-10"></div>

      {/* Products Area */}
      <section id="products" className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="w-full">
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
                    {...(p as any)} 
                    isWholesale={true}
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
        products={filtered as any}
        initialIndex={previewIndex}
      />
    </main>
  );
}
