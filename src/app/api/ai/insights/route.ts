import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FinancialAnalyticsSummary } from '@/types/financial';

export async function POST(request: Request) {
  try {
    const { summary, goals, userProfile } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;

    // Financial heuristics calculation for instant baseline / fallback
    const savingsRate = summary?.savingsRate || 0;
    const budgetPct = summary?.budgetUtilizationPct || 0;
    const hasGoals = goals && goals.length > 0;
    const hasInvestments = (summary?.totalInvested || 0) > 0;

    let baselineHealthScore = 60;
    if (savingsRate >= 30) baselineHealthScore += 20;
    else if (savingsRate >= 15) baselineHealthScore += 10;

    if (budgetPct > 0 && budgetPct <= 85) baselineHealthScore += 15;
    else if (budgetPct > 100) baselineHealthScore -= 15;

    if (hasInvestments) baselineHealthScore += 10;
    if (hasGoals) baselineHealthScore += 5;

    baselineHealthScore = Math.min(98, Math.max(35, baselineHealthScore));

    const getGrade = (score: number) => {
      if (score >= 90) return 'A+';
      if (score >= 80) return 'A';
      if (score >= 70) return 'B+';
      if (score >= 60) return 'B';
      if (score >= 50) return 'C';
      return 'D';
    };

    if (!apiKey || apiKey === 'your-gemini-api-key') {
      return NextResponse.json({
        success: true,
        source: 'heuristic',
        configNotice: 'GEMINI_API_KEY is not configured in .env. To enable live neural AI insights, set GEMINI_API_KEY in your environment.',
        data: {
          healthScore: baselineHealthScore,
          healthGrade: getGrade(baselineHealthScore),
          summary: `Based on your recorded income of ₹${(summary?.totalIncome || 0).toLocaleString('en-IN')} and expenses of ₹${(summary?.totalExpenses || 0).toLocaleString('en-IN')}, your current savings rate is ${savingsRate.toFixed(1)}%. Your budget utilization is currently ${budgetPct.toFixed(1)}%.`,
          keyHighlights: [
            savingsRate >= 20
              ? `Solid savings discipline of ${savingsRate.toFixed(1)}% above the recommended 20% benchmark.`
              : `Your savings rate is ${savingsRate.toFixed(1)}%. Strive to reach at least 20% by curbing discretionary spends.`,
            summary?.topExpenseCategory
              ? `Top spending area is ${summary.topExpenseCategory.category} accounting for ₹${summary.topExpenseCategory.amount.toLocaleString('en-IN')} (${summary.topExpenseCategory.percentage.toFixed(1)}% of total expenses).`
              : 'Add expense records to discover category patterns.',
            summary?.currentPortfolioValue > 0
              ? `Portfolio valuation stands at ₹${summary.currentPortfolioValue.toLocaleString('en-IN')} with an overall gain of ${summary.portfolioReturnPct.toFixed(1)}%.`
              : 'Consider establishing a diversified mutual fund SIP for wealth accumulation.',
          ],
          spendingPatterns: [
            summary?.topExpenseCategory
              ? `High allocation toward ${summary.topExpenseCategory.category}. Assess if fixed overheads can be renegotiated.`
              : 'Track daily transactions to unlock pattern detection.',
            budgetPct > 100
              ? 'Warning: Total spending has crossed the monthly budget threshold.'
              : 'Expenses remain within the sanctioned monthly ceiling.',
          ],
          savingsRecommendations: [
            'Maintain an Emergency Fund equivalent to 6 months of mandatory living expenses in liquid instruments.',
            'Automate monthly SIPs on your salary credit day to implement the "Pay Yourself First" principle.',
            'Review subscription charges and recurring non-essential memberships quarterly.',
          ],
          budgetImprovements: [
            'Adopt the 50-30-20 rule: 50% for Needs, 30% for Wants, 20% for Savings & Investments.',
            'Set micro-budgets for dining and entertainment to prevent month-end cash flow squeeze.',
          ],
          retirementInsights:
            'Compound interest yields exponential advantages when started early. Prioritize consistent equity index funds and debt instruments like PPF.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Call Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are the Chief AI Financial Planner of "Life Plan 360°" — an executive wealth management platform.
Analyze this user's real financial portfolio data:
- User: ${userProfile?.full_name || 'Client'}
- Total Income: ₹${summary?.totalIncome || 0}
- Total Expenses: ₹${summary?.totalExpenses || 0}
- Net Savings: ₹${summary?.totalSavings || 0}
- Savings Rate: ${(summary?.savingsRate || 0).toFixed(1)}%
- Total Portfolio Value: ₹${summary?.currentPortfolioValue || 0}
- Total Liabilities/Debts: ₹${summary?.totalLiabilities || 0}
- Net Worth: ₹${summary?.netWorth || 0}
- Monthly Budget: ₹${summary?.monthlyBudget || 0}
- Monthly Spending: ₹${summary?.monthlySpending || 0}
- Top Expense Category: ${summary?.topExpenseCategory ? `${summary.topExpenseCategory.category} (₹${summary.topExpenseCategory.amount})` : 'N/A'}
- Goals: ${JSON.stringify(goals?.map((g: any) => ({ name: g.goal_name, target: g.target_amount, saved: g.current_saved_amount })) || [])}

Safety Instructions:
- Ground all insights strictly on these real numbers.
- Provide practical, responsible educational insights for an Indian investor context (₹ INR, SIPs, emergency funds, PPF/Mutual Funds).
- Do not make specific stock buy/sell tips or guaranteed returns.

Respond in pure valid JSON without markdown wrapping with this exact structure:
{
  "healthScore": <integer between 40 and 99>,
  "healthGrade": "<A+|A|B+|B|C|D>",
  "summary": "<2 concise sentences summarizing their current wealth position>",
  "keyHighlights": ["<highlight 1>", "<highlight 2>", "<highlight 3>"],
  "spendingPatterns": ["<pattern 1>", "<pattern 2>"],
  "savingsRecommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"],
  "budgetImprovements": ["<improvement 1>", "<improvement 2>"],
  "retirementInsights": "<1-2 sentences on retirement readiness and compounding strategy>"
}
`;

    const response = await model.generateContent(prompt);
    const responseText = response.response.text();

    // Clean JSON markdown if wrapped
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json({
      success: true,
      source: 'gemini',
      data: {
        ...parsedData,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('AI Insights endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to generate AI insights',
      },
      { status: 500 }
    );
  }
}
