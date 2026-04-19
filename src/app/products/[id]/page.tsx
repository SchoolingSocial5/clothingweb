"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { useProductStore, Product } from "@/store/useProductStore";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { useWishlistStore } from "@/store/useWishlistStore";
import { formatPrice } from "@/utils/format";
import { getImageUrl } from "@/utils/image";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { products, fetchProducts, fetchProductById } = useProductStore();
  const { addToCart, cart, updateQuantity, removeFromCart } = useCart();
  const { settings } = useSettings();
  const { hydrated, hydrate, toggle, isWishlisted } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setImgError(false);
      
      const data = await fetchProductById(id);
      if (data) {
        setProduct(data);
      } else {
        setProduct(null);
      }
      setLoading(false);
    };
    load();
  }, [id, fetchProductById]);

  // Ensure store is populated for related products
  useEffect(() => {
    if (products.length === 0) fetchProducts();
  }, []);

  const cartItem = cart.find((c) => c.id === Number(id));

  const handleAddToCart = () => {
    if (!product || product.quantity <= 0) return;
    addToCart({ id: product.id, name: product.name, category: product.category, price: product.price, color: product.color, image_url: product.image_url, quantity: product.quantity });
  };

  const related = products
    .filter((p) => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  const resolvedImg = getImageUrl(product?.image_url);
  const showImage = resolvedImg && !imgError;

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
        <Header />
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
            <div className="aspect-[3/4] bg-gray-200 dark:bg-neutral-800 rounded-2xl" />
            <div className="space-y-4 pt-4">
              <div className="h-6 w-24 bg-gray-200 dark:bg-neutral-800 rounded" />
              <div className="h-10 w-3/4 bg-gray-200 dark:bg-neutral-800 rounded" />
              <div className="h-8 w-1/3 bg-gray-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-full bg-gray-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-neutral-800 rounded" />
              <div className="h-14 w-full bg-gray-200 dark:bg-neutral-800 rounded-xl mt-8" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="w-full min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
        <Header />
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-20 text-center">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-4">Product not found</p>
          <Link href="/" className="text-sm font-bold underline text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
            Back to shop
          </Link>
        </div>
      </main>
    );
  }

  const inStock = product.quantity > 0;

  return (
    <main className="w-full min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
      <Header />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main product area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 mb-16 md:mb-24">
          {/* Image */}
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 dark:bg-neutral-800 shadow-sm">
            {!inStock && (
              <div className="absolute top-4 left-4 z-10 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black px-3 py-1.5 uppercase tracking-widest rounded-full shadow-xl">
                Sold Out
              </div>
            )}
            <button
              onClick={() => toggle(product.id)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur shadow-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            >
              {isWishlisted(product.id) ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 dark:text-gray-300">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              )}
            </button>
            {showImage ? (
              <img
                src={resolvedImg}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-100 dark:from-neutral-800 dark:to-neutral-700" />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col py-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 capitalize">{product.category}</p>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 leading-tight mb-4">
              {product.name}
            </h1>
            <p className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-6">
              {formatPrice(product.price, settings?.currency_symbol)}
            </p>

            {/* Color */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Color</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-800 shadow-md ring-2 ring-gray-300 dark:ring-neutral-600"
                  style={{ backgroundColor: product.color }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{product.color}</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Description</p>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:dark:text-gray-100 [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:dark:text-gray-100"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Stock */}
            <div className="mb-8">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${
                inStock
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                {inStock ? `In Stock (${product.quantity} left)` : 'Out of Stock'}
              </span>
            </div>

            {/* Cart action */}
            {cartItem ? (
              <div className="flex items-center gap-4 bg-gray-100 dark:bg-neutral-800 rounded-2xl p-2 w-fit mb-4">
                <button
                  onClick={() => { if (cartItem.quantity > 1) updateQuantity(product.id, cartItem.quantity - 1); else removeFromCart(product.id); }}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-neutral-700 shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors text-gray-700 dark:text-gray-300 font-bold text-xl cursor-pointer"
                >
                  −
                </button>
                <span className="text-xl font-black text-gray-900 dark:text-gray-100 min-w-[2rem] text-center">{cartItem.quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-neutral-700 shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors text-gray-700 dark:text-gray-300 font-bold text-xl cursor-pointer"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`w-full py-4 text-sm font-black uppercase tracking-widest rounded-2xl transition-all duration-200 cursor-pointer mb-4
                  ${inStock
                    ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-85 active:scale-[0.98] shadow-lg shadow-black/10'
                    : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            )}

            <Link
              href="/checkout"
              className={`w-full py-4 text-sm font-black uppercase tracking-widest rounded-2xl border-2 text-center transition-all duration-200
                ${inStock
                  ? 'border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-black'
                  : 'border-gray-200 dark:border-neutral-700 text-gray-300 dark:text-neutral-600 cursor-not-allowed pointer-events-none'
                }`}
            >
              Buy Now
            </Link>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100">
                More in {product.category}
              </h2>
              <Link
                href="/"
                className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
