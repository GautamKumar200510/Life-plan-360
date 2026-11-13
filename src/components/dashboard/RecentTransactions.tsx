'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, ChevronRight, Calendar } from 'lucide-react';
import { useFinance } from '@/lib/context/FinanceContext';
import { formatINR, formatDateIndian } from '@/lib/calculations/currencyFormatter';
import { Badge } from '@/components/common/Badge';

export function RecentTransactions() {
  const { incomes, expenses } = useFinance();

  // Combine and sort recent transactions
  const combined = [
    ...incomes.map((inc) => ({
      id: inc.id,
      title: inc.source,
      category: inc.category,
      amount: inc.amount,
      date: inc.date,
      type: 'income' as const,
      description: inc.description,
    })),
    ...expenses.map((exp) => ({
      id: exp.id,
      title: exp.title,
      category: exp.category,
      amount: exp.amount,
      date: exp.date,
      type: 'expense' as const,
      description: exp.payment_method || exp.description,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recent = combined.slice(0, 6);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Transactions</h3>
          <p className="text-xs text-slate-500 mt-0.5">Live audit of money in & money out</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/expenses"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 hover:underline"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {recent.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No transactions logged yet. Add your first income or expense to populate!
        </div>
      ) : (
        <div className="divide-y divide-slate-100/80 mt-1">
          {recent.map((tx) => (
            <div
              key={`${tx.type}-${tx.id}`}
              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === 'income'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 truncate">{tx.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateIndian(tx.date)}
                    </span>
                    {tx.description && (
                      <span className="truncate max-w-[120px] sm:max-w-[200px]">
                        • {tx.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p
                  className={`text-xs font-bold ${
                    tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatINR(tx.amount)}
                </p>
                <div className="mt-0.5 flex justify-end">
                  <Badge
                    size="sm"
                    variant={tx.type === 'income' ? 'emerald' : 'slate'}
                    className="text-[10px]"
                  >
                    {tx.category}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
