'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { BudgetItem } from '@/types/financial';
import { formatINR } from '@/lib/calculations/currencyFormatter';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (budget: Partial<BudgetItem>) => Promise<void>;
  currentBudget: BudgetItem | null;
}

const DEFAULT_CATEGORIES = [
  'Housing',
  'Food',
  'Bills',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Travel',
  'Other',
];

export function BudgetModal({
  isOpen,
  onClose,
  onSubmit,
  currentBudget,
}: BudgetModalProps) {
  const [totalBudget, setTotalBudget] = useState('65000');
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentBudget) {
      setTotalBudget(currentBudget.total_budget.toString());
      setCategoryBudgets(currentBudget.category_budgets || {});
      setNotes(currentBudget.notes || '');
    } else {
      setTotalBudget('60000');
      setCategoryBudgets({
        Housing: 25000,
        Food: 12000,
        Bills: 5000,
        Transportation: 6000,
        Entertainment: 5000,
      });
      setNotes('');
    }
    setError('');
  }, [currentBudget, isOpen]);

  const handleCategoryChange = (cat: string, value: string) => {
    const num = parseFloat(value) || 0;
    setCategoryBudgets((prev) => ({
      ...prev,
      [cat]: num,
    }));
  };

  const sumCategories = Object.values(categoryBudgets).reduce((sum, v) => sum + (v || 0), 0);
  const numTotalBudget = parseFloat(totalBudget) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalBudget || isNaN(numTotalBudget) || numTotalBudget <= 0) {
      setError('Please set a valid monthly budget limit greater than 0');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await onSubmit({
        total_budget: numTotalBudget,
        category_budgets: categoryBudgets,
        notes: notes.trim(),
        month_year: currentBudget?.month_year || new Date().toISOString().substring(0, 7),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update monthly budget');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Monthly Budget"
      subtitle="Define your spending limits and category allocations"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Total Monthly Budget */}
        <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl">
          <label className="block text-xs font-bold text-blue-900 mb-1">
            Total Monthly Spend Limit (₹ INR) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 font-bold">
              ₹
            </span>
            <input
              type="number"
              step="500"
              placeholder="e.g. 60000"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 text-base font-bold text-slate-900 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
              required
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-blue-700">
            <span>Category allocations total: <strong>{formatINR(sumCategories)}</strong></span>
            {sumCategories > numTotalBudget && (
              <span className="text-amber-700 font-semibold">
                ⚠️ Categories exceed total limit by {formatINR(sumCategories - numTotalBudget)}
              </span>
            )}
          </div>
        </div>

        {/* Category-wise Budgets */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Category Breakdown Targets
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
            {DEFAULT_CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-medium text-slate-700 w-28 truncate">{cat}</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="500"
                    placeholder="0"
                    value={categoryBudgets[cat] || ''}
                    onChange={(e) => handleCategoryChange(cat, e.target.value)}
                    className="w-full pl-6 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Budget Objective / Strategy Notes
          </label>
          <input
            type="text"
            placeholder="e.g. Save 30% towards Europe vacation downpayment this quarter"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Save Budget Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
