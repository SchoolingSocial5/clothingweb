"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useProductStore } from "@/store/useProductStore";
import { useWishlistStore } from "@/store/useWishlistStore";

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { products, fetchProducts } = useProductStore();
  const { ids, hydrate, hydrated } = useWishlistStore();

  useEffect(() => {
    if (!loading && !user) router.push("/sign-in");
  }, [user, loading, router]);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  const wishlistProducts = products.filter((p) => ids.includes(p.id));

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <Header />

      <div className="max-w-[1400px] mx-auto px-[10px] md:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Wishlist</h1>
            <p className="text-sm text-gray-400">{wishlistProducts.length} item{wishlistProducts.length !== 1 ? "s" : ""} saved</p>
          </div>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 py-24 text-center">
            <svg className="mx-auto mb-4 text-gray-200" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-4">Your wishlist is empty</p>
            <Link href="/" className="inline-block px-6 py-3 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {wishlistProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
