'use client';

import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { InvestmentModal } from '@/components/forms/InvestmentModal';
import { InvestmentAllocationChart } from '@/components/charts/InvestmentAllocationChart';
import { useFinance } from '@/lib/context/FinanceContext';
import { InvestmentItem, InvestmentType } from '@/types/financial';
import { formatINR, formatPercentage, formatDateIndian } from '@/lib/calculations/currencyFormatter';

const TYPES: ('All' | InvestmentType)[] = [
  'All',
  'Mutual Funds',
  'Stocks',
  'Fixed Deposits',
  'Gold',
  'Real Estate',
  'PPF',
  'EPF',
  'Other Investments',
];

export default function InvestmentsPage() {
  const { investments, addInvestment, updateInvestment, deleteInvestment, summary } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InvestmentItem | null>(null);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'All' | InvestmentType>('All');

  const filteredInvestments = useMemo(() => {
    return investments.filter((item) => {
      if (selectedType !== 'All' && item.investment_type !== selectedType) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = item.investment_name.toLowerCase().includes(query);
        const matchesType = item.investment_type.toLowerCase().includes(query);
        const matchesDesc = (item.description || '').toLowerCase().includes(query);
        const matchesFolio = (item.folio_or_symbol || '').toLowerCase().includes(query);
        return matchesName || matchesType || matchesDesc || matchesFolio;
      }
      return true;
    });
  }, [investments, selectedType, search]);

  const totalInvested = summary.totalInvested;
  const currentValuation = summary.currentPortfolioValue;
  const totalPnL = summary.portfolioPnL;
  const returnPercentage = summary.portfolioReturnPct;

  const handleEdit = (item: InvestmentItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this investment asset?')) {
      deleteInvestment(id);
    }
  };

  const handleModalSubmit = async (item: Omit<InvestmentItem, 'id' | 'user_id' | 'created_at'>) => {
    if (editingItem) {
      await updateInvestment(editingItem.id, item);
      setEditingItem(null);
    } else {
      await addInvestment(item);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Investment Portfolio Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track multi-asset allocations, compounded growth, and unrealized returns
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingItem(null);
            setModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Investment Asset
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Invested Capital
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatINR(totalInvested)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Principal acquisition cost</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Current Portfolio Value
          </span>
          <p className="text-2xl font-bold text-blue-600 mt-2">{formatINR(currentValuation)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Latest recorded valuation</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Profit / Loss
          </span>
          <p
            className={`text-2xl font-bold mt-2 ${
              totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {totalPnL >= 0 ? '+' : ''}
            {formatINR(totalPnL)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Unrealized portfolio gains</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Absolute Return (ROI)
          </span>
          <p
            className={`text-2xl font-bold mt-2 ${
              returnPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatPercentage(returnPercentage)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Formula: ((Value - Cost) / Cost) × 100
          </span>
        </div>
      </div>

      {/* Asset Allocation Chart Card */}
      <div className="mb-6">
        <Card
          title="Asset Allocation & Diversification"
          subtitle="Portfolio weighting by asset class"
          headerAction={
            <Badge variant="blue" size="sm">
              Live Allocation
            </Badge>
          }
        >
          <InvestmentAllocationChart data={summary.investmentAllocation} />
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search fund name, ticker, or folio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Asset Classes' : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Investments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredInvestments.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No investment assets recorded yet. Add your mutual funds, stocks, or gold to track wealth growth!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Asset Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4 text-right">Invested (₹)</th>
                  <th className="py-3 px-4 text-right">Current Value (₹)</th>
                  <th className="py-3 px-4 text-right">Gain / Loss (₹)</th>
                  <th className="py-3 px-4 text-right">Return (%)</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvestments.map((item) => {
                  const pnl = item.current_value - item.invested_amount;
                  const retPct =
                    item.invested_amount > 0 ? (pnl / item.invested_amount) * 100 : 0;
                  const isPositive = pnl >= 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.investment_name}</div>
                        {item.folio_or_symbol && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.folio_or_symbol}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="blue" size="sm">
                          {item.investment_type}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700 whitespace-nowrap">
                        {formatINR(item.invested_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatINR(item.current_value)}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold whitespace-nowrap ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {formatINR(pnl)}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold whitespace-nowrap ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatPercentage(retPct)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {formatDateIndian(item.investment_date)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Investment"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Investment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-500 shrink-0" />
        <span>
          Note: Valuation calculations are computed based on user-entered current prices and purchase dates. Mutual funds and stock indices are not guaranteed securities.
        </span>
      </div>

      <InvestmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={editingItem}
      />
    </DashboardLayout>
  );
}
