'use client';

import React from 'react';
import { ShieldCheck, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatINR } from '@/lib/calculations/currencyFormatter';

export function MonthlySummaryCard() {
  const { summary } = useFinance();

  const savingsRate = summary.savingsRate;
  const budgetUtilization = summary.budgetUtilizationPct;
  const remainingBudget = summary.remainingBudget;

  // Compute a financial fitness score 0-100
  let score = 55;
  if (savingsRate >= 30) score += 25;
  else if (savingsRate >= 15) score += 15;

  if (budgetUtilization > 0 && budgetUtilization <= 85) score += 15;
  else if (budgetUtilization > 100) score -= 15;

  if (summary.currentPortfolioValue > 0) score += 10;
  score = Math.min(99, Math.max(30, score));

  return (
    <div className="bg-gradient-to-br from-[#0b1329] via-[#101d42] to-[#152033] rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
            Financial Health Diagnostic
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">Monthly Wealth Summary</h3>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Score: {score}/100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
        {/* Savings Rate metric */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Savings Discipline</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{savingsRate.toFixed(1)}%</span>
            <span className="text-[11px] text-emerald-400 font-semibold">
              {savingsRate >= 20 ? 'Optimal (>20%)' : 'Target: 25%'}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, savingsRate * 2.5)}%` }}
            />
          </div>
        </div>

        {/* Budget Buffer */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Remaining Budget</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{formatINR(remainingBudget)}</span>
            <span
              className={`text-[11px] font-semibold ${
                budgetUtilization > 100 ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              ({budgetUtilization.toFixed(0)}% utilized)
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                budgetUtilization > 100
                  ? 'bg-rose-500'
                  : budgetUtilization > 80
                  ? 'bg-amber-400'
                  : 'bg-blue-400'
              }`}
              style={{ width: `${Math.min(100, budgetUtilization)}%` }}
            />
          </div>
        </div>

        {/* Top Expense Category */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dominant Outflow</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <p className="text-lg font-bold text-white truncate">
              {summary.topExpenseCategory?.category || 'None Recorded'}
            </p>
            <p className="text-xs text-slate-300 mt-0.5">
              {summary.topExpenseCategory
                ? `${formatINR(summary.topExpenseCategory.amount)} (${summary.topExpenseCategory.percentage.toFixed(0)}% of spends)`
                : 'No expenses yet'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
