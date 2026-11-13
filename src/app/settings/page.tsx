'use client';

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  ShieldCheck,
  Database,
  RotateCcw,
  Trash2,
  Download,
  Check,
  Save,
  Key,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/lib/context/AuthContext';
import { useFinance } from '@/lib/context/FinanceContext';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function SettingsPage() {
  const { user, profile, updateProfile, isDemo } = useAuth();
  const { resetToDemoData, clearData, incomes, expenses, investments, goals, budget } = useFinance();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [currency, setCurrency] = useState(profile?.currency || 'INR');
  const [budgetTarget, setBudgetTarget] = useState((profile?.monthly_budget_target || 65000).toString());
  const [currentAge, setCurrentAge] = useState((profile?.current_age || 32).toString());
  const [retirementAge, setRetirementAge] = useState((profile?.retirement_age || 58).toString());

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      full_name: fullName.trim(),
      currency,
      monthly_budget_target: parseFloat(budgetTarget) || 50000,
      current_age: parseInt(currentAge) || 30,
      retirement_age: parseInt(retirementAge) || 60,
    });
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportFullBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      user: profile,
      incomes,
      expenses,
      investments,
      goals,
      budget,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `LifePlan360_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Platform Settings & Account Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal profile, actuarial defaults, and database connectivity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Configuration (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="User Profile & Financial Baselines"
            subtitle="Configure your default wealth parameters"
          >
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {savedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Profile settings updated successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile?.email || user?.email || ''}
                    disabled
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Base Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="INR">₹ INR (Indian Rupee)</option>
                    <option value="USD">$ USD (US Dollar)</option>
                    <option value="EUR">€ EUR (Euro)</option>
                    <option value="GBP">£ GBP (British Pound)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Age
                  </label>
                  <input
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Retirement Target Age
                  </label>
                  <input
                    type="number"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  icon={<Save className="w-4 h-4" />}
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Backup & Export Card */}
          <Card
            title="Data Portability & Backup"
            subtitle="Download your complete financial database state in JSON format"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-600">
                  Export all incomes, expenses, investments, savings goals, and budgets as a structured JSON file for your offline records.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportFullBackup}
                icon={<Download className="w-4 h-4 text-blue-600" />}
              >
                Export JSON Backup
              </Button>
            </div>
          </Card>
        </div>

        {/* Database & System Diagnostic (1 Col) */}
        <div className="space-y-6">
          <Card title="Database & RLS Engine">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Database Engine</span>
                <span className="font-semibold text-slate-900">PostgreSQL (Supabase)</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Connection Status</span>
                <Badge
                  variant={isSupabaseConfigured && !isDemo ? 'emerald' : 'amber'}
                  size="sm"
                >
                  {isSupabaseConfigured && !isDemo ? 'Live Supabase' : 'Demo / Local State'}
                </Badge>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Row Level Security</span>
                <span className="font-semibold text-emerald-600">Enabled (schema.sql)</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">AI Model Provider</span>
                <span className="font-semibold text-purple-600">Gemini 1.5 Flash</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed">
              To connect your own live Supabase instance, supply <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code> and run the provided <code>supabase/schema.sql</code> in your Supabase SQL editor.
            </div>
          </Card>

          {/* Data Reset Tools */}
          <Card title="Data Tools & Reset">
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (window.confirm('Reset all portfolio entries to sample Indian wealth data?')) {
                    resetToDemoData();
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  <span>Restore Demo Portfolio</span>
                </div>
                <Badge variant="blue" size="sm">
                  Populate
                </Badge>
              </button>

              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'Clear all data in this session to evaluate a blank new user account?'
                    )
                  ) {
                    clearData();
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-xs font-semibold text-rose-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Clear All Records</span>
                </div>
                <Badge variant="red" size="sm">
                  Empty State
                </Badge>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
