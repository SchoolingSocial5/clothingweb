"use client";
import { useEffect, useState } from "react";
import { useExpenseStore, Expense } from "@/store/useExpenseStore";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

const CATEGORIES = ["Marketing", "Inventory", "Rent", "Utilities", "Salary", "Shipping", "Other"];

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

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

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
      setIsModalOpen(false);
      setFormData({
        title: "",
        amount: "",
        category: "Other",
        date: new Date().toISOString().split('T')[0],
        description: "",
        receipt: null
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <div className="p-8">
      <AdminPageHeader 
        title="Expenses" 
        description="Track your store's spending and manage business costs."
        stats={{ label: "Total Spent", value: `₦${totalExpenses.toLocaleString()}` }}
      >
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-900 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Record Expense
        </button>
      </AdminPageHeader>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg">Expense History</h3>
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
             <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Expense Title</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Amount</th>
                  <th className="px-6 py-4 font-semibold text-center">Receipt</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-gray-900">{expense.title}</p>
                      <p className="text-[10px] text-gray-400 font-mono">#{expense.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-sm text-gray-900">₦{parseFloat(expense.amount).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {expense.receipt_path ? (
                        <a href={`http://localhost:8000/storage/${expense.receipt_path}`} target="_blank" className="text-black hover:scale-110 transition-transform inline-block">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </a>
                      ) : <span className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">No Receipt</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button onClick={() => deleteExpense(expense.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Record New Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Expense Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Office Supplies" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Amount (₦)</label>
                  <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Date</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Receipt Image</label>
                  <input type="file" onChange={e => setFormData({...formData, receipt: e.target.files?.[0] || null})}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-black hover:file:bg-gray-200" />
                </div>
                <div className="col-span-2 flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Description (Optional)</label>
                  <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none" />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 uppercase tracking-widest">Cancel</button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-900 disabled:opacity-50 uppercase tracking-widest">
                  {isSubmitting ? "Saving..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
