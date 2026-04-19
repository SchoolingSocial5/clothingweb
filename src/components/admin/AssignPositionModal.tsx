"use client";
import { useEffect, useState } from 'react';
import { usePositionStore } from '@/store/usePositionStore';
import { useUserStore } from '@/store/useUserStore';

interface AssignPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; name: string; email: string } | null;
  onSuccess: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export default function AssignPositionModal({ isOpen, onClose, user, onSuccess, showToast }: AssignPositionModalProps) {
  const { positions, fetchPositions, loading: positionsLoading } = usePositionStore();
  const { assignPosition, loading: assigning } = useUserStore();
  const [selectedPositionId, setSelectedPositionId] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPositions();
    }
  }, [isOpen, fetchPositions]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPositionId) return;

    try {
      await assignPosition(user.id, selectedPositionId);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Promotion error:', error);
      showToast(error.message || 'Failed to promote user to staff', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-neutral-800 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-3xl flex items-center justify-center text-2xl font-black mb-4 shadow-xl shadow-black/10">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Promote to Staff</h2>
            <p className="text-gray-400 dark:text-gray-500 font-bold text-sm tracking-tight">{user.name} ({user.email})</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Select Job Position</label>
              <select
                value={selectedPositionId}
                onChange={(e) => setSelectedPositionId(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all appearance-none text-gray-900 dark:text-gray-100"
              >
                <option value="">Choose a position...</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>{pos.name} — {pos.salary}</option>
                ))}
              </select>
              <div className="absolute right-5 bottom-4 pointer-events-none text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors border border-gray-100 dark:border-neutral-800 rounded-2xl cursor-pointer"
                disabled={assigning}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedPositionId || assigning || positionsLoading}
                className="flex-[2] bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {assigning ? (
                  <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
                    Confirm
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
