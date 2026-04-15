"use client";
import { useEffect, useState } from "react";
import { useExpenseStore } from "@/store/useExpenseStore";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import Toast from "@/components/admin/Toast";
import TableLoader from "@/components/admin/TableLoader";
import { getImageUrl } from "@/utils/image";

export default function ExpensesPage() {
  const { expenses, loading, fetchExpenses, createExpense, deleteExpense } = useExpenseStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Other",
    date: new Date().toISOString().split('T')[0],
    description: "",
    receipt: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning"; visible: boolean }>({
    message: "", type: "success", visible: false
  });

  const today = new Date().toISOString().split('T')[0];
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleFilter = () => fetchExpenses(from, to);

  const handleClear = () => {
    setFrom('');
    setTo('');
    fetchExpenses('', '');
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteExpense(deleteId);
      showToast("Expense deleted successfully");
    } catch {
      showToast("Failed to delete expense", "error");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("amount", formData.amount);
      data.append("category", formData.category);
      data.append("date", formData.date);
      data.append("description", formData.description);
      if (formData.receipt) data.append("receipt", formData.receipt);
      await createExpense(data);
      showToast("Expense recorded successfully");
      setIsModalOpen(false);
      setFormData({ title: "", amount: "", category: "Other", date: today, description: "", receipt: null });
    } catch {
      showToast("Error saving expense", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);

  return (
    <div className="p-[10px] md:p-8">
      <AdminPageHeader
        title="Expenses"
        description="Track your store's spending and manage business costs."
        stats={{ label: "Total Spent", value: `₦${totalExpenses.toLocaleString()}` }}
      >
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-4 py-2 md:px-6 md:py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-900 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Record Expense
        </button>
      </AdminPageHeader>

      {/* Date Range Filter */}
      <div className="mb-4 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm px-5 py-4 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">From</label>
          <input
            type="date" value={from} max={to || today}
            onChange={e => setFrom(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">To</label>
          <input
            type="date" value={to} min={from} max={today}
            onChange={e => setTo(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100"
          />
        </div>
        <button
          onClick={handleFilter}
          disabled={!from && !to}
          className="px-5 py-2.5 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >Apply</button>
        {(from || to) && (
          <button onClick={handleClear} className="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-colors">
            Clear
          </button>
        )}
        {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black ml-2 self-center" />}
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center">
          <h3 className="font-bold text-lg">Expense History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-neutral-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Expense Title</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold">Staff</th>
                <th className="px-6 py-4 font-semibold text-center">Receipt</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
              {expenses.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-300 font-bold uppercase tracking-widest italic text-sm">
                    No expenses found
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{expense.title}</p>
                      <p className="text-[10px] text-gray-400 font-mono">#{expense.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {expense.category || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-sm text-gray-900 dark:text-gray-100">₦{parseFloat(expense.amount).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-900 dark:text-gray-100 leading-tight">{expense.recorded_by || 'System'}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Recorder</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {expense.receipt_url ? (
                        <a
                          href={getImageUrl(expense.receipt_url) || "#"}
                          target="_blank"
                          className="text-black dark:text-white hover:scale-110 transition-transform inline-block"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        </a>
                      ) : (
                        <span className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">No Receipt</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button onClick={() => handleDelete(expense.id)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7c-1 0-2-1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {loading && <TableLoader colSpan={7} />}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center text-sm font-bold">
              <h3 className="text-xl font-bold">Record New Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black p-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Expense Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Office Supplies" className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Amount (₦)</label>
                  <input required type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Date</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Receipt Image</label>
                  <input type="file" onChange={e => setFormData({ ...formData, receipt: e.target.files?.[0] || null })}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-black hover:file:bg-gray-200" />
                </div>
                <div className="col-span-2 flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Description (Optional)</label>
                  <textarea rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100 resize-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 uppercase tracking-widest cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-900 disabled:opacity-50 uppercase tracking-widest cursor-pointer">
                  {isSubmitting ? "Saving..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message="Are you sure you want to remove this expense record? This action cannot be undone."
      />

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
