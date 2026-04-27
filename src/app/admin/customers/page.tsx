"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCustomerStore } from '@/store/useCustomerStore';
import Link from 'next/link';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import Pagination from '@/components/common/Pagination';
import TableLoader from '@/components/admin/TableLoader';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import AssignPositionModal from '@/components/admin/AssignPositionModal';
import Toast from '@/components/admin/Toast';

export default function CustomersPage() {
  const { token, user } = useAuth();
  const { 
    customers, pagination, loading, fetchCustomers, deleteCustomer,
    selectedCustomerIds, toggleCustomerSelection, toggleAllCustomers, clearCustomerSelection, bulkDeleteCustomers
  } = useCustomerStore();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingStaffUser, setPendingStaffUser] = useState<{id: string, name: string, email: string} | null>(null);
  const [search, setSearch] = useState('');
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    if (token) fetchCustomers();
  }, [token, fetchCustomers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchCustomers(1, value);
  };

  return (
    <div className="w-full p-[10px] md:px-8 md:py-12">
      <AdminPageHeader 
        title="Customers" 
        description="Manage your registered users and promote them to staff members."
        stats={{ label: "Total", value: pagination.total }}
      />

      <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
          <div className="relative max-w-xs">
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="w-full pl-9 pr-9 py-2.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100 dark:placeholder-gray-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />}
          </div>
        </div>

        {/* Bulk Actions Header */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800 gap-3">
          <label className="flex items-center gap-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={customers.length > 0 && customers.every(c => selectedCustomerIds.includes(c.id))}
              onChange={() => toggleAllCustomers()}
              className="w-5 h-5 rounded-lg border-gray-200 text-black focus:ring-black cursor-pointer transition-all"
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">Select All Customers</span>
          </label>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-neutral-800/50 border-b border-gray-100 dark:border-neutral-800">
                <th className="px-2 py-4 w-8"></th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Email</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 text-center">Orders</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 text-right">Total Spent</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Joined</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="px-2 py-5" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedCustomerIds.includes(customer.id)}
                      onChange={() => toggleCustomerSelection(customer.id)}
                      className="w-5 h-5 rounded-lg border-gray-200 text-black focus:ring-black cursor-pointer transition-all"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <Link href={`/admin/customers/${customer.id}`} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-gray-100 group-hover:underline">{customer.name}</span>
                        {customer.phone && <span className="text-[10px] text-gray-400 font-bold tracking-tight">{customer.phone}</span>}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-5 text-gray-500 font-medium">{customer.email}</td>
                  <td className="px-6 py-5 text-center font-bold text-gray-700 dark:text-gray-400">
                    {customer.orders_count || 0}
                  </td>
                  <td className="px-6 py-5 text-right font-black text-gray-900 dark:text-gray-100">
                    ₦{Number(customer.orders_sum_total_amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-gray-400 text-sm">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        title="Promote to Staff"
                        onClick={() => setPendingStaffUser({ id: customer.id, name: customer.name, email: customer.email })}
                        className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-2 cursor-pointer"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <line x1="19" y1="8" x2="19" y2="14"></line>
                          <line x1="22" y1="11" x2="16" y2="11"></line>
                        </svg>
                      </button>
                      <button
                        title="Delete User"
                        onClick={() => setPendingDeleteId(customer.id)}
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
              {loading && <TableLoader colSpan={7} />}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && !loading && (
            <div className="py-20 text-center bg-gray-50/30 dark:bg-neutral-800/30">
              <p className="text-gray-400 font-medium italic">No customers found.</p>
            </div>
          )}
          {pagination.last_page > 1 && (
            <div className="border-t border-gray-100 dark:border-neutral-800 bg-gray-50/30 dark:bg-neutral-800/30">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.last_page}
                onPageChange={(page) => fetchCustomers(page, search)}
              />
            </div>
          )}
        </div>

      {selectedCustomerIds.length > 0 && user?.position === 'Director' && (
        <div className="mt-8 bg-black text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 ring-1 ring-white/10 flex-wrap gap-4">
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-lg">
              {selectedCustomerIds.length} Selected
            </span>
            <div className="hidden sm:block h-6 w-px bg-white/10"></div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Actions</span>
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                disabled={bulkUpdating}
                className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                Delete
              </button>
            </div>
          </div>
          <button onClick={clearCustomerSelection} className="text-white/40 hover:text-white transition-all p-2 flex items-center gap-2 group active:scale-90">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Clear</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => { if (pendingDeleteId) deleteCustomer(pendingDeleteId); }}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
      />

      <DeleteConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={async () => {
          setBulkUpdating(true);
          try {
            await bulkDeleteCustomers(selectedCustomerIds);
            setShowBulkDeleteConfirm(false);
            showToast(`Successfully deleted ${selectedCustomerIds.length} customers`);
          } catch {
            showToast("Failed to delete customers", "error");
          } finally {
            setBulkUpdating(false);
          }
        }}
        title="Delete Customers"
        message={`Are you sure you want to delete ${selectedCustomerIds.length} selected customer${selectedCustomerIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
      />

      <AssignPositionModal 
        isOpen={pendingStaffUser !== null}
        onClose={() => setPendingStaffUser(null)}
        user={pendingStaffUser}
        showToast={showToast}
        onSuccess={() => {
          fetchCustomers(pagination.page, search);
          showToast('Customer promoted to staff successfully!');
        }}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>
  );
}
