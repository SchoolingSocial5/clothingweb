"use client";
import Link from "next/link";
import Header from "@/components/Header";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function SignUp() {
  const { login } = useAuth();
  const { register: storeRegister, loading, error: storeError } = useAuthStore();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await storeRegister(formData);

      login(data.access_token, data.user);
      if (data.user.status === 'staff') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center px-[10px] py-6">
        <div className="w-full max-w-4xl flex card shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
          {/* Form Side */}
          <div className="w-full lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
            <h1 className="text-heading mb-2">Create an Account</h1>
            <p className="text-caption text-base mb-8">Join Wink to discover amazing collections.</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 italic transition-all animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-label block mb-2">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-base"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-label block mb-2">Email</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-base"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="text-label block mb-2">Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="input-base pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="text-black font-bold underline underline-offset-2 hover:text-gray-600 transition-colors">
                  Terms &amp; Conditions
                </Link>.
              </p>

              <button
                disabled={loading}
                className="btn btn-primary btn-lg w-full"
              >
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                Sign Up
              </button>
            </form>

            <p className="mt-8 text-center text-caption text-sm">
              Already have an account? <Link href="/sign-in" className="text-foreground font-bold hover:underline">Log in</Link>
            </p>
          </div>

          {/* Image Side */}
          <div className="hidden lg:block lg:w-1/2 bg-[#d6d6da] relative">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/menstore2.jpg')" }}></div>
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
