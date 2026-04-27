"use client";
import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { usePurchaseStore } from "@/store/usePurchaseStore";
import { useSettings } from "@/context/SettingsContext";
import { formatPrice } from "@/utils/format";
import Pagination from "@/components/common/Pagination";
import TableLoader from "@/components/admin/TableLoader";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/utils/image";

export default function PurchasesPage() {
  const { user } = useAuth();
  const { 
    purchases, pagination, loading, fetchPurchases,
    selectedPurchaseIds, togglePurchaseSelection, toggleAllSelection, 
    clearSelection, bulkDeletePurchases, deletePurchase
  } = usePurchaseStore();
  const { settings } = useSettings();
  const currency = settings?.currency_symbol || "₦";

  const today = new Date().toISOString().split('T')[0];
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  useEffect(() => {
    fetchPurchases(1, '', '');
  }, [fetchPurchases]);

  const handleFilter = () => {
    fetchPurchases(1, from, to);
  };

  const handleClear = () => {
    setFrom('');
    setTo('');
    fetchPurchases(1, '', '');
  };

  return (
    <div className="p-[10px] md:p-8 w-full">
      <AdminPageHeader
        title="Purchase History"
        description="View all product acquisitions and stock intake records."
        stats={{ label: "Total Purchases", value: pagination?.total || 0 }}
      />

      {/* Date Range Filter */}
      <div className="mb-4 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm px-5 py-4 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">From</label>
          <input
            type="date"
            value={from}
            max={to || today}
            onChange={e => setFrom(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">To</label>
          <input
            type="date"
            value={to}
            min={from}
            max={today}
            onChange={e => setTo(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100"
          />
        </div>
        <button
          onClick={handleFilter}
          disabled={!from && !to}
          className="px-5 py-2.5 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Apply
        </button>
        {(from || to) && (
          <button
            onClick={handleClear}
            className="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        )}
        {loading && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black ml-2 self-center" />
        )}
      </div>

      <div className="mb-4 flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
        <label className="flex items-center gap-4 cursor-pointer group">
          <input
            type="checkbox"
            checked={purchases.length > 0 && purchases.every(p => selectedPurchaseIds.includes(p.id))}
            onChange={() => toggleAllSelection()}
            className="w-5 h-5 rounded-lg border-gray-200 text-black focus:ring-black cursor-pointer transition-all"
          />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">Select All Records</span>
        </label>
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Showing {purchases.length} of {pagination.total} Purchases
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-neutral-800/50 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4 w-12">S/N</th>
                <th className="px-2 py-4 w-8"></th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Quantity</th>
                <th className="px-6 py-4 text-right">Cost Price</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
                <th className="px-6 py-4 text-right">Date</th>
                {user?.position === 'Director' && <th className="px-6 py-4 w-10"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
              {purchases.length === 0 && !loading && (
                <tr>
                  <td colSpan={user?.position === 'Director' ? 10 : 9} className="px-8 py-20 text-center text-gray-300 font-bold uppercase tracking-widest italic text-sm">
                    No purchase history found
                  </td>
                </tr>
              )}
              {purchases.map((purchase, index) => {
                  const imgSrc = getImageUrl(purchase.product_image);
                  return (
                    <tr key={purchase.id} className="hover:bg-gray-50/30 dark:hover:bg-neutral-800/30 transition-colors group">
                      <td className="px-6 py-5 font-black text-gray-400 text-[11px]">
                        {((pagination?.page || 1) - 1) * (pagination?.per_page || 10) + index + 1}
                      </td>
                      <td className="px-2 py-5" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedPurchaseIds.includes(purchase.id)}
                          onChange={() => togglePurchaseSelection(purchase.id)}
                          className="w-5 h-5 rounded-lg border-gray-200 text-black focus:ring-black cursor-pointer transition-all"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-100">
                            {imgSrc ? (
                              <img
                                src={imgSrc || undefined}
                                alt={purchase.product_name}
                                className="w-full h-full object-cover"
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <svg className="text-gray-300" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                              </svg>
                            )}
                          </div>
                          <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-black transition-colors">{purchase.product_name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {purchase.product_category}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="font-black text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-neutral-800 px-3 py-1 rounded-full text-xs">
                          +{purchase.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-gray-500 text-xs">
                        {formatPrice(purchase.cost_price, currency)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <p className="font-black text-gray-900 dark:text-gray-100 text-sm">
                          {formatPrice(purchase.total_amount, currency)}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight">
                          {new Date(purchase.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">
                          {new Date(purchase.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      {user?.position === 'Director' && (
                        <td className="px-6 py-5 text-right" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this purchase?')) {
                                deletePurchase(purchase.id);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                            title="Delete Purchase"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
              })}
              {loading && <TableLoader colSpan={user?.position === 'Director' ? 10 : 9} />}
            </tbody>
          </table>
        </div>

        {pagination?.last_page > 1 && (
          <div className="bg-gray-50 dark:bg-neutral-800/50 border-t border-gray-100 dark:border-neutral-800">
            <Pagination
              currentPage={pagination?.page || 1}
              totalPages={pagination?.last_page || 1}
              onPageChange={(page) => fetchPurchases(page, from, to)}
            />
          </div>
        )}
      </div>

      {selectedPurchaseIds.length > 0 && user?.position === 'Director' && (
        <div className="mt-8 bg-black text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 ring-1 ring-white/10">
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-lg">
              {selectedPurchaseIds.length} Selected
            </span>
            <div className="h-6 w-px bg-white/10"></div>
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
          <button onClick={clearSelection} className="text-white/40 hover:text-white transition-all p-2 flex items-center gap-2 group active:scale-90">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Clear</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={async () => {
          setBulkUpdating(true);
          try {
            await bulkDeletePurchases(selectedPurchaseIds);
            setShowBulkDeleteConfirm(false);
          } finally {
            setBulkUpdating(false);
          }
        }}
        title="Delete Purchases"
        message={`Are you sure you want to delete ${selectedPurchaseIds.length} selected purchase${selectedPurchaseIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
      />
    </div>
  );
}
