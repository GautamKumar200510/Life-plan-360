'use client';

import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { BudgetModal } from '@/components/forms/BudgetModal';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatINR } from '@/lib/calculations/currencyFormatter';

export default function BudgetPage() {
  const { budget, updateBudget, expenses, summary } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);

  // Current month prefix
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthExpenses = expenses.filter((e) => e.date?.startsWith(currentMonthPrefix));
  const totalBudget = budget?.total_budget || 50000;
  const spent = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = Math.max(0, totalBudget - spent);
  const utilizationPct = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
  const isOverBudget = spent > totalBudget;
  const isNearBudget = utilizationPct >= 80 && !isOverBudget;

  // Category spending calculation
  const categorySpends: Record<string, number> = {};
  currentMonthExpenses.forEach((e) => {
    categorySpends[e.category] = (categorySpends[e.category] || 0) + e.amount;
  });

  const categoryBudgets = budget?.category_budgets || {};
  const allCategories = Array.from(
    new Set([...Object.keys(categoryBudgets), ...Object.keys(categorySpends)])
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Monthly Budget Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enforce spending discipline and track allocations in Indian Rupees (₹)
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          icon={<Sliders className="w-4 h-4" />}
        >
          Adjust Budget Parameters
        </Button>
      </div>

      {/* Budget Alerts Banner */}
      {isOverBudget ? (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-sm block mb-0.5">Budget Alert: Spending Exceeded!</span>
            You have spent <strong>{formatINR(spent)}</strong> against your monthly allocation of{' '}
            <strong>{formatINR(totalBudget)}</strong> ({utilizationPct.toFixed(1)}% utilization). You are over budget by{' '}
            <strong>{formatINR(spent - totalBudget)}</strong>.
          </div>
        </div>
      ) : isNearBudget ? (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-sm block mb-0.5">Caution: Nearing Monthly Budget Limit</span>
            You have utilized <strong>{utilizationPct.toFixed(1)}%</strong> of your monthly allowance with{' '}
            <strong>{formatINR(remaining)}</strong> remaining for the rest of this month.
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-sm block mb-0.5">Healthy Budget Utilization</span>
            Spending is well disciplined at <strong>{utilizationPct.toFixed(1)}%</strong> of monthly capacity with{' '}
            <strong>{formatINR(remaining)}</strong> surplus buffer remaining.
          </div>
        </div>
      )}

      {/* Top 3 Primary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Monthly Budget
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatINR(totalBudget)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Sanctioned spending limit</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Current Month Expenses
          </span>
          <p className="text-2xl font-bold text-rose-600 mt-2">{formatINR(spent)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {utilizationPct.toFixed(1)}% utilized so far
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Remaining Budget
          </span>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{formatINR(remaining)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {isOverBudget ? 'Deficit' : 'Available cash headroom'}
          </span>
        </div>
      </div>

      {/* Overall Progress Gauge Card */}
      <Card
        title="Monthly Overall Budget Gauge"
        subtitle={`Period: ${now.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`}
        headerAction={
          <Badge
            variant={isOverBudget ? 'red' : isNearBudget ? 'amber' : 'emerald'}
            size="md"
          >
            {utilizationPct.toFixed(0)}% Consumed
          </Badge>
        }
        className="mb-6"
      >
        <div className="space-y-3">
          <div className="w-full bg-slate-100 rounded-2xl h-4 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-xl transition-all duration-500 ${
                isOverBudget ? 'bg-rose-500' : isNearBudget ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, utilizationPct)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>₹0 (Month Start)</span>
            <span>Target: {formatINR(totalBudget)}</span>
          </div>

          {budget?.notes && (
            <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 flex items-center gap-2 mt-2">
              <Info className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Strategy: {budget.notes}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Category-wise Budget Tracking Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Category-wise Budget Tracking
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live consumption vs allocated caps per expense category
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allCategories.map((category) => {
            const catBudget = categoryBudgets[category] || 0;
            const catSpent = categorySpends[category] || 0;
            const catRemaining = Math.max(0, catBudget - catSpent);
            const catPct = catBudget > 0 ? (catSpent / catBudget) * 100 : catSpent > 0 ? 100 : 0;
            const catOver = catSpent > catBudget && catBudget > 0;

            return (
              <div
                key={category}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <h4 className="text-sm font-bold text-slate-900">{category}</h4>
                  </div>
                  <Badge
                    size="sm"
                    variant={catOver ? 'red' : catPct > 80 ? 'amber' : 'emerald'}
                  >
                    {catPct.toFixed(0)}%
                  </Badge>
                </div>

                <div className="flex items-baseline justify-between text-xs mt-3 mb-1.5">
                  <span className="text-slate-500">
                    Spent: <strong className="text-slate-900">{formatINR(catSpent)}</strong>
                  </span>
                  <span className="text-slate-500">
                    Budget: <strong className="text-slate-900">{formatINR(catBudget)}</strong>
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      catOver ? 'bg-rose-500' : catPct > 80 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, catPct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>
                    {catOver
                      ? `Exceeded by ${formatINR(catSpent - catBudget)}`
                      : `Remaining: ${formatINR(catRemaining)}`}
                  </span>
                  <span>{catSpent > 0 ? 'Active spends' : 'No spends yet'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BudgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={updateBudget}
        currentBudget={budget}
      />
    </DashboardLayout>
  );
}
