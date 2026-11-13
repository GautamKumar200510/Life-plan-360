'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { formatINR } from '@/lib/calculations/currencyFormatter';

interface RetirementProjectionChartProps {
  data: {
    age: number;
    currentSavingsGrowth: number;
    targetCorpusCurve: number;
    withSipAccumulation: number;
  }[];
}

export function RetirementProjectionChart({ data }: RetirementProjectionChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-80 w-full animate-pulse bg-slate-100 rounded-xl" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-sm text-slate-400">
        Enter retirement parameters to project wealth trajectory.
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="sipGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="age"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            tickFormatter={(age) => `Age ${age}`}
          />
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
              name === 'withSipAccumulation'
                ? 'Portfolio with Recommended SIP'
                : name === 'currentSavingsGrowth'
                ? 'Existing Savings Standalone Growth'
                : 'Target Corpus Benchmark',
            ]}
            labelFormatter={(label) => `At Age ${label}`}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
          />
          <Area
            type="monotone"
            name="Portfolio with SIP"
            dataKey="withSipAccumulation"
            stroke="#2563eb"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#sipGrad)"
          />
          <Area
            type="monotone"
            name="Existing Savings Only"
            dataKey="currentSavingsGrowth"
            stroke="#94a3b8"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#currentGrad)"
          />
          <Line
            type="monotone"
            name="Corpus Target Curve"
            dataKey="targetCorpusCurve"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
