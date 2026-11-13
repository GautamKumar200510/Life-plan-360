'use client';

import React from 'react';
import { PlusCircle, Database, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useFinance } from '@/lib/context/FinanceContext';

interface EmptyStateProps {
  onAddTransaction: () => void;
}

export function EmptyState({ onAddTransaction }: EmptyStateProps) {
  const { resetToDemoData } = useFinance();

  return (
    <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm my-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-50 to-emerald-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
        <Sparkles className="w-8 h-8 text-blue-600" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 tracking-tight">
        Welcome to Life Plan 360°
      </h3>
      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
        Your AI-powered wealth management journey begins here. Record your initial income and expenses, or pre-load realistic sample portfolio data to explore all features instantly.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
        <Button
          onClick={onAddTransaction}
          variant="primary"
          icon={<PlusCircle className="w-4 h-4" />}
        >
          Record First Transaction
        </Button>

        <Button
          onClick={() => resetToDemoData()}
          variant="outline"
          icon={<Database className="w-4 h-4 text-emerald-600" />}
        >
          Seed Sample Portfolio
        </Button>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        <div className="p-3 bg-slate-50 rounded-xl">
          <div className="font-semibold text-xs text-slate-800">1. Track Inflows</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Salary, consulting, dividends & rent</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          <div className="font-semibold text-xs text-slate-800">2. Set Budgets</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Stay under limit with smart alerts</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          <div className="font-semibold text-xs text-slate-800">3. AI Insights</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Personalized wealth diagnosis & SIPs</div>
        </div>
      </div>
    </div>
  );
}
