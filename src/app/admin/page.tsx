"use client";
import { useEffect, useState } from "react";
import Link from 'next/link';
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

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  useEffect(() => {
    if (token) {
      fetchDashboardStats();
    }
  }, [token, fetchDashboardStats]);

  const handleApplyFilter = () => {
    if (fromDate && toDate) {
      fetchDashboardStats(fromDate, toDate);
      setIsFilterApplied(true);
    }
  };

  const handleAllClick = () => {
    setFromDate("");
    setToDate("");
    fetchDashboardStats();
    setIsFilterApplied(false);
  };

  const today = new Date().toISOString().split('T')[0];

  const statItems = isFilterApplied 
    ? [
        { 
          label: "New Customers", 
          value: (stats?.total_customers || 0).toLocaleString(), 
          trend: "Filtered Range Summary", 
          positive: true 
        },
        { 
          label: "Total Orders", 
          value: (stats?.total_orders || 0).toLocaleString(), 
          trend: "Filtered Range Summary", 
          positive: true 
        },
        { 
          label: "Items Sold", 
          value: (stats?.total_sales || 0).toLocaleString(), 
          trend: "Filtered Range Summary", 
          positive: true 
        },
      ]
    : [
        { 
          label: "Today's Sales", 
          value: formatPrice(stats?.today_sales || 0, currency), 
          trend: "Today's Revenue", 
          positive: true 
        },
        { 
          label: "Today's Customers", 
          value: (stats?.today_customers || 0).toLocaleString(), 
          trend: "New Customers Today", 
          positive: true 
        },
        { 
          label: "Today's Orders", 
          value: (stats?.today_orders || 0).toLocaleString(), 
          trend: "Orders Placed Today", 
          positive: true 
        },
        { 
          label: "Items Sold Today", 
          value: (stats?.today_items_sold || 0).toLocaleString(), 
          trend: "Product Quantities Sold", 
          positive: true 
        },
      ];

  const recentUsers = stats?.recent_customers || [];
  const recentOrders = stats?.recent_orders || [];

  return (
    <div className="p-[10px] md:p-8">
      <AdminPageHeader 
        title="Dashboard" 
        description="Welcome back! Here's what's happening with your store today."
      />

      {/* Date Filter Bar */}
      <div className="mb-6 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm px-5 py-4 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">From Date</label>
            <input
              type="date"
              value={fromDate}
              max={toDate || today}
              onChange={e => setFromDate(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">To Date</label>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              max={today}
              onChange={e => setToDate(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100"
            />
          </div>
          <button
            onClick={handleApplyFilter}
            disabled={!fromDate || !toDate}
            className="px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-85 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Apply Filter
          </button>
          <button
            onClick={handleAllClick}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all cursor-pointer
              ${!isFilterApplied 
                ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' 
                : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800 dark:border-neutral-700'
              }`}
          >
            All
          </button>
        </div>
        
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 self-center">
          {isFilterApplied ? `Filtered Summary: ${fromDate} to ${toDate}` : "All-Time Summary & Today's Insights"}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isFilterApplied ? 'xl:grid-cols-3' : 'xl:grid-cols-4'} gap-6 mb-8`}>
        {loading ? (
          Array(isFilterApplied ? 3 : 4).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm animate-pulse">
              <div className="h-4 w-24 bg-gray-100 dark:bg-neutral-800 rounded mb-4"></div>
              <div className="h-8 w-32 bg-gray-100 dark:bg-neutral-800 rounded"></div>
            </div>
          ))
        ) : (
          statItems.map((stat, i) => (
            <AdminStatCard key={i} {...stat} />
          ))
        )}
      </div>

      {/* Tables Row: side-by-side grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Transactions */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center flex-shrink-0">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Latest Transactions</h3>
            <Link href="/admin/transactions" className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">View All</Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-neutral-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Receipt No</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold text-right">Amount</th>
                  <th className="px-6 py-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                {recentOrders.map((order) => (
                  <tr key={order._id || order.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors text-sm">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-gray-100">
                      {order.receiptNumber || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                      {order.customerName || 'Guest'}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-gray-100">
                      {currency}{Number(order.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider
                        ${order.paymentStatus === 'paid' ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400' : 'bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400'}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Customers List */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center flex-shrink-0">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Recent Customers</h3>
            <Link href="/admin/customers" className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">View All</Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[400px]">
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
    </div>
  );
}
