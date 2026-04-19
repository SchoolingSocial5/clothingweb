"use client";
import { useEffect } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { useSettings } from "@/context/SettingsContext";
import { formatPrice } from "@/utils/format";
import { useAuth } from "@/context/AuthContext";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";

interface RecentCustomer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  orders_sum_total_amount?: number;
  created_at: string;
}

export default function AdminDashboard() {
  const { settings } = useSettings();
  const { token } = useAuth();
  const { stats, loading, fetchDashboardStats } = useAnalyticsStore();
  const currency = settings?.currency_symbol || "₦";

  useEffect(() => {
    if (token) {
      fetchDashboardStats();
    }
  }, [token, fetchDashboardStats]);

  const statItems = [
    { 
      label: "Total Revenue", 
      value: formatPrice(stats?.total_revenue || 0, currency), 
      trend: stats?.revenue_trend || "0%", 
      positive: stats?.revenue_positive ?? true 
    },
    { 
      label: "Active Customers", 
      value: (stats?.total_customers || 0).toLocaleString(), 
      trend: stats?.customers_trend || "0%", 
      positive: stats?.customers_positive ?? true 
    },
    { 
      label: "Total Orders", 
      value: (stats?.total_orders || 0).toLocaleString(), 
      trend: stats?.orders_trend || "0%", 
      positive: stats?.orders_positive ?? true 
    },
    { 
      label: "Items Sold", 
      value: (stats?.total_sales || 0).toLocaleString(), 
      trend: stats?.sales_trend || "0%", 
      positive: stats?.sales_positive ?? true 
    },
  ];

  const recentUsers = stats?.recent_customers || [];

  return (
    <div className="p-[10px] md:p-8">
      <AdminPageHeader 
        title="Dashboard" 
        description="Welcome back! Here's what's happening with your store today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm animate-pulse">
              <div className="h-4 w-24 bg-gray-100 rounded mb-4"></div>
              <div className="h-8 w-32 bg-gray-100 rounded"></div>
            </div>
          ))
        ) : (
          statItems.map((stat, i) => (
            <AdminStatCard key={i} {...stat} />
          ))
        )}
      </div>

      {/* Recent Customers List */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Recent Customers</h3>
          <button className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-neutral-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold text-right">Total Spent</th>
                <th className="px-6 py-4 font-semibold text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
              {recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors text-sm">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">
                    {user.phone || '—'}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-gray-100">
                    {currency}{Number(user.orders_sum_total_amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400 font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
