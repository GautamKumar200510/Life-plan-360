# Life Plan 360° – AI-Powered Wealth Management & Financial Planning Platform

[![Built with Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![Database Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![AI Powered](https://img.shields.io/badge/AI-Google%20Gemini%201.5-blue?logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![Currency](https://img.shields.io/badge/Currency-INR%20(%E2%82%B9)-green)](#)

Life Plan 360° is an enterprise-grade wealth management and financial planning platform designed to centralize cash flow tracking, budget enforcement, investment portfolio analysis, goal milestone planning, and inflation-adjusted retirement modeling—empowered by 24/7 AI-driven financial intelligence.

---

## 🌟 Key Architecture & Features

### 1. Executive Wealth Dashboard
- **Real-Time Financial Cards**: Total Income, Total Expenses, Total Savings, Total Investments, Net Worth ($Net Worth = Assets - Liabilities$), and Monthly Budget Utilization.
- **5 Dynamic Recharts Visualizations**:
  1. *Income vs Expenses* (Monthly Velocity Line Chart)
  2. *Monthly Spending* (Interactive Category Donut Chart)
  3. *Savings Growth* (Cumulative Surplus Area Chart)
  4. *Investment Distribution* (Asset Class Allocation Donut)
  5. *Comprehensive Financial Overview* (Monthly Volume Bar Chart)
- **Live Audits**: Recent Transactions feed with category badges, upcoming goal milestone progress, and autonomous monthly health score diagnostics.

### 2. Income Management
- Real-time CRUD operations for all income sources.
- Categories: `Salary`, `Freelancing`, `Business`, `Investments`, `Rental Income`, `Other Income`.
- Multi-dimensional filters (Category, All Time / This Month / This Year, Search).
- CSV export for tax filing and accounting records.

### 3. Expense Management
- Categorized expenditures: `Food`, `Transportation`, `Shopping`, `Education`, `Healthcare`, `Housing`, `Entertainment`, `Bills`, `Travel`, `Other`.
- Payment mode tracking (`UPI`, `Credit Card`, `Debit Card`, `Net Banking`, `Cash`).
- Category-wise spending density, monthly trends, and peak outflow alerts.
- CSV data export.

### 4. Smart Budgeting & Alerts
- Global monthly spend ceiling and granular category allocations.
- Real-time utilization bar gauges with stateful color coding:
  - `< 80%`: Healthy (Emerald)
  - `80% - 99%`: Caution / Nearing Threshold (Amber)
  - `100%+`: Budget Deficit Warning (Rose)
- Proactive spending alerts and remaining liquidity calculation.

### 5. Multi-Asset Investment Portfolio
- Track: `Mutual Funds`, `Stocks`, `Fixed Deposits`, `Gold`, `Real Estate`, `PPF`, `EPF`, `Other Investments`.
- Automated calculations: Total Invested, Current Portfolio Value, Absolute Profit/Loss (₹), and Return % ($ROI$).
- Transparent formula modeling and clear user-entered valuation disclaimers.

### 6. Savings Goals & Milestone Progress
- Plan for life milestones: *Buy a Car, Buy a House, Higher Education, Emergency Fund, Vacation, Wedding, Retirement*.
- Calculates remaining amount, completion percentage, and monthly savings (SIP) required based on target deadline.
- Interactive "Deposit Funds" modal to simulate real-world capital injection.

### 7. Actuarial Retirement Planning Model
- Inflation-adjusted retirement expense projection:
  $$E_{ret} = E_{current} \times (1 + i)^n$$
- Life expectancy corpus annuitization modeling:
  $$\text{Corpus} = \text{Annual Expense} \times \frac{1 - (1 + r_{real})^{-m}}{r_{real}}$$
- Calculates future value of current retirement savings (PPF, EPF, NPS) and exact monthly step-up SIP required.
- Visual comparative area chart displaying standalone savings growth vs recommended SIP accumulation trajectory.

### 8. Financial Analytics Engine
- Date filtering: *Last 7 Days, Last 30 Days, Last 3 Months, Last 6 Months, Last 1 Year, Custom Date Range*.
- Empirical ratios: Savings Rate % ($(\text{Savings} / \text{Income}) \times 100$), Net Worth decomposition ($Assets - Debt$).

### 9. AI Wealth Advisor (Gemini Neural Engine)
- **Conversational Chat**: Interactive natural language advisory grounded strictly in the user's real portfolio records.
- **Preset Prompt Chips**: "How can I reduce expenses?", "How much should I save?", "Am I on track for retirement?".
- **Autonomous Monthly Diagnostic Report**: Grade score (A+ to D, 0-100), key highlights, spending anomaly detection, actionable SIP steps, and 1-click clipboard copy.
- **AI Safety Guardrails**: No fabricated numbers, no speculative stock tips, transparent educational disclaimers.

### 10. Multi-Tenant Supabase Database & Security
- Real PostgreSQL tables with Row Level Security (RLS) policies guaranteeing strict tenant isolation.
- Automatic profile trigger on user signup.
- Seamless zero-friction demo / offline fallback mode for instant local evaluation without credentials.

---

## 📁 Project Folder Structure

```
life-plan-360/
├── public/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # SaaS Landing Page
│   │   ├── layout.tsx                  # Root HTML & Providers
│   │   ├── globals.css                 # Tailwind CSS styles
│   │   ├── login/page.tsx              # Supabase Auth Login + Demo Mode
│   │   ├── register/page.tsx           # Supabase Auth Registration
│   │   ├── dashboard/page.tsx          # Executive Wealth Dashboard
│   │   ├── income/page.tsx             # Income Management & History
│   │   ├── expenses/page.tsx           # Expense Management & Audits
│   │   ├── budget/page.tsx             # Monthly Budget & Alerts
│   │   ├── investments/page.tsx        # Multi-Asset Portfolio Tracker
│   │   ├── goals/page.tsx              # Savings Goals & Deposit Engine
│   │   ├── retirement/page.tsx         # Retirement Planning Calculator
│   │   ├── analytics/page.tsx          # Deep Analytics & Net Worth
│   │   ├── advisor/page.tsx            # AI Financial Advisor & Report
│   │   ├── settings/page.tsx           # User Profile & Backup
│   │   └── api/
│   │       ├── ai/chat/route.ts        # Conversational AI Endpoint
│   │       ├── ai/insights/route.ts    # AI Diagnostic Synthesis
│   │       ├── analytics/overview/     # Aggregate Financial Data
│   │       ├── budgets/route.ts        # Budget CRUD API
│   │       ├── expenses/route.ts       # Expense CRUD API
│   │       ├── expenses/[id]/route.ts  # Expense ID Operations
│   │       ├── goals/route.ts          # Savings Goals CRUD
│   │       ├── goals/[id]/route.ts     # Goal ID Operations
│   │       ├── income/route.ts         # Income CRUD API
│   │       ├── income/[id]/route.ts    # Income ID Operations
│   │       ├── investments/route.ts    # Investment CRUD API
│   │       ├── investments/[id]/route.ts
│   │       └── retirement/calculate/   # Actuarial Math Route
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx             # 10-Item Collapsible Nav
│   │   │   ├── TopNavbar.tsx           # Topbar with Search & Notifs
│   │   │   └── DashboardLayout.tsx     # Responsive Layout Wrapper
│   │   ├── dashboard/
│   │   │   ├── MetricsGrid.tsx         # 6 Core Financial Stat Cards
│   │   │   ├── MonthlySummaryCard.tsx  # Diagnostic Health Card
│   │   │   ├── RecentTransactions.tsx  # Unified Transaction Feed
│   │   │   ├── AiInsightWidget.tsx     # Dashboard AI Widget
│   │   │   └── EmptyState.tsx          # Clean First-Time User State
│   │   ├── charts/
│   │   │   ├── IncomeExpenseChart.tsx
│   │   │   ├── MonthlySpendingDonut.tsx
│   │   │   ├── SavingsGrowthArea.tsx
│   │   │   ├── InvestmentAllocationChart.tsx
│   │   │   ├── FinancialOverviewBarChart.tsx
│   │   │   └── RetirementProjectionChart.tsx
│   │   ├── forms/
│   │   │   ├── IncomeModal.tsx
│   │   │   ├── ExpenseModal.tsx
│   │   │   ├── BudgetModal.tsx
│   │   │   ├── InvestmentModal.tsx
│   │   │   ├── GoalModal.tsx
│   │   │   └── LiabilityModal.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       ├── Badge.tsx
│   │       └── StatCard.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # Supabase Browser Client
│   │   │   └── server.ts               # Supabase Server Client
│   │   ├── calculations/
│   │   │   ├── currencyFormatter.ts    # Indian Number System (₹)
│   │   │   └── financialCalculations.ts # Actuarial & Wealth Math
│   │   ├── context/
│   │   │   ├── AuthContext.tsx         # Supabase + Demo Auth Provider
│   │   │   └── FinanceContext.tsx      # Central Data Store & Sync
│   │   └── mockData.ts                 # Starter Portfolio Fixture
│   └── types/
│       └── financial.ts                # TypeScript Interfaces
├── supabase/
│   └── schema.sql                      # Complete SQL DDL & RLS Policies
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🔑 Environment Variables Configuration

Create a `.env.local` file in the root directory:

```env
# 1. Supabase PostgreSQL & Auth Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# 2. Google Gemini Neural AI API Key
GEMINI_API_KEY=your-gemini-api-key

# 3. Optional Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: Even without setting up Supabase or Gemini keys immediately, the application includes an automated smart fallback engine so all pages, charts, calculators, forms, and simulated AI diagnostics function 100% out of the box!

---

## 🗄️ Supabase PostgreSQL Setup Instructions

1. Log into your [Supabase Dashboard](https://app.supabase.com) and create a new project.
2. Navigate to **SQL Editor** in the left sidebar.
3. Open the file `supabase/schema.sql` from this repository.
4. Copy the entire contents into the SQL Editor and click **Run**.
5. The script will automatically create:
   - 9 Tables: `profiles`, `income`, `expenses`, `budgets`, `investments`, `savings_goals`, `retirement_plans`, `liabilities`, `financial_reports`.
   - Complete foreign keys referencing `auth.users(id)`.
   - Triggers for auto-generating profiles on user registration.
   - Triggers for automatic `updated_at` timestamps.
   - Comprehensive Row Level Security (RLS) policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
6. Copy your **Project URL** and **anon public key** from *Project Settings -> API* into your `.env.local`.

---

## 💻 Local Development Commands

### Prerequisites
- Node.js `v18.x` or `v20.x` or `v24.x`
- npm, pnpm, or yarn

### Installation & Run

```bash
# Navigate to the project directory
cd life-plan-360

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Verification

```bash
# Compile and build Next.js optimized bundles
npm run build

# Start production server
npm run start
```

---

## 🧪 Testing Instructions

1. **Landing Page**: Navigate to `/`. Check the SaaS layout, features overview, and click **"Launch Dashboard Now"** or **"Explore Live Demo Portfolio"**.
2. **Dashboard Overview**:
   - Verify that all 6 financial summary cards display Indian Rupee values (`₹`).
   - Check the 5 charts: Income vs Expenses, Monthly Spending Donut, Savings Growth Area, Investment Allocation, and Financial Overview Bar.
   - Check the **AI Wealth Intelligence** widget and click **"Open AI Advisor"**.
3. **Income Management (`/income`)**:
   - Click **"Add Income"** and record an entry (e.g., Salary ₹1,50,000).
   - Test category and date filtering.
   - Click **"Export CSV"** to verify file generation.
4. **Expense Management (`/expenses`)**:
   - Click **"Log Expense"** and record an expense (e.g., Rent ₹25,000).
   - Verify that the spending breakdown donut chart updates in real time.
5. **Budget Management (`/budget`)**:
   - Click **"Adjust Budget Parameters"** and set total budget and category limits.
   - Observe the progress gauges and budget alert state changes (Healthy / Caution / Exceeded).
6. **Investment Tracking (`/investments`)**:
   - Add a Mutual Fund or Stock asset with invested principal and current valuation.
   - Confirm automatic computation of Profit/Loss (₹) and ROI (%).
7. **Savings Goals (`/goals`)**:
   - Create a goal with a deadline (e.g., Emergency Fund ₹4,00,000).
   - Click **"Deposit Funds"** to add capital and observe progress bar movement.
8. **Retirement Planning (`/retirement`)**:
   - Adjust the Current Age and Retirement Age sliders.
   - Observe inflation-adjusted future expense calculations and recommended monthly SIP.
   - Click **"Save Plan to Profile"**.
9. **Financial Analytics (`/analytics`)**:
   - Test date filter pills (7D, 30D, 3M, 6M, 1Y, Custom).
   - Verify the Net Worth breakdown formula ($Liquid\ Savings + Investments - Debt$).
10. **AI Financial Advisor (`/advisor`)**:
    - Type a custom question or click preset prompt chips (e.g., *"How can I reduce my monthly expenses?"*).
    - Switch to the **"Diagnostic Report"** tab to view your Financial Health Score, grade, and actionable suggestions.
    - Click **"Copy Report"** to copy the formatted markdown report.
11. **Settings & Empty State Testing (`/settings`)**:
    - Update profile name and age.
    - Click **"Export JSON Backup"**.
    - Click **"Clear All Records"** to test the clean empty onboarding state on the dashboard.
    - Click **"Restore Demo Portfolio"** to instantly repopulate realistic starter data.

---

## 🚀 Deployment Instructions for Vercel

1. Push the code repository to GitHub, GitLab, or Bitbucket.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `life-plan-360` repository.
4. In the **Environment Variables** section, configure:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
5. Click **Deploy**. Vercel will automatically build the Next.js App Router application and provide your live production URL.

---

## 📄 License & Disclaimer

Life Plan 360° is designed for personal wealth management, financial planning, and educational budgeting purposes. It does not provide certified financial advisory or guarantee investment returns. Consult a SEBI-registered financial advisor for specific investment decisions.
