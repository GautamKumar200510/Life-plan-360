'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { LiabilityItem, LiabilityType } from '@/types/financial';

interface LiabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<LiabilityItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  initialData?: LiabilityItem | null;
}

const LIABILITY_TYPES: LiabilityType[] = [
  'Home Loan',
  'Car Loan',
  'Personal Loan',
  'Credit Card',
  'Education Loan',
  'Other',
];

export function LiabilityModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: LiabilityModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<LiabilityType>('Home Loan');
  const [totalAmount, setTotalAmount] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [monthlyEmi, setMonthlyEmi] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.liability_name);
      setType(initialData.liability_type);
      setTotalAmount(initialData.total_amount.toString());
      setRemainingAmount(initialData.remaining_amount.toString());
      setInterestRate((initialData.interest_rate || 0).toString());
      setMonthlyEmi((initialData.monthly_emi || 0).toString());
      setStartDate(initialData.start_date || '');
      setEndDate(initialData.end_date || '');
    } else {
      setName('');
      setType('Home Loan');
      setTotalAmount('');
      setRemainingAmount('');
      setInterestRate('8.5');
      setMonthlyEmi('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numTotal = parseFloat(totalAmount);
    const numRemaining = parseFloat(remainingAmount);

    if (!name.trim()) {
      setError('Please provide liability or loan name');
      return;
    }
    if (isNaN(numTotal) || numTotal <= 0) {
      setError('Total liability amount must be greater than 0');
      return;
    }
    if (isNaN(numRemaining) || numRemaining < 0) {
      setError('Remaining debt amount must be valid');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await onSubmit({
        liability_name: name.trim(),
        liability_type: type,
        total_amount: numTotal,
        remaining_amount: numRemaining,
        interest_rate: parseFloat(interestRate) || 0,
        monthly_emi: parseFloat(monthlyEmi) || 0,
        start_date: startDate,
        end_date: endDate,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save liability');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Debt / Liability' : 'Add Liability / Loan'}
      subtitle="Track obligations to maintain accurate Net Worth"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Debt / Loan Name *
            </label>
            <input
              type="text"
              placeholder="e.g. HDFC Home Loan / SBI Auto Loan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LiabilityType)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
            >
              {LIABILITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Loan Sanctioned (₹) *
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 2500000"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Outstanding Balance (₹) *
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 1850000"
              value={remainingAmount}
              onChange={(e) => setRemainingAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Interest Rate (% p.a.)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 8.5"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly EMI (₹ INR)
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 24500"
              value={monthlyEmi}
              onChange={(e) => setMonthlyEmi(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Update Liability' : 'Add Liability'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
