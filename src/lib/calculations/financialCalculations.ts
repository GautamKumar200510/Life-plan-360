import {
  IncomeItem,
  ExpenseItem,
  InvestmentItem,
  LiabilityItem,
  SavingsGoalItem,
  BudgetItem,
  FinancialAnalyticsSummary,
} from '@/types/financial';

export const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  Food: '#f59e0b',
  Transportation: '#3b82f6',
  Shopping: '#ec4899',
  Education: '#8b5cf6',
  Healthcare: '#ef4444',
  Housing: '#0ea5e9',
  Entertainment: '#a855f7',
  Bills: '#64748b',
  Travel: '#14b8a6',
  Other: '#94a3b8',
};

export const INVESTMENT_TYPE_COLORS: Record<string, string> = {
  'Mutual Funds': '#3b82f6',
  Stocks: '#10b981',
  'Fixed Deposits': '#f59e0b',
  Gold: '#eab308',
  'Real Estate': '#8b5cf6',
  PPF: '#06b6d4',
  EPF: '#6366f1',
  'Other Investments': '#64748b',
};

/**
 * Calculates comprehensive financial metrics across user data
 */
export function calculateFinancialSummary(
  incomes: IncomeItem[],
  expenses: ExpenseItem[],
  investments: InvestmentItem[],
  liabilities: LiabilityItem[],
  budget: BudgetItem | null
): FinancialAnalyticsSummary {
  // 1. Incomes & Expenses totals
  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalSavings = Math.max(0, totalIncome - totalExpenses);
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  // 2. Investments totals
  const totalInvested = investments.reduce((sum, item) => sum + Number(item.invested_amount || 0), 0);
  const currentPortfolioValue = investments.reduce((sum, item) => sum + Number(item.current_value || 0), 0);
  const portfolioPnL = currentPortfolioValue - totalInvested;
  const portfolioReturnPct = totalInvested > 0 ? (portfolioPnL / totalInvested) * 100 : 0;

  // 3. Liabilities total
  const totalLiabilities = liabilities.reduce((sum, item) => sum + Number(item.remaining_amount || 0), 0);

  // 4. Net Worth = Total Assets (Liquid Savings + Investments) - Total Liabilities
  const netWorth = totalSavings + currentPortfolioValue - totalLiabilities;

  // 5. Budget analytics
  const monthlyBudget = budget?.total_budget || 0;
  // Calculate current month's expenses
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlySpending = expenses
    .filter((e) => e.date?.startsWith(currentMonthPrefix))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const remainingBudget = Math.max(0, monthlyBudget - monthlySpending);
  const budgetUtilizationPct = monthlyBudget > 0 ? (monthlySpending / monthlyBudget) * 100 : 0;

  // 6. Category breakdown of expenses
  const categoryMap: Record<string, number> = {};
  expenses.forEach((item) => {
    categoryMap[item.category] = (categoryMap[item.category] || 0) + Number(item.amount || 0);
  });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0,
      color: EXPENSE_CATEGORY_COLORS[cat] || '#64748b',
    }))
    .sort((a, b) => b.amount - a.amount);

  const topExpenseCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

  // 7. Investment Allocation Breakdown
  const investTypeMap: Record<string, number> = {};
  investments.forEach((item) => {
    investTypeMap[item.investment_type] = (investTypeMap[item.investment_type] || 0) + Number(item.current_value || 0);
  });

  const investmentAllocation = Object.entries(investTypeMap).map(([type, val]) => ({
    name: type,
    value: val,
    color: INVESTMENT_TYPE_COLORS[type] || '#3b82f6',
  }));

  // 8. Monthly Trends (last 6 months)
  const monthlyTrends = generateMonthlyTrends(incomes, expenses);

  return {
    totalIncome,
    totalExpenses,
    totalSavings,
    savingsRate,
    totalInvested,
    currentPortfolioValue,
    portfolioPnL,
    portfolioReturnPct,
    totalLiabilities,
    netWorth,
    monthlyBudget,
    monthlySpending,
    remainingBudget,
    budgetUtilizationPct,
    topExpenseCategory,
    categoryBreakdown,
    monthlyTrends,
    investmentAllocation,
  };
}

function generateMonthlyTrends(
  incomes: IncomeItem[],
  expenses: ExpenseItem[]
): { month: string; income: number; expenses: number; savings: number }[] {
  const months: Record<string, { income: number; expenses: number }> = {};

  // Build key for the past 6 calendar months
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { income: 0, expenses: 0 };
  }

  incomes.forEach((inc) => {
    if (inc.date) {
      const key = inc.date.substring(0, 7);
      if (months[key]) {
        months[key].income += Number(inc.amount || 0);
      }
    }
  });

  expenses.forEach((exp) => {
    if (exp.date) {
      const key = exp.date.substring(0, 7);
      if (months[key]) {
        months[key].expenses += Number(exp.amount || 0);
      }
    }
  });

  return Object.entries(months).map(([key, vals]) => {
    const [y, m] = key.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, 1);
    const monthLabel = dateObj.toLocaleString('en-US', { month: 'short' });
    const savings = Math.max(0, vals.income - vals.expenses);
    return {
      month: monthLabel,
      income: vals.income,
      expenses: vals.expenses,
      savings,
    };
  });
}

/**
 * Retirement calculation model
 */
export interface RetirementCalcInput {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy?: number;
  currentMonthlyIncome: number;
  expectedMonthlyExpenses: number; // in today's money
  currentRetirementSavings: number;
  expectedAnnualReturn: number; // e.g. 12%
  expectedInflationRate: number; // e.g. 6%
}

export interface RetirementCalcResult {
  yearsToRetire: number;
  retirementDurationYears: number;
  futureMonthlyExpensesAtRetirement: number;
  futureAnnualExpensesAtRetirement: number;
  requiredRetirementCorpus: number;
  futureValueOfCurrentSavings: number;
  additionalCorpusRequired: number;
  additionalMonthlySipRequired: number;
  yearlyProjection: {
    age: number;
    currentSavingsGrowth: number;
    targetCorpusCurve: number;
    withSipAccumulation: number;
  }[];
}

export function calculateRetirementPlan(input: RetirementCalcInput): RetirementCalcResult {
  const currentAge = Math.max(18, input.currentAge || 30);
  const retirementAge = Math.max(currentAge + 1, input.retirementAge || 60);
  const lifeExpectancy = Math.max(retirementAge + 5, input.lifeExpectancy || 85);
  const yearsToRetire = retirementAge - currentAge;
  const retirementDurationYears = lifeExpectancy - retirementAge;

  const inflation = (input.expectedInflationRate || 6) / 100;
  const annualReturnPre = (input.expectedAnnualReturn || 12) / 100;
  // Post-retirement return usually slightly conservative, e.g. 8-9% or pre-return minus 3%
  const annualReturnPost = Math.max(0.06, annualReturnPre - 0.03);

  // 1. Future monthly expense at retirement age
  const futureMonthlyExpensesAtRetirement =
    input.expectedMonthlyExpenses * Math.pow(1 + inflation, yearsToRetire);
  const futureAnnualExpensesAtRetirement = futureMonthlyExpensesAtRetirement * 12;

  // 2. Real rate of return in retirement
  // real_r = (1 + r) / (1 + i) - 1
  const realRatePost = (1 + annualReturnPost) / (1 + inflation) - 1;

  // 3. Retirement Corpus Required (present value of annuity in retirement)
  let requiredRetirementCorpus = 0;
  if (Math.abs(realRatePost) < 0.0001) {
    requiredRetirementCorpus = futureAnnualExpensesAtRetirement * retirementDurationYears;
  } else {
    // PV of annuity = A * [1 - (1+r)^(-m)] / r
    requiredRetirementCorpus =
      futureAnnualExpensesAtRetirement *
      ((1 - Math.pow(1 + realRatePost, -retirementDurationYears)) / realRatePost);
  }

  // 4. Future value of current savings at retirement
  const futureValueOfCurrentSavings =
    (input.currentRetirementSavings || 0) * Math.pow(1 + annualReturnPre, yearsToRetire);

  // 5. Shortfall
  const additionalCorpusRequired = Math.max(
    0,
    requiredRetirementCorpus - futureValueOfCurrentSavings
  );

  // 6. Monthly SIP required to bridge the shortfall
  // FV_sip = SIP * [ ( (1 + r_m)^N - 1 ) / r_m ] * (1 + r_m)
  const monthlyRatePre = annualReturnPre / 12;
  const totalMonths = yearsToRetire * 12;

  let additionalMonthlySipRequired = 0;
  if (additionalCorpusRequired > 0 && totalMonths > 0) {
    const compoundingFactor =
      ((Math.pow(1 + monthlyRatePre, totalMonths) - 1) / monthlyRatePre) * (1 + monthlyRatePre);
    additionalMonthlySipRequired = Math.round(additionalCorpusRequired / compoundingFactor);
  }

  // 7. Yearly growth projection
  const yearlyProjection = [];
  for (let y = 0; y <= yearsToRetire; y++) {
    const age = currentAge + y;
    const currentGrowth =
      (input.currentRetirementSavings || 0) * Math.pow(1 + annualReturnPre, y);

    const sipAccumulation =
      y === 0
        ? 0
        : additionalMonthlySipRequired *
          ((Math.pow(1 + monthlyRatePre, y * 12) - 1) / monthlyRatePre) *
          (1 + monthlyRatePre);

    const targetInterpolated = (requiredRetirementCorpus * y) / Math.max(1, yearsToRetire);

    yearlyProjection.push({
      age,
      currentSavingsGrowth: Math.round(currentGrowth),
      targetCorpusCurve: Math.round(targetInterpolated),
      withSipAccumulation: Math.round(currentGrowth + sipAccumulation),
    });
  }

  return {
    yearsToRetire,
    retirementDurationYears,
    futureMonthlyExpensesAtRetirement: Math.round(futureMonthlyExpensesAtRetirement),
    futureAnnualExpensesAtRetirement: Math.round(futureAnnualExpensesAtRetirement),
    requiredRetirementCorpus: Math.round(requiredRetirementCorpus),
    futureValueOfCurrentSavings: Math.round(futureValueOfCurrentSavings),
    additionalCorpusRequired: Math.round(additionalCorpusRequired),
    additionalMonthlySipRequired,
    yearlyProjection,
  };
}

/**
 * Goal calculation helper
 */
export function calculateGoalMetrics(goal: SavingsGoalItem): {
  remainingAmount: number;
  percentageCompleted: number;
  monthsRemaining: number;
  monthlySavingsRequired: number;
  isOverdue: boolean;
} {
  const remainingAmount = Math.max(0, goal.target_amount - (goal.current_saved_amount || 0));
  const percentageCompleted = Math.min(
    100,
    goal.target_amount > 0 ? (goal.current_saved_amount / goal.target_amount) * 100 : 0
  );

  const today = new Date();
  const targetDate = new Date(goal.target_date);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const monthsRemaining = Math.max(1, Math.round(diffDays / 30.44));
  const isOverdue = diffDays < 0 && remainingAmount > 0;

  const monthlySavingsRequired = isOverdue
    ? remainingAmount
    : Math.round(remainingAmount / monthsRemaining);

  return {
    remainingAmount,
    percentageCompleted,
    monthsRemaining,
    monthlySavingsRequired,
    isOverdue,
  };
}
