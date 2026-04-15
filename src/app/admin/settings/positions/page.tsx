"use client";
import React, { useState } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

interface Position {
  id: number;
  title: string;
  description: string;
  count: number;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([
    { id: 1, title: 'Manager', description: 'Overall operations oversight', count: 2 },
    { id: 2, title: 'Sales Associate', description: 'Customer service and sales', count: 5 },
    { id: 3, title: 'Accountant', description: 'Financial tracking and reporting', count: 1 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPos = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      count: 0
    };
    setPositions([...positions, newPos]);
    setIsModalOpen(false);
    setFormData({ title: '', description: '' });
  };

  const handleDelete = (id: number) => {
    setPositions(positions.filter(p => p.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="p-[10px] md:p-8 w-full">
      <AdminPageHeader
        title="Staff Positions"
        description="Define and manage job roles within your organization."
        stats={{ label: "Active Roles", value: positions.length }}
      >
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-900 transition-all flex items-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Position
        </button>
      </AdminPageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {positions.map((pos) => (
          <div key={pos.id} className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-black text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black">
                {pos.title.charAt(0)}
              </div>
              <button
                onClick={() => setDeleteId(pos.id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              </button>
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-1">{pos.title}</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed line-clamp-2">{pos.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-neutral-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Staff</span>
              <span className="bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 px-3 py-1 rounded-lg text-xs font-black">{pos.count}</span>
            </div>
          </div>
        ))}

        {positions.length === 0 && (
          <div className="col-span-full py-20 bg-white dark:bg-neutral-900 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-neutral-800 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-gray-50 dark:bg-neutral-800 rounded-3xl flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
             </div>
             <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No positions defined yet</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-8 py-6 border-b border-gray-50 dark:border-neutral-800 flex justify-between items-center">
                <h3 className="text-xl font-black">Add New Position</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
             </div>
             <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Position Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Warehouse Manager"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the responsibilities of this role..."
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold resize-none"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-black/20 active:scale-95 transition-all">Save Position</button>
                </div>
             </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Position"
        message="Are you sure you want to remove this job position? This will not remove existing staff members assigned to it."
      />
    </div>
  );
}
