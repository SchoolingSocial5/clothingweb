"use client";
import Header from "@/components/Header";
import { useState, useEffect, Suspense } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { resetPassword, loading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";

  useEffect(() => {
    if (!email || !code) {
      router.push("/forgot-password");
    }
  }, [email, code, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      await resetPassword({
        email,
        code,
        newPassword: formData.newPassword
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-[40px] border border-gray-100 dark:border-neutral-800 shadow-xl shadow-black/5 p-12 text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-green-100 dark:border-green-800">
          <svg className="text-green-500" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">Password Reset!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Your password has been updated successfully. You are being redirected to the login page.
        </p>
        <div className="w-full bg-gray-50 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-black dark:bg-white h-full animate-[progress_3s_linear]" />
        </div>
        <style jsx>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-[40px] border border-gray-100 dark:border-neutral-800 shadow-xl shadow-black/5 p-10 md:p-14">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-gray-50 dark:bg-neutral-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2 italic">New Password</h1>
        <p className="text-sm font-bold text-gray-400">Secure your account with a strong password.</p>
      </div>

      {error && (
        <div className="mb-8 p-5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100 dark:border-red-800 flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-1">New Password</label>
          <input
            required
            type="password"
            value={formData.newPassword}
            onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
            className="w-full px-6 py-4 bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 transition-all"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-1">Confirm New Password</label>
          <input
            required
            type="password"
            value={formData.confirmPassword}
            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-6 py-4 bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-black/10 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-10"
        >
          {loading && <div className="w-5 h-5 border-[3px] border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />}
          Reset Password
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <Suspense fallback={
            <div className="bg-white dark:bg-neutral-900 rounded-[40px] shadow-sm p-16 text-center animate-pulse">
               <div className="w-20 h-20 bg-gray-100 dark:bg-neutral-800 rounded-[32px] mx-auto mb-8" />
               <div className="h-6 w-48 bg-gray-100 dark:bg-neutral-800 mx-auto rounded-full mb-4" />
               <div className="h-4 w-64 bg-gray-100 dark:bg-neutral-800 mx-auto rounded-full" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
