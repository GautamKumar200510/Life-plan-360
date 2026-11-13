'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { SavingsGoalItem, GoalCategory } from '@/types/financial';
import { formatINR } from '@/lib/calculations/currencyFormatter';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<SavingsGoalItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  initialData?: SavingsGoalItem | null;
}

const GOAL_CATEGORIES: GoalCategory[] = [
  'Buy a Car',
  'Buy a House',
  'Higher Education',
  'Emergency Fund',
  'Vacation',
  'Wedding',
  'Retirement',
  'Other Personal Goals',
];

export function GoalModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: GoalModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Emergency Fund');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'in_progress' | 'completed' | 'paused'>('in_progress');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.goal_name);
      setTargetAmount(initialData.target_amount.toString());
      setSavedAmount((initialData.current_saved_amount || 0).toString());
      setTargetDate(initialData.target_date);
      setCategory(initialData.category);
      setDescription(initialData.description || '');
      setStatus(initialData.status);
    } else {
      setName('');
      setTargetAmount('');
      setSavedAmount('0');
      // Default target date: 1 year from now
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setTargetDate(nextYear.toISOString().split('T')[0]);
      setCategory('Emergency Fund');
      setDescription('');
      setStatus('in_progress');
    }
    setError('');
  }, [initialData, isOpen]);

  const numTarget = parseFloat(targetAmount) || 0;
  const numSaved = parseFloat(savedAmount) || 0;
  const remaining = Math.max(0, numTarget - numSaved);
  const completionPct = numTarget > 0 ? Math.min(100, (numSaved / numTarget) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a goal name');
      return;
    }
    if (isNaN(numTarget) || numTarget <= 0) {
      setError('Target goal amount must be greater than 0');
      return;
    }
    if (!targetDate) {
      setError('Target completion date is required');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await onSubmit({
        goal_name: name.trim(),
        target_amount: numTarget,
        current_saved_amount: numSaved,
        target_date: targetDate,
        category,
        description: description.trim(),
        status,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save savings goal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Savings Goal' : 'Create New Financial Goal'}
      subtitle="Establish concrete targets for major life milestones"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Goal Name *
          </label>
          <input
            type="text"
            placeholder="e.g. 6-Month Emergency Fund / Europe Trip / Flat Downpayment"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
              onChange={(e) => setCategory(e.target.value as GoalCategory)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
            >
              {GOAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Deadline *
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Amount (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                step="any"
                placeholder="e.g. 500000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full pl-7 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Saved Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                step="any"
                placeholder="e.g. 150000"
                value={savedAmount}
                onChange={(e) => setSavedAmount(e.target.value)}
                className="w-full pl-7 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Progress Preview */}
        {numTarget > 0 && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Completion:</span>
              <span className="font-bold text-blue-600">{completionPct.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
              <span>Saved: {formatINR(numSaved)}</span>
              <span>Remaining: {formatINR(remaining)}</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description / Strategy
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Park funds in liquid mutual funds and recurring deposit"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Update Goal' : 'Save Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
