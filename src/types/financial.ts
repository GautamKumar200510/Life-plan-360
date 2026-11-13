export type IncomeCategory =
  | 'Salary'
  | 'Freelancing'
  | 'Business'
  | 'Investments'
  | 'Rental Income'
  | 'Other Income';

export type ExpenseCategory =
  | 'Food'
  | 'Transportation'
  | 'Shopping'
  | 'Education'
  | 'Healthcare'
  | 'Housing'
  | 'Entertainment'
  | 'Bills'
  | 'Travel'
  | 'Other';

export type InvestmentType =
  | 'Mutual Funds'
  | 'Stocks'
  | 'Fixed Deposits'
  | 'Gold'
  | 'Real Estate'
  | 'PPF'
  | 'EPF'
  | 'Other Investments';

export type GoalCategory =
  | 'Buy a Car'
  | 'Buy a House'
  | 'Higher Education'
  | 'Emergency Fund'
  | 'Vacation'
  | 'Wedding'
  | 'Retirement'
  | 'Other Personal Goals';

export type LiabilityType =
  | 'Home Loan'
  | 'Car Loan'
  | 'Personal Loan'
  | 'Credit Card'
  | 'Education Loan'
  | 'Other';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  currency: string;
  monthly_budget_target: number;
  current_age: number;
  retirement_age: number;
  created_at?: string;
}

export interface IncomeItem {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  category: IncomeCategory;
  date: string;
  description?: string;
  is_recurring?: boolean;
  created_at?: string;
}

export interface ExpenseItem {
  id: string;
  user_id: string;
  amount: number;
  title: string;
  category: ExpenseCategory;
  date: string;
  description?: string;
  payment_method?: string;
  is_recurring?: boolean;
  created_at?: string;
}

export interface BudgetItem {
  id: string;
  user_id: string;
  month_year: string; // e.g. "2026-11"
  total_budget: number;
  category_budgets: Record<string, number>;
  notes?: string;
  created_at?: string;
}

export interface InvestmentItem {
  id: string;
  user_id: string;
  investment_name: string;
  investment_type: InvestmentType;
  invested_amount: number;
  current_value: number;
  investment_date: string;
  description?: string;
  folio_or_symbol?: string;
  created_at?: string;
}

export interface SavingsGoalItem {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  current_saved_amount: number;
  target_date: string;
  category: GoalCategory;
  description?: string;
  status: 'in_progress' | 'completed' | 'paused';
  created_at?: string;
}

export interface RetirementPlan {
  id?: string;
  user_id: string;
  current_age: number;
  retirement_age: number;
  life_expectancy: number;
  current_monthly_income: number;
  expected_monthly_expenses: number;
  current_retirement_savings: number;
  expected_annual_return: number;
  expected_inflation_rate: number;
  calculated_corpus: number;
  additional_monthly_sip: number;
  assumptions?: Record<string, any>;
  created_at?: string;
}

export interface LiabilityItem {
  id: string;
  user_id: string;
  liability_name: string;
  liability_type: LiabilityType;
  total_amount: number;
  remaining_amount: number;
  interest_rate: number;
  monthly_emi: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export interface FinancialAnalyticsSummary {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  savingsRate: number;
  totalInvested: number;
  currentPortfolioValue: number;
  portfolioPnL: number;
  portfolioReturnPct: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyBudget: number;
  monthlySpending: number;
  remainingBudget: number;
  budgetUtilizationPct: number;
  topExpenseCategory: { category: string; amount: number; percentage: number } | null;
  categoryBreakdown: { category: string; amount: number; percentage: number; color?: string }[];
  monthlyTrends: { month: string; income: number; expenses: number; savings: number }[];
  investmentAllocation: { name: string; value: number; color?: string }[];
}

export interface AiInsightResponse {
  healthScore: number;
  healthGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  summary: string;
  keyHighlights: string[];
  spendingPatterns: string[];
  savingsRecommendations: string[];
  budgetImprovements: string[];
  retirementInsights: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}
