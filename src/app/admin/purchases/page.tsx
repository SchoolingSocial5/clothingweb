"use client";
import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { usePurchaseStore } from "@/store/usePurchaseStore";
import { useSettings } from "@/context/SettingsContext";
import { formatPrice } from "@/utils/format";

export default function PurchasesPage() {
  const { purchases, loading, fetchPurchases } = usePurchaseStore();
  const { settings } = useSettings();
  const currency = settings?.currency_symbol || "₦";

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  if (loading && purchases.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="p-[10px] md:p-8 w-full max-w-7xl mx-auto">
      <AdminPageHeader 
        title="Purchase History" 
        description="View all product acquisitions and stock intake records."
        stats={{ label: "Total Purchases", value: purchases.length }}
      />

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Product</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4 text-center">Quantity</th>
                <th className="px-8 py-4 text-right">Cost Price</th>
                <th className="px-8 py-4 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-300 font-bold uppercase tracking-widest italic text-sm">
                    No purchase history found
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-gray-900 leading-tight">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">
                        {new Date(purchase.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-gray-900 group-hover:text-black transition-colors">{purchase.product_name}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {purchase.product_category}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-full text-xs">
                        +{purchase.quantity}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right font-bold text-gray-500 text-xs">
                      {formatPrice(purchase.cost_price, currency)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <p className="font-black text-gray-900 text-sm">
                        {formatPrice(purchase.total_amount, currency)}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
