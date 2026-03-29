"use client";

import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="max-w-[1400px] mx-auto px-8 py-20">
        <div className="bg-gray-50 rounded-[3rem] p-12 md:p-20 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
              Welcome back, <span className="text-gray-400">{user.name}</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-md mb-12">
              Manage your orders, track your shipments, and update your personal information.
            </p>

            <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                </div>
                <h3 className="text-xl font-bold">My Orders</h3>
                <p className="text-gray-500 text-sm">Track active shipments and view your purchase history.</p>
                <button className="text-sm font-black uppercase tracking-widest hover:underline pt-2">View Orders</button>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-gray-100 text-black rounded-2xl flex items-center justify-center mb-6">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </div>
                <h3 className="text-xl font-bold">Settings</h3>
                <p className="text-gray-500 text-sm">Update your profile, email, and security preferences.</p>
                <button className="text-sm font-black uppercase tracking-widest hover:underline pt-2">Account Settings</button>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-gray-100 text-black rounded-2xl flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                </div>
                <h3 className="text-xl font-bold">Wishlist</h3>
                <p className="text-gray-500 text-sm">Access your saved items and shop them anytime.</p>
                <button className="text-sm font-black uppercase tracking-widest hover:underline pt-2">View Wishlist</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
