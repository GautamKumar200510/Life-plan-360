'use client';

import React from 'react';
import {
  TrendingUp,
  Receipt,
  PiggyBank,
  Wallet,
  ShieldCheck,
  PieChart,
} from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatINR } from '@/lib/calculations/currencyFormatter';

export function MetricsGrid() {
  const { summary } = useFinance();

  const savingsRate = summary.savingsRate;
  const budgetUtilization = summary.budgetUtilizationPct;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. Total Income */}
      <StatCard
        title="Total Income"
        value={formatINR(summary.totalIncome)}
        subtitle="All recorded inflows"
        icon={TrendingUp}
        colorScheme="emerald"
        trend={{
          value: '+Active',
          isPositive: true,
          label: 'Inflows',
        }}
      />

      {/* 2. Total Expenses */}
      <StatCard
        title="Total Expenses"
        value={formatINR(summary.totalExpenses)}
        subtitle="All recorded outflows"
        icon={Receipt}
        colorScheme="rose"
        trend={{
          value: `${((summary.totalExpenses / (summary.totalIncome || 1)) * 100).toFixed(0)}%`,
          isPositive: summary.totalExpenses <= summary.totalIncome,
          label: 'of income',
        }}
      />

      {/* 3. Total Savings */}
      <StatCard
        title="Total Savings"
        value={formatINR(summary.totalSavings)}
        subtitle={`Savings rate: ${savingsRate.toFixed(1)}%`}
        icon={PiggyBank}
        colorScheme="blue"
        trend={{
          value: `${savingsRate.toFixed(1)}%`,
          isPositive: savingsRate >= 20,
          label: savingsRate >= 20 ? 'Optimal' : 'Needs boost',
        }}
      />

      {/* 4. Total Investments */}
      <StatCard
        title="Investments"
        value={formatINR(summary.currentPortfolioValue)}
        subtitle={`Invested: ${formatINR(summary.totalInvested, { compact: true })}`}
        icon={Wallet}
        colorScheme="purple"
        trend={{
          value: `${summary.portfolioReturnPct >= 0 ? '+' : ''}${summary.portfolioReturnPct.toFixed(1)}%`,
          isPositive: summary.portfolioReturnPct >= 0,
          label: 'Overall return',
        }}
      />

      {/* 5. Net Worth */}
      <StatCard
        title="Net Worth"
        value={formatINR(summary.netWorth)}
        subtitle={`Debt: ${formatINR(summary.totalLiabilities, { compact: true })}`}
        icon={ShieldCheck}
        colorScheme="slate"
        badge="Assets - Debt"
      />

      {/* 6. Monthly Budget */}
      <StatCard
        title="Monthly Budget"
        value={formatINR(summary.monthlyBudget)}
        subtitle={`Spent: ${formatINR(summary.monthlySpending, { compact: true })}`}
        icon={PieChart}
        colorScheme={budgetUtilization > 100 ? 'rose' : budgetUtilization > 85 ? 'amber' : 'emerald'}
        trend={{
          value: `${budgetUtilization.toFixed(0)}%`,
          isPositive: budgetUtilization <= 100,
          label: 'Utilized',
        }}
      />
    </div>
  );
}
