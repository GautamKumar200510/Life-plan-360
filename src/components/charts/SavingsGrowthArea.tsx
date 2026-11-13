'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatINR } from '@/lib/calculations/currencyFormatter';

interface SavingsGrowthAreaProps {
  data: { month: string; savings: number }[];
}

export function SavingsGrowthArea({ data }: SavingsGrowthAreaProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-72 w-full animate-pulse bg-slate-100 rounded-xl" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-sm text-slate-400">
        No savings data available yet.
      </div>
    );
  }

  // Calculate cumulative savings trajectory
  let runningSavings = 0;
  const cumulativeData = data.map((d) => {
    runningSavings += d.savings;
    return {
      month: d.month,
      monthlySavings: d.savings,
      cumulativeSavings: runningSavings,
    };
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => formatINR(val, { compact: true, hideSymbol: true })}
          />
          <Tooltip
            formatter={(val: any, name: string) => [
              formatINR(Number(val)),
              name === 'cumulativeSavings' ? 'Cumulative Surplus' : 'Monthly Savings',
            ]}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulativeSavings"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#savingsGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
