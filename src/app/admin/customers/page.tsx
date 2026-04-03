"use client";
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCustomerStore } from '@/store/useCustomerStore';
import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function CustomersPage() {
  const { token } = useAuth();
  const { customers, loading, fetchCustomers, deleteCustomer } = useCustomerStore();

  useEffect(() => {
    if (token) {
      fetchCustomers();
    }
  }, [token, fetchCustomers]);

  return (
    <div className="w-full p-[10px] md:px-8 md:py-12">
      <AdminPageHeader 
        title="Customers" 
        description="Manage your registered users and guests."
        stats={{ label: "Total", value: customers.length }}
      />

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Customers...</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Email</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Phone</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Orders</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Total Spent</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Joined</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <Link href={`/admin/customers/${customer.id}`} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900 group-hover:underline">{customer.name}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-5 text-gray-500 font-medium">{customer.email}</td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-gray-700">
                      {customer.phone || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-gray-700">
                    {customer.orders_count || 0}
                  </td>
                  <td className="px-6 py-5 text-right font-black text-gray-900">
                    ₦{Number(customer.orders_sum_total_amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-gray-400 text-sm">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="text-gray-400 hover:text-black transition-colors p-2 cursor-pointer"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this customer?')) {
                            deleteCustomer(customer.id);
                          }
                        }}
                        className="text-gray-300 hover:text-red-500 transition-colors p-2 cursor-pointer"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && (
            <div className="py-20 text-center bg-gray-50/30">
              <p className="text-gray-400 font-medium italic">No customers found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
