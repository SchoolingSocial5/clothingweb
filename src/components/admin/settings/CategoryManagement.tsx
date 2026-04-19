"use client";
import { useState, useEffect } from "react";
import { useCategoryStore } from "@/store/useCategoryStore";

interface Props {
  onDeleteRequest: (id: number, name: string) => void;
}

export default function CategoryManagement({ onDeleteRequest }: Props) {
  const { categories, fetchCategories, addCategory, loading } = useCategoryStore();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryMsg, setCategoryMsg] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = async () => {
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    try {
      await addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setCategoryMsg('Category added!');
      setTimeout(() => setCategoryMsg(''), 2500);
    } catch { 
      setCategoryMsg('Already exists or failed.'); 
      setTimeout(() => setCategoryMsg(''), 2500); 
    } finally { 
      setAddingCategory(false); 
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors">
      <div className="p-6 md:p-8 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/30 dark:bg-neutral-800/30">
        <h3 className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-gray-100">Product Categories</h3>
        <p className="text-xs text-gray-400 mt-1 font-bold">Manage the categories available for categorising products</p>
      </div>
      <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex gap-3">
        <input
          type="text"
          value={newCategoryName}
          onChange={e => setNewCategoryName(e.target.value)}
          placeholder="e.g. Spring Collection"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="flex-1 px-5 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
        />
        <button
          type="button"
          disabled={addingCategory || !newCategoryName.trim()}
          onClick={handleAdd}
          className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {addingCategory ? 'Adding...' : 'Add'}
        </button>
      </div>
      {categoryMsg && (
        <p className={`px-6 py-2 text-xs font-bold ${categoryMsg.includes('added') ? 'text-green-600' : 'text-red-500'}`}>{categoryMsg}</p>
      )}
      <div className="divide-y divide-gray-50 dark:divide-neutral-800 max-h-72 overflow-y-auto">
        {categories.length === 0 && !loading ? (
          <p className="px-8 py-10 text-center text-gray-400 text-sm font-bold uppercase tracking-widest italic">No categories yet. Add your first!</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-8 py-2 hover:bg-gray-50/30 dark:hover:bg-neutral-800/30 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-black dark:bg-white opacity-30"/>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{cat.name}</span>
              </div>
              <button
                type="button"
                onClick={() => onDeleteRequest(cat.id, cat.name)}
                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
