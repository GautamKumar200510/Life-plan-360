'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Target,
  ChevronRight,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { MonthlySummaryCard } from '@/components/dashboard/MonthlySummaryCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AiInsightWidget } from '@/components/dashboard/AiInsightWidget';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { MonthlySpendingDonut } from '@/components/charts/MonthlySpendingDonut';
import { SavingsGrowthArea } from '@/components/charts/SavingsGrowthArea';
import { InvestmentAllocationChart } from '@/components/charts/InvestmentAllocationChart';
import { FinancialOverviewBarChart } from '@/components/charts/FinancialOverviewBarChart';
import { IncomeModal } from '@/components/forms/IncomeModal';
import { ExpenseModal } from '@/components/forms/ExpenseModal';
import { useFinance } from '@/lib/context/FinanceContext';
import { useAuth } from '@/lib/context/AuthContext';
import { formatINR, formatDateIndian } from '@/lib/calculations/currencyFormatter';
import { calculateGoalMetrics } from '@/lib/calculations/financialCalculations';

export default function DashboardPage() {
  const { profile } = useAuth();
  const {
    incomes,
    expenses,
    goals,
    summary,
    addIncome,
    addExpense,
    isLoading,
  } = useFinance();

  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  const hasAnyData = incomes.length > 0 || expenses.length > 0 || summary.currentPortfolioValue > 0;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Executive Wealth Dashboard
            </h1>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, {profile?.full_name || 'Investor'}. Here is your financial overview.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIncomeModalOpen(true)}
            icon={<ArrowDownLeft className="w-4 h-4 text-emerald-600" />}
          >
            Record Income
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setExpenseModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Log Expense
          </Button>
        </div>
      </div>

      {!hasAnyData && !isLoading ? (
        <EmptyState onAddTransaction={() => setExpenseModalOpen(true)} />
      ) : (
        <div className="space-y-6">
          {/* 1. Core Financial Metrics Cards (6 Cards) */}
          <MetricsGrid />

          {/* 2. Monthly Diagnostic & AI Insight Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MonthlySummaryCard />
            </div>
            <div>
              <AiInsightWidget />
            </div>
          </div>

          {/* 3. Primary Charts: Income vs Expense & Monthly Spending */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              title="Income vs Expenses Velocity"
              subtitle="Month-on-month comparison of total inflows and outflows"
              headerAction={
                <Badge variant="blue" size="sm">
                  Last 6 Months
                </Badge>
              }
            >
              <IncomeExpenseChart data={summary.monthlyTrends} />
            </Card>

            <Card
              title="Monthly Spending Breakdown"
              subtitle="Category-wise expense distribution"
              headerAction={
                <Link
                  href="/expenses"
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Manage Spends
                </Link>
              }
            >
              <MonthlySpendingDonut data={summary.categoryBreakdown} />
            </Card>
          </div>

          {/* 4. Secondary Charts: Savings Trajectory & Portfolio Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              title="Savings Growth Trajectory"
              subtitle="Cumulative surplus capital generated over time"
              headerAction={
                <Badge variant="emerald" size="sm">
                  Rate: {summary.savingsRate.toFixed(1)}%
                </Badge>
              }
            >
              <SavingsGrowthArea data={summary.monthlyTrends} />
            </Card>

            <Card
              title="Investment Asset Allocation"
              subtitle="Diversification across Mutual Funds, Stocks, Gold, PPF & FDs"
              headerAction={
                <Link
                  href="/investments"
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Portfolio Details
                </Link>
              }
            >
              <InvestmentAllocationChart data={summary.investmentAllocation} />
            </Card>
          </div>

          {/* 5. Financial Overview Bar Chart */}
          <Card
            title="Comprehensive Monthly Financial Balance"
            subtitle="Side-by-side volume analysis: Income, Expenses, and Net Savings"
            headerAction={
              <span className="text-xs text-slate-500 font-medium">All figures in INR (₹)</span>
            }
          >
            <FinancialOverviewBarChart data={summary.monthlyTrends} />
          </Card>

          {/* 6. Recent Transactions & Upcoming Financial Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentTransactions />

            {/* Upcoming Goals Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Upcoming Financial Goals
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target milestones and capital readiness
                  </p>
                </div>
                <Link
                  href="/goals"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 hover:underline"
                >
                  <span>All Goals</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {goals.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No active goals created yet. Set up a target like Emergency Fund or Home Downpayment!
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-1">
                  {goals.slice(0, 4).map((goal) => {
                    const metrics = calculateGoalMetrics(goal);
                    return (
                      <div key={goal.id} className="py-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                            <span className="text-xs font-semibold text-slate-800">
                              {goal.goal_name}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-blue-600">
                            {metrics.percentageCompleted.toFixed(0)}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              metrics.percentageCompleted >= 100
                                ? 'bg-emerald-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${metrics.percentageCompleted}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                          <span>
                            {formatINR(goal.current_saved_amount)} / {formatINR(goal.target_amount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Target: {formatDateIndian(goal.target_date)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <IncomeModal
        isOpen={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        onSubmit={addIncome}
      />

      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onSubmit={addExpense}
      />
    </DashboardLayout>
  );
}
