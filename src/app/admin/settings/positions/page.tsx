"use client";
import React, { useEffect, useState } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import { usePositionStore, Position } from '@/store/usePositionStore';
import TableLoader from '@/components/admin/TableLoader';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import Toast from '@/components/admin/Toast';

export default function PositionsPage() {
  const { token } = useAuth();
  const { settings } = useSettings();
  const { positions, loading, fetchPositions, createPosition, updatePosition, deletePosition } = usePositionStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    duties: '',
    salary: ''
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    if (token) {
      fetchPositions();
    }
  }, [token, fetchPositions]);

  const handleOpenModal = (pos?: Position) => {
    if (pos) {
      setEditingPosition(pos);
      setFormData({
        name: pos.name,
        role: pos.role,
        duties: pos.duties,
        salary: pos.salary
      });
    } else {
      setEditingPosition(null);
      setFormData({ name: '', role: '', duties: '', salary: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPosition) {
        await updatePosition(editingPosition.id, formData);
        showToast("Position updated successfully");
      } else {
        await createPosition(formData);
        showToast("Position created successfully");
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast("Failed to save position", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePosition(id);
      showToast("Position deleted");
      setDeleteId(null);
    } catch (err) {
      showToast("Failed to delete position", "error");
    }
  };

  const formatSalary = (salary: string) => {
    if (!salary) return '—';
    const symbol = settings?.currency_symbol || '₦';
    
    // Check if it's a range (e.g., "45000 - 60000" or "45k-60k")
    const rangeParams = salary.split(/[-–—]/).map(s => s.trim());
    
    const formatPart = (part: string) => {
      // Remove whitespace and existing currency symbols
      const clean = part.replace(/[^\d.kK]/g, '');
      
      // Handle 'k' notation (e.g., 45k -> 45000)
      let numStr = clean.toLowerCase().endsWith('k') 
        ? (parseFloat(clean) * 1000).toString() 
        : clean;
        
      const num = parseFloat(numStr);
      if (isNaN(num)) return part; // Return original if not a number
      
      return symbol + num.toLocaleString();
    };

    if (rangeParams.length > 1) {
      return rangeParams.map(formatPart).join(' - ');
    }
    
    return formatPart(salary);
  };

  return (
    <div className="p-[10px] md:p-8 w-full">
      <AdminPageHeader
        title="Job Positions"
        description="Define organizational roles, responsibilities, and compensation packages."
        stats={{ label: "Defined Roles", value: positions.length }}
      >
        <button
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-900 transition-all flex items-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Position
        </button>
      </AdminPageHeader>

      <div className="mt-8 bg-white dark:bg-neutral-900 rounded-[32px] border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-neutral-800/50 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-neutral-800">
                <th className="px-8 py-5 w-16">s/n</th>
                <th className="px-8 py-5">Position</th>
                <th className="px-8 py-5">Role/Category</th>
                <th className="px-8 py-5">Key Duties</th>
                <th className="px-8 py-5">Salary</th>
                <th className="px-8 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
              {loading && positions.length === 0 ? (
                <TableLoader colSpan={6} />
              ) : (
                positions.map((pos, index) => (
                  <tr key={pos.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{pos.name}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 rounded-lg text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">
                        {pos.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-medium text-gray-500 line-clamp-1 max-w-[200px]">{pos.duties}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-bold text-sm text-green-600">{formatSalary(pos.salary)}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(pos)}
                          className="p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-all"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button
                          onClick={() => setDeleteId(pos.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && positions.length === 0 && (
            <div className="py-32 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-neutral-800 rounded-3xl flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No job positions defined yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-50 dark:border-neutral-800 flex justify-between items-center">
              <h3 className="text-xl font-black">{editingPosition ? "Edit Position" : "Add New Position"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Position Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Senior Manager"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Role / Category</label>
                  <input
                    required
                    type="text"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Administration"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Key Duties & Responsibilities</label>
                <textarea
                  required
                  rows={4}
                  value={formData.duties}
                  onChange={e => setFormData({ ...formData, duties: e.target.value })}
                  placeholder="Describe what this role involves..."
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Salary / Compensation</label>
                <input
                  required
                  type="text"
                  value={formData.salary}
                  onChange={e => setFormData({ ...formData, salary: e.target.value })}
                  placeholder={`e.g. ${settings?.currency_symbol || '₦'}45,000 - ${settings?.currency_symbol || '₦'}60,000`}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border-none rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" disabled={saving} onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors disabled:opacity-30">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-black/20 active:scale-95 transition-all disabled:opacity-50">
                  {saving ? (editingPosition ? "Updating..." : "Saving...") : (editingPosition ? "Update Position" : "Save Position")}
                </button>
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
        message="Are you sure you want to delete this job position definition? This will not affect existing staff members."
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
