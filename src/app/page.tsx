'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  PieChart,
  Target,
  Hourglass,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/lib/context/AuthContext';

export default function LandingPage() {
  const { user, loginAsDemo } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-extrabold text-lg">360°</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900 tracking-tight">Life Plan 360°</span>
              <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
                Wealth Management
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#retirement" className="hover:text-blue-600 transition-colors">Retirement Planning</a>
            <a href="#ai-advisor" className="hover:text-blue-600 transition-colors">AI Advisor</a>
            <a href="#security" className="hover:text-blue-600 transition-colors">Security</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Introducing AI-Powered Wealth Intelligence for Modern Investors</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Master Your Cash Flow, Grow Your Net Worth,{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              Retire With Confidence.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The all-in-one financial operating system. Centralize your income, expenses, investments, savings goals, and inflation-adjusted retirement roadmap with 24/7 AI advisory.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" variant="primary" icon={<ArrowRight className="w-5 h-5" />}>
                Launch Dashboard Now
              </Button>
            </Link>
            <button
              onClick={() => {
                loginAsDemo();
                window.location.href = '/dashboard';
              }}
              className="inline-flex items-center justify-center text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-6 py-3 shadow-sm hover:shadow transition-all"
            >
              Explore Live Demo Portfolio (₹ INR)
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> INR (₹) Number Formatting
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Bank-grade Supabase RLS
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gemini Neural AI
            </span>
          </div>

          {/* SaaS Dashboard Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl bg-[#0b1329] p-3 sm:p-5 shadow-2xl border border-slate-800 text-left">
            <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs text-slate-400 font-mono">lifeplan360.app/dashboard</span>
              <div className="text-xs text-emerald-400 font-medium">● Connected</div>
            </div>

            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium uppercase">Net Worth</span>
                <p className="text-xl font-bold text-white mt-1">₹38,20,500</p>
                <span className="text-[10px] text-emerald-400 font-semibold">+18.4% Return</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium uppercase">Monthly Inflow</span>
                <p className="text-xl font-bold text-white mt-1">₹1,85,500</p>
                <span className="text-[10px] text-blue-400 font-semibold">Salary & Consulting</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium uppercase">Savings Rate</span>
                <p className="text-xl font-bold text-emerald-400 mt-1">36.2%</p>
                <span className="text-[10px] text-slate-400 font-semibold">Target: 30%</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium uppercase">Retirement Corpus</span>
                <p className="text-xl font-bold text-white mt-1">₹3.84 Cr</p>
                <span className="text-[10px] text-purple-400 font-semibold">SIP: ₹22,500/mo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Comprehensive Financial Engine
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Everything required to preserve, grow, and audit personal wealth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Income & Expense Auditing</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Categorize salary, consulting, business dividends, and rental revenue. Track living costs with payment method tagging and monthly expense velocity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Smart Budget Management</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Set category-specific thresholds and overall monthly limits. Receive real-time alerts when spending approaches or exceeds your comfort zone.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Multi-Asset Portfolio Tracker</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Manage Mutual Funds, Bluechip Stocks, EPF, PPF, Sovereign Gold, Fixed Deposits, and Real Estate with live asset allocation visualizers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Savings Goals with SIP Milestones</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Automate targets for emergency cushions, home downpayments, weddings, or higher education. Calculate exact monthly savings needed to hit each deadline.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Hourglass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Inflation-Adjusted Retirement Model</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Simulate post-retirement expenses, required life corpus, and current savings future value. Discover your exact recommended monthly SIP.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">AI Financial Advisor & Diagnosis</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Gemini-powered neural insights analyze your real data to calculate your Financial Health Score, spending anomalies, and personalized surplus strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Architecture */}
      <section id="security" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <Lock className="w-3.5 h-3.5" />
              <span>Multi-Tenant Row Level Security (RLS)</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Enterprise Privacy & Data Isolation</h2>
            <p className="text-slate-400 mt-3 text-sm">
              Your financial records are strictly isolated via PostgreSQL Row Level Security policies. Passwords and credentials never touch third-party AI models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h4 className="font-bold text-base">Supabase PostgreSQL</h4>
              <p className="text-xs text-slate-400 mt-1">
                ACID-compliant relational database with foreign key integrity and user UUID constraints.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
              <Lock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h4 className="font-bold text-base">Client Isolation</h4>
              <p className="text-xs text-slate-400 mt-1">
                Every user only queries their own tenant records verified by cryptographic JWT authentication.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h4 className="font-bold text-base">Private AI Synthesis</h4>
              <p className="text-xs text-slate-400 mt-1">
                Aggregated statistics are passed via server-side endpoints with zero personal identifiable credentials exposed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              360°
            </div>
            <span className="font-semibold text-white text-sm">Life Plan 360° Wealth Platform</span>
          </div>

          <p className="text-xs text-slate-500">
            © 2026 Life Plan 360°. Educational wealth management suite. Not a registered investment advisory.
          </p>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/dashboard" className="text-blue-400 hover:underline">
              Enter App
            </Link>
            <Link href="/login" className="hover:text-white">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-white">
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
