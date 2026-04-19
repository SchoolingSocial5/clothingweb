"use client";
import { useAuth } from "@/context/AuthContext";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfilePage() {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const { changePassword } = useAuthStore();

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPassError("New password must be at least 6 characters.");
      return;
    }

    setPassLoading(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPassSuccess("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPassError(err.message);
    } finally {
      setPassLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  // Handle both API naming conventions
  const displayPosition = user.position || user.staffPosition || 'Administrative Staff';
  const displayRole = user.role || user.staffRole || 'Default Access';
  const displaySalary = user.salary || user.staffSalary || '—';
  const displayDuties = user.duties || user.staffDuties || 'General administrative duties as assigned by the administrator.';

  return (
    <div className="p-[10px] md:p-8 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AdminPageHeader
        title="My Profile"
        description="View your professional details, account settings, and assigned duties."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-neutral-900 rounded-[40px] border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden p-8 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-[48px] bg-black text-white flex items-center justify-center text-5xl font-black mb-6 ring-[12px] ring-gray-50 dark:ring-neutral-800 shadow-2xl shadow-black/10 transition-transform hover:scale-105 duration-500">
              {user.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight mb-1">{user.name}</h2>
            <p className="text-xs font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] mb-6">{displayPosition}</p>

            <div className="flex gap-2 mb-8">
              <span className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-black/5">
                {user.status}
              </span>
              <span className="px-4 py-1.5 bg-gray-50 dark:bg-neutral-800 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100 dark:border-neutral-700">
                Active
              </span>
            </div>

            <div className="w-full pt-8 border-t border-gray-50 dark:border-neutral-800 space-y-4">
              <div className="flex items-center justify-between group">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee ID</span>
                <span className="text-xs font-black text-gray-900 dark:text-white group-hover:text-black transition-colors">#{user.id.toString().padStart(4, '0')}</span>
              </div>
              <div className="flex items-center justify-between group">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Join Date</span>
                <span className="text-xs font-black text-gray-900 dark:text-white group-hover:text-black transition-colors">April 2024</span>
              </div>
            </div>
          </div>

          <div className="bg-black dark:bg-white text-white dark:text-black rounded-[40px] p-8 shadow-2xl shadow-black/20 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-700">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><line x1="12" y1="6" x2="12" y2="18"></line></svg>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Current Salary</p>
            <h3 className="text-4xl font-black tracking-tighter mb-1">{displaySalary}</h3>
            <p className="text-[10px] font-bold opacity-40">Monthly remuneration package</p>
          </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Professional Details Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-[40px] border border-gray-100 dark:border-neutral-800 shadow-sm p-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center text-black dark:text-white border border-gray-100 dark:border-neutral-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white italic">Professional Profile</h3>
                <p className="text-xs font-bold text-gray-400">Assigned roles and permissions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Administrative Role</label>
                <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl px-6 py-4 flex flex-wrap gap-2">
                  {displayRole.split(',').map((role, idx) => (
                    <span key={idx} className="bg-white dark:bg-neutral-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-gray-100 dark:border-neutral-700 shadow-sm text-gray-600 dark:text-gray-300">
                      {role.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Job Designation</label>
                <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl px-6 py-4 text-sm font-black text-gray-900 dark:text-white tracking-tight">
                  {displayPosition}
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Core Duties & Responsibilities</label>
              <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-[32px] p-8">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic">
                  "{displayDuties}"
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information & Security Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-[40px] border border-gray-100 dark:border-neutral-800 shadow-sm p-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center text-black dark:text-white border border-gray-100 dark:border-neutral-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white italic">Contact & Security</h3>
                <p className="text-xs font-bold text-gray-400">Communication details and account security</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="flex flex-col gap-1 group">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Email Address</span>
                <span className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 dark:text-white transition-all group-hover:bg-gray-100 dark:group-hover:bg-neutral-800">{user.email}</span>
              </div>
              <div className="flex flex-col gap-1 group">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Phone Number</span>
                <span className="bg-gray-50 dark:bg-neutral-800/50 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 dark:text-white transition-all group-hover:bg-gray-100 dark:group-hover:bg-neutral-800">{user.phone || 'Not Provided'}</span>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-50 dark:border-neutral-800">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Update Password</h4>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                {passError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 dark:border-red-800">
                    {passError}
                  </div>
                )}
                {passSuccess && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-100 dark:border-green-800">
                    {passSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Current Password</label>
                    <input
                      required
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-white transition-all focus:ring-4 focus:ring-black/5 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">New Password</label>
                    <input
                      required
                      type="password"
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-white transition-all focus:ring-4 focus:ring-black/5 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Confirm New Password</label>
                    <input
                      required
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-white transition-all focus:ring-4 focus:ring-black/5 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full md:w-auto px-10 py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-black/10 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {passLoading && <div className="w-3 h-3 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />}
                  Update Security Key
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
