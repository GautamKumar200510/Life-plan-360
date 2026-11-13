'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  ShieldCheck,
  Calendar,
  Filter,
  Download,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { MonthlySpendingDonut } from '@/components/charts/MonthlySpendingDonut';
import { SavingsGrowthArea } from '@/components/charts/SavingsGrowthArea';
import { InvestmentAllocationChart } from '@/components/charts/InvestmentAllocationChart';
import { FinancialOverviewBarChart } from '@/components/charts/FinancialOverviewBarChart';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatINR, formatPercentage } from '@/lib/calculations/currencyFormatter';

type DateFilterOption =
  | '7_days'
  | '30_days'
  | '3_months'
  | '6_months'
  | '1_year'
  | 'custom';

export default function AnalyticsPage() {
  const { incomes, expenses, investments, liabilities, budget, summary } = useFinance();
  const [selectedFilter, setSelectedFilter] = useState<DateFilterOption>('6_months');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Date filter logic
  const filteredData = useMemo(() => {
    const now = new Date();
    let cutoffDate = new Date();

    if (selectedFilter === '7_days') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (selectedFilter === '30_days') {
      cutoffDate.setDate(now.getDate() - 30);
    } else if (selectedFilter === '3_months') {
      cutoffDate.setMonth(now.getMonth() - 3);
    } else if (selectedFilter === '6_months') {
      cutoffDate.setMonth(now.getMonth() - 6);
    } else if (selectedFilter === '1_year') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }

    const filteredIncomes = incomes.filter((i) => {
      if (!i.date) return false;
      const d = new Date(i.date);
      if (selectedFilter === 'custom') {
        if (customStart && d < new Date(customStart)) return false;
        if (customEnd && d > new Date(customEnd)) return false;
        return true;
      }
      return d >= cutoffDate;
    });

    const filteredExpenses = expenses.filter((e) => {
      if (!e.date) return false;
      const d = new Date(e.date);
      if (selectedFilter === 'custom') {
        if (customStart && d < new Date(customStart)) return false;
        if (customEnd && d > new Date(customEnd)) return false;
        return true;
      }
      return d >= cutoffDate;
    });

    const totalInc = filteredIncomes.reduce((s, i) => s + i.amount, 0);
    const totalExp = filteredExpenses.reduce((s, e) => s + e.amount, 0);
    const netSavings = Math.max(0, totalInc - totalExp);
    const sRate = totalInc > 0 ? (netSavings / totalInc) * 100 : 0;

    return {
      totalInc,
      totalExp,
      netSavings,
      sRate,
    };
  }, [incomes, expenses, selectedFilter, customStart, customEnd]);

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Financial Analytics & Deep Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Empirical ratios, cash flow waterfall, and multi-year net worth dynamics
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: '7_days', label: '7D' },
              { key: '30_days', label: '30D' },
              { key: '3_months', label: '3M' },
              { key: '6_months', label: '6M' },
              { key: '1_year', label: '1Y' },
              { key: 'custom', label: 'Custom' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelectedFilter(opt.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedFilter === opt.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range selector */}
      {selectedFilter === 'custom' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
        </div>
      )}

      {/* Financial Health Ratios Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Selected Period Inflows
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatINR(filteredData.totalInc)}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Cash received in interval
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Selected Period Expenses
          </span>
          <p className="text-2xl font-bold text-rose-600 mt-2">
            {formatINR(filteredData.totalExp)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Outflow in interval</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Net Savings Surplus
          </span>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {formatINR(filteredData.netSavings)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Inflows minus Outflows</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Savings Rate Ratio
          </span>
          <p
            className={`text-2xl font-bold mt-2 ${
              filteredData.sRate >= 20 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {filteredData.sRate.toFixed(1)}%
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Target benchmark: &gt;25%
          </span>
        </div>
      </div>

      {/* Primary Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card
          title="Income vs Expenses Trends"
          subtitle="Monthly cash trajectory analysis"
        >
          <IncomeExpenseChart data={summary.monthlyTrends} />
        </Card>

        <Card
          title="Monthly Cash Flow Overview"
          subtitle="Side-by-side volume distribution"
        >
          <FinancialOverviewBarChart data={summary.monthlyTrends} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card
          title="Category-wise Spending Density"
          subtitle="Where your monthly expenditures are concentrated"
        >
          <MonthlySpendingDonut data={summary.categoryBreakdown} />
        </Card>

        <Card
          title="Multi-Asset Portfolio Allocation"
          subtitle="Asset classes balance and equity-debt ratio"
        >
          <InvestmentAllocationChart data={summary.investmentAllocation} />
        </Card>
      </div>

      {/* Net Worth Equation Breakdown Card */}
      <Card
        title="Net Worth Equation & Asset Decomposition"
        subtitle="Net Worth = Total Assets (Liquid Savings + Investments) - Total Debt"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="font-bold text-slate-500 uppercase">1. Liquid & Bank Savings</span>
            <p className="text-xl font-bold text-slate-900 mt-1">
              +{formatINR(summary.totalSavings)}
            </p>
            <p className="text-slate-500 mt-1">Surplus liquid capital across accounts</p>
          </div>

          <div>
            <span className="font-bold text-slate-500 uppercase">2. Invested Portfolio Value</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              +{formatINR(summary.currentPortfolioValue)}
            </p>
            <p className="text-slate-500 mt-1">Mutual funds, Stocks, Gold, PPF & FDs</p>
          </div>

          <div>
            <span className="font-bold text-slate-500 uppercase">3. Total Liabilities / Loans</span>
            <p className="text-xl font-bold text-rose-600 mt-1">
              -{formatINR(summary.totalLiabilities)}
            </p>
            <p className="text-slate-500 mt-1">Home, Auto, Education loans & Cards</p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-[#0b1329] text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
              Consolidated Net Worth
            </span>
            <p className="text-2xl font-extrabold text-white mt-0.5">
              {formatINR(summary.netWorth)}
            </p>
          </div>
          <div className="text-right">
            <Badge variant="emerald" size="md">
              Solvency: Healthy
            </Badge>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}
