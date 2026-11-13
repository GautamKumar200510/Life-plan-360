-- ==============================================================================
-- LIFE PLAN 360° - DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- PostgreSQL / Supabase
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    currency TEXT DEFAULT 'INR',
    monthly_budget_target NUMERIC(14, 2) DEFAULT 50000.00,
    current_age INTEGER DEFAULT 30,
    retirement_age INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. INCOME TABLE
CREATE TABLE IF NOT EXISTS public.income (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    source TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Salary', 'Freelancing', 'Business', 'Investments', 'Rental Income', 'Other Income')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Food', 'Transportation', 'Shopping', 'Education', 'Healthcare', 'Housing', 'Entertainment', 'Bills', 'Travel', 'Other')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    payment_method TEXT DEFAULT 'UPI/Bank Transfer',
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. BUDGETS TABLE
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month_year TEXT NOT NULL, -- e.g. '2026-11'
    total_budget NUMERIC(14, 2) NOT NULL CHECK (total_budget >= 0),
    category_budgets JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"Food": 10000, "Housing": 15000}
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_month UNIQUE(user_id, month_year)
);

-- 5. INVESTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    investment_name TEXT NOT NULL,
    investment_type TEXT NOT NULL CHECK (investment_type IN ('Mutual Funds', 'Stocks', 'Fixed Deposits', 'Gold', 'Real Estate', 'PPF', 'EPF', 'Other Investments')),
    invested_amount NUMERIC(14, 2) NOT NULL CHECK (invested_amount >= 0),
    current_value NUMERIC(14, 2) NOT NULL CHECK (current_value >= 0),
    investment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    folio_or_symbol TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. SAVINGS GOALS TABLE
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_name TEXT NOT NULL,
    target_amount NUMERIC(14, 2) NOT NULL CHECK (target_amount > 0),
    current_saved_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (current_saved_amount >= 0),
    target_date DATE NOT NULL,
    category TEXT DEFAULT 'Emergency Fund' CHECK (category IN ('Buy a Car', 'Buy a House', 'Higher Education', 'Emergency Fund', 'Vacation', 'Wedding', 'Retirement', 'Other Personal Goals')),
    description TEXT,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. RETIREMENT PLANS TABLE
CREATE TABLE IF NOT EXISTS public.retirement_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_age INTEGER NOT NULL CHECK (current_age > 0 AND current_age < 120),
    retirement_age INTEGER NOT NULL CHECK (retirement_age > current_age AND retirement_age < 120),
    life_expectancy INTEGER NOT NULL DEFAULT 85 CHECK (life_expectancy > retirement_age),
    current_monthly_income NUMERIC(14, 2) NOT NULL,
    expected_monthly_expenses NUMERIC(14, 2) NOT NULL,
    current_retirement_savings NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    expected_annual_return NUMERIC(5, 2) NOT NULL DEFAULT 12.00,
    expected_inflation_rate NUMERIC(5, 2) NOT NULL DEFAULT 6.00,
    calculated_corpus NUMERIC(16, 2) NOT NULL,
    additional_monthly_sip NUMERIC(14, 2) NOT NULL,
    assumptions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. LIABILITIES TABLE
CREATE TABLE IF NOT EXISTS public.liabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    liability_name TEXT NOT NULL,
    liability_type TEXT NOT NULL CHECK (liability_type IN ('Home Loan', 'Car Loan', 'Personal Loan', 'Credit Card', 'Education Loan', 'Other')),
    total_amount NUMERIC(14, 2) NOT NULL,
    remaining_amount NUMERIC(14, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) DEFAULT 0.00,
    monthly_emi NUMERIC(14, 2) DEFAULT 0.00,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. FINANCIAL REPORTS / AI INSIGHTS CACHE TABLE
CREATE TABLE IF NOT EXISTS public.financial_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_month TEXT NOT NULL,
    health_score INTEGER DEFAULT 80,
    summary TEXT,
    spending_analysis TEXT,
    savings_suggestions TEXT,
    raw_insights JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR FAST QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_income_user_date ON public.income(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(user_id, category);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON public.budgets(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_investments_user ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON public.savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_user ON public.liabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_retirement_user ON public.retirement_plans(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retirement_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Income Policies
CREATE POLICY "Users can select own income" ON public.income FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own income" ON public.income FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own income" ON public.income FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own income" ON public.income FOR DELETE USING (auth.uid() = user_id);

-- Expenses Policies
CREATE POLICY "Users can select own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Budgets Policies
CREATE POLICY "Users can select own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- Investments Policies
CREATE POLICY "Users can select own investments" ON public.investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own investments" ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own investments" ON public.investments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own investments" ON public.investments FOR DELETE USING (auth.uid() = user_id);

-- Savings Goals Policies
CREATE POLICY "Users can select own goals" ON public.savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.savings_goals FOR DELETE USING (auth.uid() = user_id);

-- Retirement Plans Policies
CREATE POLICY "Users can select own retirement plan" ON public.retirement_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own retirement plan" ON public.retirement_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own retirement plan" ON public.retirement_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own retirement plan" ON public.retirement_plans FOR DELETE USING (auth.uid() = user_id);

-- Liabilities Policies
CREATE POLICY "Users can select own liabilities" ON public.liabilities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own liabilities" ON public.liabilities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own liabilities" ON public.liabilities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own liabilities" ON public.liabilities FOR DELETE USING (auth.uid() = user_id);

-- Financial Reports Policies
CREATE POLICY "Users can select own financial reports" ON public.financial_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own financial reports" ON public.financial_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATED TRIGGERS (Auto-Profile Creation & updated_at)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_income BEFORE UPDATE ON public.income FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_expenses BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_budgets BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_investments BEFORE UPDATE ON public.investments FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_savings_goals BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_retirement BEFORE UPDATE ON public.retirement_plans FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at_liabilities BEFORE UPDATE ON public.liabilities FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
