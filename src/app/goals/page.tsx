'use client';

import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  Coins,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { GoalModal } from '@/components/forms/GoalModal';
import { useFinance } from '@/lib/context/FinanceContext';
import { SavingsGoalItem } from '@/types/financial';
import { formatINR, formatDateIndian } from '@/lib/calculations/currencyFormatter';
import { calculateGoalMetrics } from '@/lib/calculations/financialCalculations';

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, depositToGoal } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SavingsGoalItem | null>(null);

  // Quick Deposit modal state
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [targetGoalId, setTargetGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + (g.current_saved_amount || 0), 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  const overallCompletion = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const handleEdit = (goal: SavingsGoalItem) => {
    setEditingItem(goal);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      deleteGoal(id);
    }
  };

  const handleModalSubmit = async (item: Omit<SavingsGoalItem, 'id' | 'user_id' | 'created_at'>) => {
    if (editingItem) {
      await updateGoal(editingItem.id, item);
      setEditingItem(null);
    } else {
      await addGoal(item);
    }
  };

  const openDeposit = (goalId: string) => {
    setTargetGoalId(goalId);
    setDepositAmount('');
    setDepositModalOpen(true);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!targetGoalId || isNaN(amount) || amount <= 0) return;

    await depositToGoal(targetGoalId, amount);
    setDepositModalOpen(false);
    setTargetGoalId(null);
    setDepositAmount('');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Savings Goals & Milestones
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build disciplined reserves for life aspirations, downpayments, and security cushions
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
          Create Savings Goal
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Target Corpus
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatINR(totalTarget)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Across {goals.length} life goals</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Accumulated
          </span>
          <p className="text-2xl font-bold text-blue-600 mt-2">{formatINR(totalSaved)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {overallCompletion.toFixed(1)}% milestone achieved
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Remaining Target Gap
          </span>
          <p className="text-2xl font-bold text-amber-600 mt-2">{formatINR(totalRemaining)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Capital yet to be saved</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active Targets
          </span>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {goals.filter((g) => g.status === 'in_progress').length} In Progress
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {goals.filter((g) => g.status === 'completed').length} Goals Completed
          </span>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center my-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Savings Goals Defined Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Create goals like an Emergency Cushion, Flat Downpayment, or Vacation to stay on track.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => setModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Create First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const metrics = calculateGoalMetrics(goal);
            const isCompleted = metrics.percentageCompleted >= 100 || goal.status === 'completed';

            return (
              <div
                key={goal.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <Badge variant="blue" size="sm" className="mb-1.5">
                        {goal.category}
                      </Badge>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {goal.goal_name}
                      </h3>
                    </div>
                    <Badge
                      variant={isCompleted ? 'emerald' : metrics.isOverdue ? 'red' : 'purple'}
                      size="sm"
                    >
                      {isCompleted ? 'Completed' : metrics.isOverdue ? 'Overdue' : 'In Progress'}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                    {goal.description || 'Target savings reserve for milestone execution.'}
                  </p>

                  {/* Progress Gauge */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Progress</span>
                      <span className="font-bold text-blue-600">
                        {metrics.percentageCompleted.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${metrics.percentageCompleted}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1 font-medium">
                      <span>Saved: {formatINR(goal.current_saved_amount)}</span>
                      <span>Target: {formatINR(goal.target_amount)}</span>
                    </div>
                  </div>

                  {/* Metric Chips */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs mb-4">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Monthly SIP Required
                      </span>
                      <span className="font-bold text-slate-900">
                        {isCompleted ? 'Done' : `${formatINR(metrics.monthlySavingsRequired)}/mo`}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Target Date
                      </span>
                      <span className="font-semibold text-slate-700">
                        {formatDateIndian(goal.target_date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs flex-1"
                    onClick={() => openDeposit(goal.id)}
                    icon={<Coins className="w-3.5 h-3.5 text-blue-600" />}
                  >
                    Deposit Funds
                  </Button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Edit / Create Modal */}
      <GoalModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={editingItem}
      />

      {/* Deposit Savings Modal */}
      <Modal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        title="Deposit Savings into Goal"
        subtitle="Add funds to accelerate your goal milestone"
      >
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deposit Amount (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                step="500"
                placeholder="e.g. 15000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setDepositModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={<Coins className="w-4 h-4" />}>
              Add Deposit
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
