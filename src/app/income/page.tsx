'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  Download,
  Building,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { IncomeModal } from '@/components/forms/IncomeModal';
import { useFinance } from '@/lib/context/FinanceContext';
import { IncomeItem, IncomeCategory } from '@/types/financial';
import { formatINR, formatDateIndian } from '@/lib/calculations/currencyFormatter';

const CATEGORIES: ('All' | IncomeCategory)[] = [
  'All',
  'Salary',
  'Freelancing',
  'Business',
  'Investments',
  'Rental Income',
  'Other Income',
];

export default function IncomePage() {
  const { incomes, addIncome, updateIncome, deleteIncome } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IncomeItem | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | IncomeCategory>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'this_year'>('all');

  // Filtered Incomes
  const filteredIncomes = useMemo(() => {
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentYearPrefix = `${now.getFullYear()}`;

    return incomes.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

      // Date filter
      if (dateFilter === 'this_month' && !item.date?.startsWith(currentMonthPrefix)) return false;
      if (dateFilter === 'this_year' && !item.date?.startsWith(currentYearPrefix)) return false;

      // Search term
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesSource = item.source.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesDesc = (item.description || '').toLowerCase().includes(query);
        return matchesSource || matchesCategory || matchesDesc;
      }
      return true;
    });
  }, [incomes, selectedCategory, dateFilter, search]);

  // Aggregate Metrics
  const totalAmount = filteredIncomes.reduce((sum, item) => sum + item.amount, 0);

  // Monthly vs Yearly calculations
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentYearStr = `${now.getFullYear()}`;

  const monthlyTotal = incomes
    .filter((i) => i.date?.startsWith(currentMonthStr))
    .reduce((sum, i) => sum + i.amount, 0);

  const yearlyTotal = incomes
    .filter((i) => i.date?.startsWith(currentYearStr))
    .reduce((sum, i) => sum + i.amount, 0);

  const handleEdit = (item: IncomeItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      deleteIncome(id);
    }
  };

  const handleModalSubmit = async (item: Omit<IncomeItem, 'id' | 'user_id' | 'created_at'>) => {
    if (editingItem) {
      await updateIncome(editingItem.id, item);
      setEditingItem(null);
    } else {
      await addIncome(item);
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Source', 'Category', 'Amount (INR)', 'Recurring', 'Description'];
    const rows = filteredIncomes.map((i) => [
      i.date,
      `"${i.source.replace(/"/g, '""')}"`,
      i.category,
      i.amount,
      i.is_recurring ? 'Yes' : 'No',
      `"${(i.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Income_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Income Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track, audit, and categorize all personal and business cash inflows
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            icon={<Download className="w-4 h-4 text-slate-600" />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Income
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">This Month's Inflow</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatINR(monthlyTotal)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Current billing cycle</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Year-to-Date (YTD)</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatINR(yearlyTotal)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Cumulative {now.getFullYear()}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Filtered View Total</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-700 mt-2">{formatINR(totalAmount)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {filteredIncomes.length} records matching criteria
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search source or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'this_month', 'this_year'] as const).map((df) => (
            <button
              key={df}
              onClick={() => setDateFilter(df)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                dateFilter === df
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {df === 'all' ? 'All Time' : df === 'this_month' ? 'This Month' : 'This Year'}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Income Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredIncomes.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No income entries match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Source / Payer</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncomes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                      {formatDateIndian(item.date)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.source}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="blue" size="sm">
                        {item.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600 text-sm whitespace-nowrap">
                      +{formatINR(item.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.is_recurring ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                          Recurring
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          One-off
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {item.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Income"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Income"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <IncomeModal
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
