'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { InvestmentItem, InvestmentType } from '@/types/financial';
import { formatINR, formatPercentage } from '@/lib/calculations/currencyFormatter';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<InvestmentItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  initialData?: InvestmentItem | null;
}

const INVESTMENT_TYPES: InvestmentType[] = [
  'Mutual Funds',
  'Stocks',
  'Fixed Deposits',
  'Gold',
  'Real Estate',
  'PPF',
  'EPF',
  'Other Investments',
];

export function InvestmentModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: InvestmentModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('Mutual Funds');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [folioOrSymbol, setFolioOrSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.investment_name);
      setType(initialData.investment_type);
      setInvestedAmount(initialData.invested_amount.toString());
      setCurrentValue(initialData.current_value.toString());
      setDate(initialData.investment_date);
      setFolioOrSymbol(initialData.folio_or_symbol || '');
      setDescription(initialData.description || '');
    } else {
      setName('');
      setType('Mutual Funds');
      setInvestedAmount('');
      setCurrentValue('');
      setDate(new Date().toISOString().split('T')[0]);
      setFolioOrSymbol('');
      setDescription('');
    }
    setError('');
  }, [initialData, isOpen]);

  const numInvested = parseFloat(investedAmount) || 0;
  const numCurrent = parseFloat(currentValue) || 0;
  const pnl = numCurrent - numInvested;
  const returnPct = numInvested > 0 ? (pnl / numInvested) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please specify the asset or fund name');
      return;
    }
    if (isNaN(numInvested) || numInvested <= 0) {
      setError('Please enter a valid invested amount');
      return;
    }
    if (isNaN(numCurrent) || numCurrent < 0) {
      setError('Please enter a valid current valuation');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await onSubmit({
        investment_name: name.trim(),
        investment_type: type,
        invested_amount: numInvested,
        current_value: numCurrent,
        investment_date: date,
        folio_or_symbol: folioOrSymbol.trim(),
        description: description.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save investment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Investment Asset' : 'Add Investment Asset'}
      subtitle="Track your portfolio performance and asset allocation"
      maxWidth="lg"
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
              Asset / Fund Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Parag Parikh Flexi Cap Fund / Nifty 50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Asset Class *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as InvestmentType)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
            >
              {INVESTMENT_TYPES.map((t) => (
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
              Invested Principal (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                step="any"
                placeholder="e.g. 100000"
                value={investedAmount}
                onChange={(e) => setInvestedAmount(e.target.value)}
                className="w-full pl-7 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Valuation (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                step="any"
                placeholder="e.g. 132000"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="w-full pl-7 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Live Return Preview Card */}
        {numInvested > 0 && numCurrent > 0 && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Unrealized Gain/Loss:</span>{' '}
              <strong className={pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {pnl >= 0 ? '+' : ''}
                {formatINR(pnl)}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Absolute Return:</span>{' '}
              <strong className={returnPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {formatPercentage(returnPct)}
              </strong>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Investment Date *
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
              Folio Number / Ticker Symbol (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. INF200K01VA1 / NSE:TCS"
              value={folioOrSymbol}
              onChange={(e) => setFolioOrSymbol(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description / Strategy Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Long-term equity compounder with monthly SIP of ₹10,000"
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
            {initialData ? 'Update Investment' : 'Save Investment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
