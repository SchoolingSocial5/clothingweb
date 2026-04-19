"use client";
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCustomerStore } from '@/store/useCustomerStore';
import Link from 'next/link';

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const { 
    selectedCustomer, 
    userOrders, 
    userOrdersPagination, 
    loading, 
    fetchCustomerDetails, 
    fetchUserOrders 
  } = useCustomerStore();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (token && id) {
      fetchCustomerDetails(id as string);
    }
  }, [token, id, fetchCustomerDetails]);

  useEffect(() => {
    if (token && id) {
      fetchUserOrders(id as string, currentPage, { startDate, endDate });
    }
  }, [token, id, currentPage, fetchUserOrders]);

  const handleFilter = () => {
    setCurrentPage(1);
    fetchUserOrders(id as string, 1, { startDate, endDate });
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    fetchUserOrders(id as string, 1);
  };

  if (loading && !selectedCustomer) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-pulse">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading customer details...</p>
      </div>
    );
  }

  if (!selectedCustomer && !loading) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-20 text-center text-gray-900 dark:text-white">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
        </div>
        <h2 className="text-2xl font-black uppercase mb-4">Customer Not Found</h2>
        <p className="text-gray-500 mb-8 font-medium">The customer record you are looking for does not exist or has been removed.</p>
        <Link href="/admin/customers" className="px-8 py-3 bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all inline-block">
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="px-[10px] md:px-8 py-8 w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header with Back Link */}
      <div className="flex items-center justify-between">
        <Link href="/admin/customers" className="flex items-center gap-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors group px-4 py-2 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm text-xs font-black uppercase tracking-widest">
           <svg className="group-hover:-translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
           Back
        </Link>
        <div className="flex gap-2">
           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
             selectedCustomer?.status === 'admin' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
           }`}>
             {selectedCustomer?.status} Account
           </span>
        </div>
      </div>

      {/* Profile Card Widget */}
      <div className="bg-white dark:bg-neutral-900 rounded-[32px] border border-gray-100 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="px-8 py-10 md:px-12 flex flex-col md:flex-row gap-10 items-center md:items-start text-gray-900 dark:text-gray-100">
          <div className="w-32 h-32 rounded-[40px] bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-5xl font-black flex-shrink-0 shadow-2xl shadow-black/10">
            {selectedCustomer?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          
          <div className="flex-1 space-y-6 text-center md:text-left w-full">
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">{selectedCustomer?.name}</h1>
              <p className="text-gray-400 dark:text-gray-500 font-bold text-sm tracking-tight">{selectedCustomer?.email}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-gray-50 dark:border-neutral-800">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number</p>
                <p className="text-sm font-bold">{selectedCustomer?.phone || 'Not Provided'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Delivery Address</p>
                <p className="text-sm font-bold leading-tight">{selectedCustomer?.address || 'No Address Saved'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Date Registered</p>
                <p className="text-sm font-bold">
                  {selectedCustomer?.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">Transaction History</h2>
            <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 rounded-xl text-xs font-black text-gray-400 uppercase tracking-widest">
              {userOrdersPagination.total} Total
            </span>
          </div>

          {/* Date Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-gray-900 dark:text-gray-100"
              />
              <span className="text-gray-400 font-bold text-xs">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleFilter}
                className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all"
              >
                Filter
              </button>
              {(startDate || endDate) && (
                <button 
                  onClick={handleReset}
                  className="bg-gray-100 dark:bg-neutral-800 text-gray-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-[32px] border border-gray-100 dark:border-neutral-800 overflow-hidden shadow-sm relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-neutral-800/50 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100 dark:border-neutral-800">
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Payment</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                {userOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs italic">
                      {startDate || endDate ? 'No transactions found for this date range' : 'No transactions recorded for this customer'}
                    </td>
                  </tr>
                ) : (
                  userOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors group">
                      <td className="px-8 py-5">
                        <span className="text-xs font-black text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">#{order.id.toString().slice(-6).toUpperCase()}</span>
                      </td>
                      <td className="px-8 py-5 font-bold text-xs text-gray-600 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-black text-sm text-gray-900 dark:text-gray-100">₦{Number(order.total_amount).toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.payment_status === 'paid' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.status === 'delivered' ? 'bg-green-50 text-green-600 border border-green-100' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Link href={`/admin/orders/${order.id}`} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-80 transition-all">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {userOrdersPagination.last_page > 1 && (
            <div className="px-8 py-6 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Page {userOrdersPagination.page} of {userOrdersPagination.last_page}
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-gray-50 dark:bg-neutral-800 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all group"
                >
                  <svg className="text-gray-900 dark:text-white" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: userOrdersPagination.last_page }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${
                        currentPage === p 
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10' 
                          : 'bg-white dark:bg-neutral-900 text-gray-400 hover:text-black dark:hover:text-white border border-gray-100 dark:border-neutral-800 shadow-sm'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(userOrdersPagination.last_page, prev + 1))}
                  disabled={currentPage === userOrdersPagination.last_page}
                  className="p-2 bg-gray-50 dark:bg-neutral-800 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all group"
                >
                  <svg className="text-gray-900 dark:text-white" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
