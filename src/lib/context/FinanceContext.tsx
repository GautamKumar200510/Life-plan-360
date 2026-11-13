'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  IncomeItem,
  ExpenseItem,
  BudgetItem,
  InvestmentItem,
  SavingsGoalItem,
  RetirementPlan,
  LiabilityItem,
  FinancialAnalyticsSummary,
} from '@/types/financial';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { calculateFinancialSummary } from '@/lib/calculations/financialCalculations';
import {
  INITIAL_INCOMES,
  INITIAL_EXPENSES,
  INITIAL_BUDGET,
  INITIAL_INVESTMENTS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_LIABILITIES,
  INITIAL_RETIREMENT_PLAN,
} from '@/lib/mockData';

interface FinanceContextType {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  budget: BudgetItem | null;
  investments: InvestmentItem[];
  goals: SavingsGoalItem[];
  retirementPlan: RetirementPlan | null;
  liabilities: LiabilityItem[];
  summary: FinancialAnalyticsSummary;
  isLoading: boolean;
  addIncome: (item: Omit<IncomeItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateIncome: (id: string, item: Partial<IncomeItem>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addExpense: (item: Omit<ExpenseItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateExpense: (id: string, item: Partial<ExpenseItem>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateBudget: (budget: Partial<BudgetItem>) => Promise<void>;
  addInvestment: (item: Omit<InvestmentItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateInvestment: (id: string, item: Partial<InvestmentItem>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  addGoal: (item: Omit<SavingsGoalItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateGoal: (id: string, item: Partial<SavingsGoalItem>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  depositToGoal: (id: string, amount: number) => Promise<void>;
  saveRetirementPlan: (plan: Partial<RetirementPlan>) => Promise<void>;
  addLiability: (item: Omit<LiabilityItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateLiability: (id: string, item: Partial<LiabilityItem>) => Promise<void>;
  deleteLiability: (id: string) => Promise<void>;
  resetToDemoData: () => void;
  clearData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user, isDemo } = useAuth();
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [budget, setBudget] = useState<BudgetItem | null>(null);
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [goals, setGoals] = useState<SavingsGoalItem[]>([]);
  const [retirementPlan, setRetirementPlan] = useState<RetirementPlan | null>(null);
  const [liabilities, setLiabilities] = useState<LiabilityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = user ? `life_plan_360_data_${user.id}` : 'life_plan_360_data_guest';

  // Load financial state
  useEffect(() => {
    async function loadData() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Check if real Supabase can be queried
      if (isSupabaseConfigured && !isDemo) {
        try {
          const [
            incRes,
            expRes,
            budRes,
            invRes,
            goalsRes,
            retRes,
            liabRes,
          ] = await Promise.all([
            supabase.from('income').select('*').eq('user_id', user.id).order('date', { ascending: false }),
            supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }),
            supabase.from('budgets').select('*').eq('user_id', user.id).limit(1),
            supabase.from('investments').select('*').eq('user_id', user.id).order('current_value', { ascending: false }),
            supabase.from('savings_goals').select('*').eq('user_id', user.id).order('target_date', { ascending: true }),
            supabase.from('retirement_plans').select('*').eq('user_id', user.id).limit(1),
            supabase.from('liabilities').select('*').eq('user_id', user.id).order('remaining_amount', { ascending: false }),
          ]);

          setIncomes((incRes.data as IncomeItem[]) || []);
          setExpenses((expRes.data as ExpenseItem[]) || []);
          setBudget((budRes.data?.[0] as BudgetItem) || null);
          setInvestments((invRes.data as InvestmentItem[]) || []);
          setGoals((goalsRes.data as SavingsGoalItem[]) || []);
          setRetirementPlan((retRes.data?.[0] as RetirementPlan) || null);
          setLiabilities((liabRes.data as LiabilityItem[]) || []);
          setIsLoading(false);
          return;
        } catch (err) {
          console.warn('Failed to load from Supabase, checking local storage', err);
        }
      }

      // Local storage fallback / Demo user
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            const data = JSON.parse(stored);
            setIncomes(data.incomes || []);
            setExpenses(data.expenses || []);
            setBudget(data.budget || null);
            setInvestments(data.investments || []);
            setGoals(data.goals || []);
            setRetirementPlan(data.retirementPlan || null);
            setLiabilities(data.liabilities || []);
            setIsLoading(false);
            return;
          } catch (e) {
            console.error('Error parsing stored finance data', e);
          }
        }

        // If no stored data, initialize with initial portfolio
        setIncomes(INITIAL_INCOMES);
        setExpenses(INITIAL_EXPENSES);
        setBudget(INITIAL_BUDGET);
        setInvestments(INITIAL_INVESTMENTS);
        setGoals(INITIAL_SAVINGS_GOALS);
        setRetirementPlan(INITIAL_RETIREMENT_PLAN);
        setLiabilities(INITIAL_LIABILITIES);

        localStorage.setItem(
          storageKey,
          JSON.stringify({
            incomes: INITIAL_INCOMES,
            expenses: INITIAL_EXPENSES,
            budget: INITIAL_BUDGET,
            investments: INITIAL_INVESTMENTS,
            goals: INITIAL_SAVINGS_GOALS,
            retirementPlan: INITIAL_RETIREMENT_PLAN,
            liabilities: INITIAL_LIABILITIES,
          })
        );
      }

      setIsLoading(false);
    }

    loadData();
  }, [user, isDemo, storageKey]);

  // Sync to local storage
  const persistLocally = (newData: Partial<{
    incomes: IncomeItem[];
    expenses: ExpenseItem[];
    budget: BudgetItem | null;
    investments: InvestmentItem[];
    goals: SavingsGoalItem[];
    retirementPlan: RetirementPlan | null;
    liabilities: LiabilityItem[];
  }>) => {
    if (typeof window === 'undefined') return;
    const current = {
      incomes,
      expenses,
      budget,
      investments,
      goals,
      retirementPlan,
      liabilities,
      ...newData,
    };
    localStorage.setItem(storageKey, JSON.stringify(current));
  };

  // Real-time calculated summary
  const summary = useMemo(() => {
    return calculateFinancialSummary(incomes, expenses, investments, liabilities, budget);
  }, [incomes, expenses, investments, liabilities, budget]);

  // 1. Income CRUD
  const addIncome = async (item: Omit<IncomeItem, 'id' | 'user_id' | 'created_at'>) => {
    const newItem: IncomeItem = {
      ...item,
      id: `inc-${Date.now()}`,
      user_id: user?.id || 'demo-user-360',
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...incomes];
    setIncomes(updated);
    persistLocally({ incomes: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('income').insert({
        user_id: user.id,
        amount: item.amount,
        source: item.source,
        category: item.category,
        date: item.date,
        description: item.description,
        is_recurring: item.is_recurring,
      });
    }
  };

  const updateIncome = async (id: string, updates: Partial<IncomeItem>) => {
    const updated = incomes.map((i) => (i.id === id ? { ...i, ...updates } : i));
    setIncomes(updated);
    persistLocally({ incomes: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('income').update(updates).eq('id', id);
    }
  };

  const deleteIncome = async (id: string) => {
    const updated = incomes.filter((i) => i.id !== id);
    setIncomes(updated);
    persistLocally({ incomes: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('income').delete().eq('id', id);
    }
  };

  // 2. Expense CRUD
  const addExpense = async (item: Omit<ExpenseItem, 'id' | 'user_id' | 'created_at'>) => {
    const newItem: ExpenseItem = {
      ...item,
      id: `exp-${Date.now()}`,
      user_id: user?.id || 'demo-user-360',
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...expenses];
    setExpenses(updated);
    persistLocally({ expenses: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('expenses').insert({
        user_id: user.id,
        amount: item.amount,
        title: item.title,
        category: item.category,
        date: item.date,
        description: item.description,
        payment_method: item.payment_method,
        is_recurring: item.is_recurring,
      });
    }
  };

  const updateExpense = async (id: string, updates: Partial<ExpenseItem>) => {
    const updated = expenses.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setExpenses(updated);
    persistLocally({ expenses: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('expenses').update(updates).eq('id', id);
    }
  };

  const deleteExpense = async (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    persistLocally({ expenses: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('expenses').delete().eq('id', id);
    }
  };

  // 3. Budget
  const updateBudget = async (newBudget: Partial<BudgetItem>) => {
    const updated: BudgetItem = {
      id: budget?.id || `bud-${Date.now()}`,
      user_id: user?.id || 'demo-user-360',
      month_year: newBudget.month_year || budget?.month_year || new Date().toISOString().substring(0, 7),
      total_budget: newBudget.total_budget ?? budget?.total_budget ?? 50000,
      category_budgets: newBudget.category_budgets || budget?.category_budgets || {},
      notes: newBudget.notes ?? budget?.notes,
    };
    setBudget(updated);
    persistLocally({ budget: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('budgets').upsert({
        user_id: user.id,
        month_year: updated.month_year,
        total_budget: updated.total_budget,
        category_budgets: updated.category_budgets,
        notes: updated.notes,
      });
    }
  };

  // 4. Investments
  const addInvestment = async (item: Omit<InvestmentItem, 'id' | 'user_id' | 'created_at'>) => {
    const newItem: InvestmentItem = {
      ...item,
      id: `inv-${Date.now()}`,
      user_id: user?.id || 'demo-user-360',
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...investments];
    setInvestments(updated);
    persistLocally({ investments: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('investments').insert({
        user_id: user.id,
        investment_name: item.investment_name,
        investment_type: item.investment_type,
        invested_amount: item.invested_amount,
        current_value: item.current_value,
        investment_date: item.investment_date,
        description: item.description,
        folio_or_symbol: item.folio_or_symbol,
      });
    }
  };

  const updateInvestment = async (id: string, updates: Partial<InvestmentItem>) => {
    const updated = investments.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv));
    setInvestments(updated);
    persistLocally({ investments: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('investments').update(updates).eq('id', id);
    }
  };

  const deleteInvestment = async (id: string) => {
    const updated = investments.filter((i) => i.id !== id);
    setInvestments(updated);
    persistLocally({ investments: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('investments').delete().eq('id', id);
    }
  };

  // 5. Goals
  const addGoal = async (item: Omit<SavingsGoalItem, 'id' | 'user_id' | 'created_at'>) => {
    const newItem: SavingsGoalItem = {
      ...item,
      id: `goal-${Date.now()}`,
      user_id: user?.id || 'demo-user-360',
      status: item.status || 'in_progress',
      created_at: new Date().toISOString(),
    };
    const updated = [...goals, newItem];
    setGoals(updated);
    persistLocally({ goals: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('savings_goals').insert({
        user_id: user.id,
        goal_name: item.goal_name,
        target_amount: item.target_amount,
        current_saved_amount: item.current_saved_amount,
        target_date: item.target_date,
        category: item.category,
        description: item.description,
        status: item.status,
      });
    }
  };

  const updateGoal = async (id: string, updates: Partial<SavingsGoalItem>) => {
    const updated = goals.map((g) => (g.id === id ? { ...g, ...updates } : g));
    setGoals(updated);
    persistLocally({ goals: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('savings_goals').update(updates).eq('id', id);
    }
  };

  const deleteGoal = async (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    persistLocally({ goals: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('savings_goals').delete().eq('id', id);
    }
  };

  const depositToGoal = async (id: string, amount: number) => {
    const target = goals.find((g) => g.id === id);
    if (!target) return;
    const newAmount = Number(target.current_saved_amount || 0) + Number(amount);
    const newStatus = newAmount >= target.target_amount ? 'completed' : target.status;
    await updateGoal(id, { current_saved_amount: newAmount, status: newStatus });
  };

  // 6. Retirement Plan
  const saveRetirementPlan = async (plan: Partial<RetirementPlan>) => {
    const updated: RetirementPlan = {
      id: retirementPlan?.id || `ret-${Date.now()}`,
      user_id: user?.id || 'demo-user-360',
      current_age: plan.current_age ?? retirementPlan?.current_age ?? 30,
      retirement_age: plan.retirement_age ?? retirementPlan?.retirement_age ?? 60,
      life_expectancy: plan.life_expectancy ?? retirementPlan?.life_expectancy ?? 85,
      current_monthly_income: plan.current_monthly_income ?? retirementPlan?.current_monthly_income ?? 100000,
      expected_monthly_expenses: plan.expected_monthly_expenses ?? retirementPlan?.expected_monthly_expenses ?? 50000,
      current_retirement_savings: plan.current_retirement_savings ?? retirementPlan?.current_retirement_savings ?? 0,
      expected_annual_return: plan.expected_annual_return ?? retirementPlan?.expected_annual_return ?? 12,
      expected_inflation_rate: plan.expected_inflation_rate ?? retirementPlan?.expected_inflation_rate ?? 6,
      calculated_corpus: plan.calculated_corpus ?? retirementPlan?.calculated_corpus ?? 0,
      additional_monthly_sip: plan.additional_monthly_sip ?? retirementPlan?.additional_monthly_sip ?? 0,
      assumptions: plan.assumptions ?? retirementPlan?.assumptions ?? {},
    };
    setRetirementPlan(updated);
    persistLocally({ retirementPlan: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('retirement_plans').upsert({
        user_id: user.id,
        current_age: updated.current_age,
        retirement_age: updated.retirement_age,
        life_expectancy: updated.life_expectancy,
        current_monthly_income: updated.current_monthly_income,
        expected_monthly_expenses: updated.expected_monthly_expenses,
        current_retirement_savings: updated.current_retirement_savings,
        expected_annual_return: updated.expected_annual_return,
        expected_inflation_rate: updated.expected_inflation_rate,
        calculated_corpus: updated.calculated_corpus,
        additional_monthly_sip: updated.additional_monthly_sip,
        assumptions: updated.assumptions,
      });
    }
  };

  // 7. Liabilities
  const addLiability = async (item: Omit<LiabilityItem, 'id' | 'user_id' | 'created_at'>) => {
    const newItem: LiabilityItem = {
      ...item,
      id: `liab-${Date.now()}`,
      user_id: user?.id || 'demo-user-360',
      created_at: new Date().toISOString(),
    };
    const updated = [...liabilities, newItem];
    setLiabilities(updated);
    persistLocally({ liabilities: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('liabilities').insert({
        user_id: user.id,
        liability_name: item.liability_name,
        liability_type: item.liability_type,
        total_amount: item.total_amount,
        remaining_amount: item.remaining_amount,
        interest_rate: item.interest_rate,
        monthly_emi: item.monthly_emi,
        start_date: item.start_date,
        end_date: item.end_date,
      });
    }
  };

  const updateLiability = async (id: string, updates: Partial<LiabilityItem>) => {
    const updated = liabilities.map((l) => (l.id === id ? { ...l, ...updates } : l));
    setLiabilities(updated);
    persistLocally({ liabilities: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('liabilities').update(updates).eq('id', id);
    }
  };

  const deleteLiability = async (id: string) => {
    const updated = liabilities.filter((l) => l.id !== id);
    setLiabilities(updated);
    persistLocally({ liabilities: updated });

    if (isSupabaseConfigured && !isDemo && user) {
      await supabase.from('liabilities').delete().eq('id', id);
    }
  };

  const resetToDemoData = () => {
    setIncomes(INITIAL_INCOMES);
    setExpenses(INITIAL_EXPENSES);
    setBudget(INITIAL_BUDGET);
    setInvestments(INITIAL_INVESTMENTS);
    setGoals(INITIAL_SAVINGS_GOALS);
    setRetirementPlan(INITIAL_RETIREMENT_PLAN);
    setLiabilities(INITIAL_LIABILITIES);

    persistLocally({
      incomes: INITIAL_INCOMES,
      expenses: INITIAL_EXPENSES,
      budget: INITIAL_BUDGET,
      investments: INITIAL_INVESTMENTS,
      goals: INITIAL_SAVINGS_GOALS,
      retirementPlan: INITIAL_RETIREMENT_PLAN,
      liabilities: INITIAL_LIABILITIES,
    });
  };

  const clearData = () => {
    setIncomes([]);
    setExpenses([]);
    setBudget(null);
    setInvestments([]);
    setGoals([]);
    setRetirementPlan(null);
    setLiabilities([]);
    persistLocally({
      incomes: [],
      expenses: [],
      budget: null,
      investments: [],
      goals: [],
      retirementPlan: null,
      liabilities: [],
    });
  };

  return (
    <FinanceContext.Provider
      value={{
        incomes,
        expenses,
        budget,
        investments,
        goals,
        retirementPlan,
        liabilities,
        summary,
        isLoading,
        addIncome,
        updateIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        updateBudget,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        addGoal,
        updateGoal,
        deleteGoal,
        depositToGoal,
        saveRetirementPlan,
        addLiability,
        updateLiability,
        deleteLiability,
        resetToDemoData,
        clearData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
