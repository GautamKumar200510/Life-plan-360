'use client';

import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  Download,
  CreditCard,
  PieChart as PieIcon,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ExpenseModal } from '@/components/forms/ExpenseModal';
import { MonthlySpendingDonut } from '@/components/charts/MonthlySpendingDonut';
import { Card } from '@/components/common/Card';
import { useFinance } from '@/lib/context/FinanceContext';
import { ExpenseItem, ExpenseCategory } from '@/types/financial';
import { formatINR, formatDateIndian } from '@/lib/calculations/currencyFormatter';

const CATEGORIES: ('All' | ExpenseCategory)[] = [
  'All',
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

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense, summary } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ExpenseCategory>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'this_year'>('all');

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentYearPrefix = `${now.getFullYear()}`;

    return expenses.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (dateFilter === 'this_month' && !item.date?.startsWith(currentMonthPrefix)) return false;
      if (dateFilter === 'this_year' && !item.date?.startsWith(currentYearPrefix)) return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        const matchesDesc = (item.description || '').toLowerCase().includes(query);
        const matchesMethod = (item.payment_method || '').toLowerCase().includes(query);
        return matchesTitle || matchesCat || matchesDesc || matchesMethod;
      }
      return true;
    });
  }, [expenses, selectedCategory, dateFilter, search]);

  const filteredTotal = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthTotal = expenses
    .filter((e) => e.date?.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const handleEdit = (item: ExpenseItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      deleteExpense(id);
    }
  };

  const handleModalSubmit = async (item: Omit<ExpenseItem, 'id' | 'user_id' | 'created_at'>) => {
    if (editingItem) {
      await updateExpense(editingItem.id, item);
      setEditingItem(null);
    } else {
      await addExpense(item);
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Title', 'Category', 'Amount (INR)', 'Payment Method', 'Recurring', 'Description'];
    const rows = filteredExpenses.map((e) => [
      e.date,
      `"${e.title.replace(/"/g, '""')}"`,
      e.category,
      e.amount,
      `"${(e.payment_method || '').replace(/"/g, '""')}"`,
      e.is_recurring ? 'Yes' : 'No',
      `"${(e.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expenses_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Expense Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor discretionary and non-discretionary spending across all channels
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
            Log Expense
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">This Month's Outflow</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatINR(thisMonthTotal)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Current month total</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Top Spend Category</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2 truncate">
            {summary.topExpenseCategory?.category || 'None'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {summary.topExpenseCategory ? `${formatINR(summary.topExpenseCategory.amount)} (${summary.topExpenseCategory.percentage.toFixed(0)}%)` : '—'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Total Recorded Outflow</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatINR(summary.totalExpenses)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Lifetime tracking</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Filtered View Total</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Filter className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{formatINR(filteredTotal)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {filteredExpenses.length} transactions in view
          </span>
        </div>
      </div>

      {/* Category Spending Donut Chart Card */}
      <div className="mb-6">
        <Card
          title="Category-wise Spending Breakdown"
          subtitle="Proportion of outflow by life category"
          headerAction={
            <Badge variant="slate" size="sm">
              Portfolio Distribution
            </Badge>
          }
        >
          <MonthlySpendingDonut data={summary.categoryBreakdown} />
        </Card>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search merchant, title, or payment mode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

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

      {/* Expenses Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No expense entries match your search or filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Merchant / Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                      {formatDateIndian(item.date)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.title}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="slate" size="sm">
                        {item.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {item.payment_method || 'UPI/Card'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm whitespace-nowrap">
                      -{formatINR(item.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {item.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Expense"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Expense"
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

      <ExpenseModal
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
