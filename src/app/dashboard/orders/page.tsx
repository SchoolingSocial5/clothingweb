"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { formatPrice } from "@/utils/format";
import { useOrderStore } from "@/store/useOrderStore";

const statusColors: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-600",
  confirmed: "bg-blue-50 text-blue-600",
  shipped:   "bg-purple-50 text-purple-600",
  delivered: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-500",
};

const paymentColors: Record<string, string> = {
  unpaid: "bg-red-50 text-red-500",
  paid:   "bg-green-50 text-green-600",
};

export default function CustomerOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { settings } = useSettings();
  const { orders, loading: ordersLoading, fetchCustomerOrders } = useOrderStore();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/sign-in");
  }, [user, loading, router]);

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

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <Header />

      <div className="max-w-[1400px] mx-auto px-[10px] md:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">My Orders</h1>
            <p className="text-sm text-gray-400">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 py-24 text-center">
            <svg className="mx-auto mb-4 text-gray-200" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-4">No orders yet</p>
            <Link href="/" className="inline-block px-6 py-3 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
                {/* Order row */}
                <button
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors cursor-pointer text-left"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-black text-gray-900 dark:text-gray-100 text-sm">
                        {order.receipt_number || `Order #${order.id}`}
                      </p>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusColors[order.status] || "bg-gray-100 text-gray-500"}`}>
                        {order.status}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${paymentColors[order.payment_status] || "bg-gray-100 text-gray-500"}`}>
                        {order.payment_status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-black text-gray-900 dark:text-gray-100 text-sm">
                      {formatPrice(order.total_amount, settings?.currency_symbol)}
                    </span>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      className={`text-gray-400 transition-transform duration-200 ${expandedId === order.id ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </button>

                {/* Expanded items */}
                {expandedId === order.id && (
                  <div className="border-t border-gray-50 dark:border-neutral-800 px-6 py-4 space-y-3 bg-gray-50/30 dark:bg-neutral-800/20">
                    {order.delivery_address && (
                      <p className="text-xs text-gray-500 font-medium">
                        <span className="font-black uppercase tracking-widest text-[10px] text-gray-400 mr-2">Delivery:</span>
                        {order.delivery_address}
                      </p>
                    )}
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[60%]">
                            {item.product_name} <span className="text-gray-400">×{item.quantity}</span>
                          </span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            {formatPrice(Number(item.price) * item.quantity, settings?.currency_symbol)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
