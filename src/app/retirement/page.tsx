'use client';

import React, { useState, useMemo } from 'react';
import {
  Hourglass,
  TrendingUp,
  Sparkles,
  Info,
  ShieldCheck,
  Save,
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { RetirementProjectionChart } from '@/components/charts/RetirementProjectionChart';
import { useFinance } from '@/lib/context/FinanceContext';
import { useAuth } from '@/lib/context/AuthContext';
import {
  calculateRetirementPlan,
  RetirementCalcInput,
} from '@/lib/calculations/financialCalculations';
import { formatINR } from '@/lib/calculations/currencyFormatter';

export default function RetirementPage() {
  const { retirementPlan, saveRetirementPlan, summary } = useFinance();
  const { profile } = useAuth();

  // Form inputs state
  const [currentAge, setCurrentAge] = useState<number>(retirementPlan?.current_age || profile?.current_age || 32);
  const [retirementAge, setRetirementAge] = useState<number>(retirementPlan?.retirement_age || profile?.retirement_age || 58);
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(retirementPlan?.life_expectancy || 85);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(
    retirementPlan?.current_monthly_income || summary.totalIncome || 150000
  );
  const [expectedExpenses, setExpectedExpenses] = useState<number>(
    retirementPlan?.expected_monthly_expenses || 65000
  );
  const [currentSavings, setCurrentSavings] = useState<number>(
    retirementPlan?.current_retirement_savings || summary.currentPortfolioValue || 850000
  );
  const [expectedReturn, setExpectedReturn] = useState<number>(
    retirementPlan?.expected_annual_return || 12.0
  );
  const [expectedInflation, setExpectedInflation] = useState<number>(
    retirementPlan?.expected_inflation_rate || 6.0
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Real-time calculation
  const calcResult = useMemo(() => {
    return calculateRetirementPlan({
      currentAge,
      retirementAge,
      lifeExpectancy,
      currentMonthlyIncome: monthlyIncome,
      expectedMonthlyExpenses: expectedExpenses,
      currentRetirementSavings: currentSavings,
      expectedAnnualReturn: expectedReturn,
      expectedInflationRate: expectedInflation,
    });
  }, [
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlyIncome,
    expectedExpenses,
    currentSavings,
    expectedReturn,
    expectedInflation,
  ]);

  const handleSavePlan = async () => {
    setIsSaving(true);
    await saveRetirementPlan({
      current_age: currentAge,
      retirement_age: retirementAge,
      life_expectancy: lifeExpectancy,
      current_monthly_income: monthlyIncome,
      expected_monthly_expenses: expectedExpenses,
      current_retirement_savings: currentSavings,
      expected_annual_return: expectedReturn,
      expected_inflation_rate: expectedInflation,
      calculated_corpus: calcResult.requiredRetirementCorpus,
      additional_monthly_sip: calcResult.additionalMonthlySipRequired,
      assumptions: {
        realRatePostRetirement: ((1 + (expectedReturn - 3) / 100) / (1 + expectedInflation / 100) - 1) * 100,
        yearsInRetirement: lifeExpectancy - retirementAge,
      },
    });
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inflation-Adjusted Retirement Planning
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Actuarial corpus projection, step-up SIP calculation, and wealth survival models
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSavePlan}
          isLoading={isSaving}
          icon={<Save className="w-4 h-4" />}
        >
          {savedSuccess ? 'Retirement Plan Saved!' : 'Save Plan to Profile'}
        </Button>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-[#0b1329] text-white border border-slate-800 shadow-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Target Retirement Corpus
          </span>
          <p className="text-2xl font-bold mt-2">
            {formatINR(calcResult.requiredRetirementCorpus, { compact: true })}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {formatINR(calcResult.requiredRetirementCorpus)} required at age {retirementAge}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Recommended Monthly SIP
          </span>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {formatINR(calcResult.additionalMonthlySipRequired)}/mo
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Over {calcResult.yearsToRetire} years at {expectedReturn}% CAGR
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Future Monthly Expense
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatINR(calcResult.futureMonthlyExpensesAtRetirement)}/mo
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Adjusted for {expectedInflation}% inflation
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Savings Growth at Retirement
          </span>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {formatINR(calcResult.futureValueOfCurrentSavings, { compact: true })}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Future Value of current {formatINR(currentSavings, { compact: true })}
          </span>
        </div>
      </div>

      {/* Main Interactive Calculator & Projection Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Inputs Control Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Actuarial Inputs</h3>
            <span className="text-[11px] text-blue-600 font-semibold">Interactive</span>
          </div>

          {/* Age Sliders */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Current Age: <strong>{currentAge} Years</strong></span>
                <span className="text-slate-400">18 - 60</span>
              </div>
              <input
                type="range"
                min="18"
                max="60"
                value={currentAge}
                onChange={(e) => setCurrentAge(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Target Retirement Age: <strong>{retirementAge} Years</strong></span>
                <span className="text-slate-400">{currentAge + 1} - 75</span>
              </div>
              <input
                type="range"
                min={currentAge + 1}
                max="75"
                value={retirementAge}
                onChange={(e) => setRetirementAge(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Life Expectancy: <strong>{lifeExpectancy} Years</strong></span>
                <span className="text-slate-400">{retirementAge + 5} - 100</span>
              </div>
              <input
                type="range"
                min={retirementAge + 5}
                max="100"
                value={lifeExpectancy}
                onChange={(e) => setLifeExpectancy(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Monthly Living Expense (Today's Money)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="2000"
                  value={expectedExpenses}
                  onChange={(e) => setExpectedExpenses(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Dedicated Retirement Savings (PPF, EPF, MF)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="10000"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Return (% p.a.)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Inflation (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={expectedInflation}
                  onChange={(e) => setExpectedInflation(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Projection Chart */}
        <div className="lg:col-span-2">
          <Card
            title="Retirement Corpus Accumulation Trajectory"
            subtitle={`Years to Retirement: ${calcResult.yearsToRetire} | Post-Retirement Duration: ${calcResult.retirementDurationYears} Years`}
            headerAction={
              <Badge variant="blue" size="sm">
                Compounded Growth
              </Badge>
            }
          >
            <RetirementProjectionChart data={calcResult.yearlyProjection} />
          </Card>
        </div>
      </div>

      {/* Assumptions & Mathematical Formulas Explanations */}
      <Card title="Retirement Modeling Assumptions & Financial Formulas">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Inflation & Expense Adjustment
            </h4>
            <p>
              Your current living costs of <strong>{formatINR(expectedExpenses)}/month</strong> will inflate to{' '}
              <strong>{formatINR(calcResult.futureMonthlyExpensesAtRetirement)}/month</strong> over{' '}
              {calcResult.yearsToRetire} years at an annual inflation rate of {expectedInflation}%.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl font-mono text-[11px] text-slate-800">
              Future Expense = Today Expense × (1 + Inflation)^Years
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Capital Preservation & Corpus Annuitization
            </h4>
            <p>
              The target corpus of <strong>{formatINR(calcResult.requiredRetirementCorpus, { compact: true })}</strong> is structured to sustain an inflation-adjusted monthly pension for {calcResult.retirementDurationYears} years until age {lifeExpectancy}.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl font-mono text-[11px] text-slate-800">
              Corpus Required = Future Annual Expense × [(1 - (1+r)^(-n)) / r]
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Disclaimer: All projections are mathematical estimates based on user assumptions. Actual market performance, inflation spikes, and tax rates may vary. Not a guaranteed return.
          </span>
        </div>
      </Card>
    </DashboardLayout>
  );
}
