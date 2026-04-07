"use client";
import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { useSettings } from "@/context/SettingsContext";
import { formatPrice } from "@/utils/format";
import { apiClient } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

interface RecentCustomer {
  id: number;
  name: string;
  email: string;
  role?: string;
  status: string;
  created_at: string;
}

interface DashboardStats {
  total_customers: number;
  total_revenue: number;
  total_orders: number;
  total_sales: number;
  recent_customers: RecentCustomer[];
}

export default function AdminDashboard() {
  const { settings } = useSettings();
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const currency = settings?.currency_symbol || "₦";

  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      try {
        const statsData = await apiClient<DashboardStats>("/admin/analytics");
        setStats(statsData);
      } catch (error) {
        console.error("Dashboard data load error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const statItems = [
    { label: "Total Revenue", value: formatPrice(stats?.total_revenue || 0, currency), trend: "+12.5%", positive: true },
    { label: "Active Customers", value: (stats?.total_customers || 0).toLocaleString(), trend: "+5.2%", positive: true },
    { label: "Total Orders", value: (stats?.total_orders || 0).toLocaleString(), trend: "+8.1%", positive: true },
    { label: "Items Sold", value: (stats?.total_sales || 0).toLocaleString(), trend: "+10.4%", positive: true },
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
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg">Recent Customers</h3>
          <button className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-green-50 text-green-700 border-green-200">
                      Customer
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-medium">
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
