"use client";
import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TableLoader from "@/components/admin/TableLoader";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import { useFaqStore } from "@/store/useFaqStore";

export default function FaqPage() {
  const { faqs, loading, fetchFaqs, createFaq, updateFaq, deleteFaq, bulkDeleteFaqs } = useFaqStore();

  const [selected, setSelected] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editFaq, setEditFaq] = useState<{ id: number; question: string; answer: string } | null>(null);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [saving, setSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const allSelected = faqs.length > 0 && selected.length === faqs.length;

  const toggleAll = () => {
    setSelected(allSelected ? [] : faqs.map((f) => f.id));
  };

  const toggleOne = (id: number) => {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };

  const openCreate = () => {
    setEditFaq(null);
    setForm({ question: "", answer: "" });
    setShowModal(true);
  };

  const openEdit = (faq: { id: number; question: string; answer: string }) => {
    setEditFaq(faq);
    setForm({ question: faq.question, answer: faq.answer });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      if (editFaq) {
        await updateFaq(editFaq.id, form);
      } else {
        await createFaq(form);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-[10px] md:p-8 w-full">
      <AdminPageHeader
        title="FAQ"
        description="Manage frequently asked questions shown to customers."
        stats={{ label: "Total FAQs", value: faqs.length }}
      />

      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-4">
          {selected.length > 0 ? (
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Delete {selected.length} Selected
            </button>
          ) : (
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              {faqs.length} {faqs.length === 1 ? "entry" : "entries"}
            </span>
          )}
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add FAQ
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-neutral-800/50 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded accent-black cursor-pointer"
                  />
                </th>
                <th className="px-4 py-4 w-12">S/N</th>
                <th className="px-6 py-4">Question</th>
                <th className="px-6 py-4">Answer</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
              {faqs.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-300 font-bold uppercase tracking-widest italic text-sm">
                    No FAQs yet. Add your first one!
                  </td>
                </tr>
              )}
              {faqs.map((faq, index) => (
                <tr key={faq.id} className={`hover:bg-gray-50/30 dark:hover:bg-neutral-800/30 transition-colors ${selected.includes(faq.id) ? 'bg-gray-50 dark:bg-neutral-800/50' : ''}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(faq.id)}
                      onChange={() => toggleOne(faq.id)}
                      className="w-4 h-4 rounded accent-black cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-4 font-black text-gray-400 text-[11px]">{index + 1}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100 max-w-xs">
                    <p className="line-clamp-2 text-sm">{faq.question}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm max-w-md">
                    <p className="line-clamp-2">{faq.answer}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(faq)}
                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(faq.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && <TableLoader colSpan={5} />}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-xl relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gray-50/50 dark:bg-neutral-800/50">
              <h3 className="text-lg font-black uppercase tracking-tight">{editFaq ? "Edit FAQ" : "Add FAQ"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black transition-colors p-1 cursor-pointer">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Question</label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g. What is your return policy?"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Answer</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  placeholder="Write the answer here..."
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : editFaq ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => { if (pendingDeleteId) deleteFaq(pendingDeleteId); }}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ? This action cannot be undone."
      />

      <DeleteConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={async () => {
          await bulkDeleteFaqs(selected);
          setSelected([]);
        }}
        title="Delete FAQs"
        message={`Are you sure you want to delete ${selected.length} selected FAQ${selected.length !== 1 ? "s" : ""}? This action cannot be undone.`}
      />
    </div>
  );
}
