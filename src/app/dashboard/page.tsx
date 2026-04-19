"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useProductStore } from "@/store/useProductStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useSettings } from "@/context/SettingsContext";
import { formatPrice } from "@/utils/format";
import { useOrderStore } from "@/store/useOrderStore";
const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-600",
  confirmed: "bg-blue-50 text-blue-600",
  shipped: "bg-purple-50 text-purple-600",
  delivered: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-500",
};

export default function UserDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { products, fetchProducts } = useProductStore();
  const { orders, loading: ordersLoading, fetchCustomerOrders } = useOrderStore();
  const { ids: wishlistIds, hydrate, hydrated } = useWishlistStore();
  const { settings } = useSettings();

  useEffect(() => {
    if (!loading && !user) router.push("/sign-in");
  }, [user, loading, router]);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (user) {
      fetchCustomerOrders();
    }
  }, [user, fetchCustomerOrders]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  const recentOrders = orders.slice(0, 5);
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));
  const recentProducts = products.slice(0, 8);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <Header />

      <div className="max-w-[1400px] mx-auto px-[10px] md:px-8 py-10 space-y-10">

        {/* Greeting */}
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
            Hi, <span className="text-gray-400">{user.name.split(" ")[0]}</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Here's a summary of your account.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Orders", value: orders.length, href: "/dashboard/orders", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg> },
            { label: "Wishlist", value: wishlistIds.length, href: "/dashboard/wishlist", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg> },
            { label: "Pending", value: orders.filter(o => o.status === "pending").length, href: "/dashboard/orders", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
            { label: "Delivered", value: orders.filter(o => o.status === "delivered").length, href: "/dashboard/orders", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> },
          ].map(({ label, value, href, icon }) => (
            <Link key={label} href={href} className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-gray-50 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 flex-shrink-0">{icon}</div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black uppercase tracking-tight">My Orders</h2>
            <Link href="/dashboard/orders" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              View All →
            </Link>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
            {ordersLoading ? (
              <div className="py-16 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-16 text-center">
                <svg className="mx-auto mb-3 text-gray-200" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No orders yet</p>
                <Link href="/" className="mt-3 inline-block text-xs font-black uppercase tracking-widest text-black dark:text-white underline">Start Shopping</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-neutral-800">
                {recentOrders.map((order) => (
                  <div key={order.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <div className="min-w-0">
                      <p className="font-black text-gray-900 dark:text-gray-100 text-sm">
                        {order.receipt_number || `#${order.id}`}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusColors[order.status] || "bg-gray-100 text-gray-500"}`}>
                        {order.status}
                      </span>
                      <span className="font-black text-gray-900 dark:text-gray-100 text-sm">
                        {formatPrice(order.total_amount, settings?.currency_symbol)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Wishlist preview */}
        {wishlistProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black uppercase tracking-tight">Wishlist</h2>
              <Link href="/dashboard/wishlist" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {wishlistProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black uppercase tracking-tight">New Arrivals</h2>
            <Link href="/" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              Shop All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {recentProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
