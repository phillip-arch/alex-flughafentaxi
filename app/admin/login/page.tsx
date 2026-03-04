'use client';

import { useState } from 'react';
import Link from 'next/link';
import { adminLogin } from '@/app/(auth)/actions'; // Reuse the login action
import { ShieldCheck, Lock, Mail, Loader2, ChevronLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const result = await adminLogin(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7] p-4">
      
      {/* Back Button */}
      <div className="w-full max-w-[400px] mb-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-[#86868b] hover:text-[#1d1d1f] transition-colors font-medium text-[15px]"
        >
          <ChevronLeft size={20} />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-[400px] bg-white rounded-[24px] border border-[#d2d2d7] overflow-hidden shadow-sm animate-in fade-in zoom-in duration-500">
        {/* Header */}
        <div className="p-8 text-center border-b border-[#d2d2d7]/50">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#f5f5f7] rounded-full mb-4 text-[#1d1d1f]">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-[28px] font-semibold text-[#1d1d1f] leading-tight mb-2 tracking-tight">
            Admin Portal
          </h1>
          <p className="text-[#86868b] text-[15px]">
            Sign in to manage bookings and drivers.
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-[#fff2f4] text-[#d70015] rounded-xl text-[14px] font-medium flex items-center gap-2 border border-[#ffd4d8] animate-in fade-in">
              <span className="block w-1.5 h-1.5 bg-[#d70015] rounded-full" />
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                required
                className="w-full pl-12 p-4 rounded-xl bg-white border border-[#d2d2d7] text-[#1d1d1f] text-[17px] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]" size={20} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full pl-12 p-4 rounded-xl bg-white border border-[#d2d2d7] text-[#1d1d1f] text-[17px] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-[17px] py-4 rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-8"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
