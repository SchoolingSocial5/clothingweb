"use client";
import { useEffect, useState } from "react";
import { useUserStore, User } from "@/store/useUserStore";
import { useAuth } from "@/context/AuthContext";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TableLoader from "@/components/admin/TableLoader";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AssignPositionModal from "@/components/admin/AssignPositionModal";
import Toast from "@/components/admin/Toast";

export default function StaffPage() {
  const { token } = useAuth();
  const { users, loading, fetchStaff, updateUserRole, deleteUser } = useUserStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [suspendId, setSuspendId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    if (token) {
      fetchStaff();
    }
  }, [token, fetchStaff]);

  const handleRemove = async (id: string) => {
    try {
      await deleteUser(id);
      showToast("Staff removed successfully");
      setDeleteId(null);
    } catch (err) {
      showToast("Failed to remove staff", "error");
    }
  };

  const handleToggleSuspend = async (user: User) => {
    const newStatus = user.status === 'suspended' ? 'staff' : 'suspended';
    try {
      await updateUserRole(user.id, newStatus, user.role);
      showToast(user.status === 'suspended' ? "Staff reactivated" : "Staff suspended");
      setSuspendId(null);
    } catch (err) {
      showToast("Operation failed", "error");
    }
  };

  return (
    <div className="p-[10px] md:p-8 w-full">
      <AdminPageHeader 
        title="Staff Management" 
        description="Manage your team members, their contact details, and account status."
        stats={{ label: "Total Team", value: users.length }}
      />

      <div className="mt-8 bg-white dark:bg-neutral-900 rounded-[32px] border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-neutral-800/50 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-neutral-800">
                <th className="px-8 py-5 w-16">s/n</th>
                <th className="px-8 py-5">Name</th>
                <th className="px-8 py-5">Position</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Phone Number</th>
                <th className="px-8 py-5">Email Address</th>
                <th className="px-8 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
              {loading ? (
                <TableLoader colSpan={7} />
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-sm uppercase ring-4 ring-gray-50 dark:ring-neutral-800 transition-transform group-hover:scale-105 duration-500">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{user.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 italic">{user.staffPosition || user.position || '—'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-1">
                        {(user.staffRole || user.role || 'Staff').split(',').map((r, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 text-[9px] font-black uppercase tracking-tighter rounded-md text-gray-500 group-hover:bg-black group-hover:text-white transition-all">
                            {r.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{user.phone || '—'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{user.email}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => setEditUser(user)}
                          title="Edit Position"
                          className="p-2.5 bg-gray-50 dark:bg-neutral-800 text-gray-400 hover:text-black dark:hover:text-white rounded-xl transition-all hover:shadow-lg hover:shadow-black/5"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button
                          onClick={() => setSuspendId(user.id)}
                          title={user.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          className={`p-2.5 rounded-xl transition-all hover:shadow-lg ${
                            user.status === 'suspended'
                              ? 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                              : 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white'
                          }`}
                        >
                          {user.status === 'suspended' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteId(user.id)}
                          title="Remove Staff"
                          className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all hover:shadow-lg hover:shadow-red-600/10"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && users.length === 0 && (
            <div className="py-32 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-neutral-800 rounded-3xl flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No staff members found</p>
            </div>
          )}
        </div>
      </div>

      <AssignPositionModal
        isOpen={editUser !== null}
        onClose={() => setEditUser(null)}
        user={editUser}
        onSuccess={() => {
          fetchStaff();
          showToast("Position updated successfully");
        }}
        showToast={showToast}
      />

      <DeleteConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleRemove(deleteId)}
        title="Remove Staff Member"
        message="Are you sure you want to remove this staff member? This will permanently delete their administrative access and account."
      />

      <DeleteConfirmModal
        isOpen={suspendId !== null}
        onClose={() => setSuspendId(null)}
        onConfirm={() => {
          const user = users.find(u => u.id === suspendId);
          if (user) handleToggleSuspend(user);
        }}
        title={users.find(u => u.id === suspendId)?.status === 'suspended' ? "Reactivate Staff" : "Suspend Staff"}
        message={users.find(u => u.id === suspendId)?.status === 'suspended' 
          ? "Are you sure you want to reactivate this account? They will regain access immediately."
          : "Suspending this staff member will block their access to the platform until reactivated. Continue?"}
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
