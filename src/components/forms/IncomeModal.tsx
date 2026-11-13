'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { IncomeItem, IncomeCategory } from '@/types/financial';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<IncomeItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  initialData?: IncomeItem | null;
}

const CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Freelancing',
  'Business',
  'Investments',
  'Rental Income',
  'Other Income',
];

export function IncomeModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: IncomeModalProps) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState<IncomeCategory>('Salary');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setSource(initialData.source);
      setCategory(initialData.category);
      setDate(initialData.date);
      setDescription(initialData.description || '');
      setIsRecurring(Boolean(initialData.is_recurring));
    } else {
      setAmount('');
      setSource('');
      setCategory('Salary');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setIsRecurring(false);
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid income amount greater than 0');
      return;
    }
    if (!source.trim()) {
      setError('Please specify the income source (e.g., Company, Client, Property)');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await onSubmit({
        amount: numAmount,
        source: source.trim(),
        category,
        date,
        description: description.trim(),
        is_recurring: isRecurring,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save income record');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Income Record' : 'Record New Income'}
      subtitle="Track inflows to your wealth ecosystem"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Amount (₹ INR) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
              ₹
            </span>
            <input
              type="number"
              step="any"
              placeholder="e.g. 125000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Source / Payer *
          </label>
          <input
            type="text"
            placeholder="e.g. Google India Pvt Ltd / Consulting Client"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IncomeCategory)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date Received *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description / Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Add relevant notes, invoice reference, or payment remarks..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isRecurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
          />
          <label htmlFor="isRecurring" className="text-xs text-slate-700 select-none">
            Recurring monthly income (e.g. monthly paycheck or steady rent)
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Update Income' : 'Save Income'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
