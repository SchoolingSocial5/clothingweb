"use client";
import Header from "@/components/Header";
import { useState, useRef, useEffect, Suspense } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyCodeForm() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const { verifyCode, loading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    try {
      await verifyCode(email, fullCode);
      router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}&code=${fullCode}`);
    } catch (err: any) {
      setError(err.message || "Invalid or expired code.");
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 p-8 md:p-12">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 mb-2">Verify Code</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          Enter the 6-digit authentication code sent to <span className="font-bold text-black dark:text-white">{email}</span>.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-800 italic">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between gap-2 md:gap-4">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className="w-10 h-12 md:w-12 md:h-14 text-center text-xl font-black bg-gray-50 dark:bg-neutral-800 border-2 border-gray-100 dark:border-neutral-700 rounded-xl focus:border-black dark:focus:border-white focus:outline-none transition-all"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-black/10 hover:opacity-85 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />}
          Verify Code
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
          Didn&apos;t receive the code? Check your spam folder or try again.
        </p>
        <Link href="/forgot-password" className="text-xs font-black uppercase tracking-widest text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors">
          Resend New Code
        </Link>
      </div>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Suspense fallback={
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-12 text-center animate-pulse">
               <div className="w-12 h-12 bg-gray-100 dark:bg-neutral-800 rounded-full mx-auto mb-4" />
               <div className="h-4 w-32 bg-gray-100 dark:bg-neutral-800 mx-auto rounded-full" />
            </div>
          }>
            <VerifyCodeForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
