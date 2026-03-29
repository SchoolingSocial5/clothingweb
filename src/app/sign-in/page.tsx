"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SignIn() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.access_token, data.user);
        if (data.user.status === 'staff') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("An unexpected error occurred. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl flex bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
          {/* Form Side */}
          <div className="w-full lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-500 mb-8">Please enter your details to sign in.</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 italic transition-all animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input 
                    required
                    type={showPassword ? "text" : "password"} 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-all pr-12"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <a href="#" className="font-semibold text-black hover:underline">Forgot password?</a>
              </div>

              <button 
                disabled={loading}
                className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-colors shadow-lg shadow-black/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                Sign In
              </button>
            </form>

            <p className="mt-8 text-center text-gray-500 text-sm">
              Don't have an account? <Link href="/sign-up" className="text-black font-bold hover:underline">Sign up for free</Link>
            </p>
          </div>

          {/* Image Side */}
          <div className="hidden lg:block lg:w-1/2 bg-[#E5E3DB] relative">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/menstore4.jpg')" }}></div>
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
