'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/lib/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email address and password');
      return;
    }

    setIsLoading(true);
    setError('');
    const res = await login(email, password);
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push('/dashboard');
    }
  };

  const handleDemoLogin = () => {
    loginAsDemo();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-extrabold text-xl">
            360°
          </div>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Sign In to Life Plan 360°
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your credentials to access your financial portfolio
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-3xl sm:px-10">
          {/* Quick Demo Mode Notice */}
          <div className="mb-6 p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-2xl text-xs text-blue-800 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Instant Evaluation:</span> Click below to explore the complete pre-populated wealth portfolio without setting up Supabase right away.
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full mb-6 py-2.5 text-xs bg-[#0b1329] hover:bg-[#152033]"
            onClick={handleDemoLogin}
            icon={<Sparkles className="w-4 h-4 text-emerald-400" />}
          >
            Launch Instant Demo Account (₹ INR)
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">
                Or Continue With Supabase
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resetSent && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">
              Password reset link has been dispatched if this email exists.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setResetSent(true)}
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-800"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-blue-600 hover:underline">
              Create free account
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {isSupabaseConfigured
                ? 'Connected to live Supabase Auth instance'
                : 'Local environment active (Configure .env for Supabase)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
