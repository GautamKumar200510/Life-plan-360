'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { formatINR } from '@/lib/calculations/currencyFormatter';

interface MonthlySpendingDonutProps {
  data: { category: string; amount: number; percentage: number; color?: string }[];
}

export function MonthlySpendingDonut({ data }: MonthlySpendingDonutProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-72 w-full animate-pulse bg-slate-100 rounded-xl" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-sm text-slate-400">
        No spending categories recorded yet.
      </div>
    );
  }

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-72">
      <div className="h-full w-full sm:w-1/2 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: any, name: any) => [
                `${formatINR(Number(value))} (${((Number(value) / totalAmount) * 100).toFixed(1)}%)`,
                name,
              ]}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} strokeWidth={1} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center Total Metric */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total</span>
          <span className="text-sm font-bold text-slate-800">
            {formatINR(totalAmount, { compact: true })}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="w-full sm:w-1/2 max-h-60 overflow-y-auto space-y-2 pr-2 text-xs">
        {data.map((item) => (
          <div key={item.category} className="flex items-center justify-between py-1 border-b border-slate-100/60">
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color || '#3b82f6' }}
              />
              <span className="text-slate-700 font-medium truncate">{item.category}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-semibold text-slate-900">{formatINR(item.amount)}</span>
              <span className="text-slate-400 text-[11px]">({item.percentage.toFixed(0)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
