'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { ExpenseItem, ExpenseCategory } from '@/types/financial';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<ExpenseItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  initialData?: ExpenseItem | null;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transportation',
  'Shopping',
  'Education',
  'Healthcare',
  'Housing',
  'Entertainment',
  'Bills',
  'Travel',
  'Other',
];

const PAYMENT_METHODS = [
  'UPI (GPay / PhonePe / Paytm)',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
  'Other',
];

export function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI (GPay / PhonePe / Paytm)');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setTitle(initialData.title);
      setCategory(initialData.category);
      setDate(initialData.date);
      setPaymentMethod(initialData.payment_method || 'UPI (GPay / PhonePe / Paytm)');
      setDescription(initialData.description || '');
      setIsRecurring(Boolean(initialData.is_recurring));
    } else {
      setAmount('');
      setTitle('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI (GPay / PhonePe / Paytm)');
      setDescription('');
      setIsRecurring(false);
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid expense amount greater than 0');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title or merchant for this expense');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await onSubmit({
        amount: numAmount,
        title: title.trim(),
        category,
        date,
        payment_method: paymentMethod,
        description: description.trim(),
        is_recurring: isRecurring,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record expense');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Expense Record' : 'Record New Expense'}
      subtitle="Log your expenditures and control outflows"
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
              placeholder="e.g. 4500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Expense Title / Merchant *
          </label>
          <input
            type="text"
            placeholder="e.g. Swiggy Instamart / House Rent / Petrol"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
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
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Transaction Date *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description / Item Details (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Monthly grocery list, bill invoice number, or restaurant name"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isRecurringExp"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
          />
          <label htmlFor="isRecurringExp" className="text-xs text-slate-700 select-none">
            Recurring monthly expense (e.g. rent, electricity, Netflix subscription)
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Update Expense' : 'Record Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
