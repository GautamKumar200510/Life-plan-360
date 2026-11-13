import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { message, history, financialSummary, userProfile } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your-gemini-api-key') {
      // Intelligent fallback responses based on intent
      const lower = message.toLowerCase();
      let fallbackReply = `Here is an automated wealth advisory response based on your portfolio:\n\n`;

      if (lower.includes('reduce') || lower.includes('cut') || lower.includes('expense')) {
        fallbackReply += `To reduce monthly expenses based on your data:\n1. Your top spending is in **${financialSummary?.topExpenseCategory?.category || 'discretionary items'}**. Set a weekly spending cap.\n2. Review subscription billing and dining out habits.\n3. Follow the 50/30/20 budget framework to keep lifestyle inflation in check.`;
      } else if (lower.includes('save') || lower.includes('invest') || lower.includes('sip')) {
        fallbackReply += `Your current savings rate is **${(financialSummary?.savingsRate || 0).toFixed(1)}%**.\n\n- Standard recommendation is a minimum 20% to 30% savings rate.\n- Route surplus cash into automatic SIPs (Equity Index Funds / Flexi Cap) on the 1st of every month.\n- Ensure you have a 6-month liquid Emergency Fund before investing aggressively.`;
      } else if (lower.includes('retire') || lower.includes('pension')) {
        fallbackReply += `Retirement planning requires staying ahead of inflation (~6% in India).\n- Increase your monthly SIP contributions by 10% annually (Step-up SIP).\n- Maintain a balanced asset allocation (e.g. 70% Equity / 30% Fixed Income like PPF/EPF/Debt) depending on your age.`;
      } else {
        fallbackReply += `Your Net Worth is currently **₹${(financialSummary?.netWorth || 0).toLocaleString('en-IN')}** across recorded assets and liabilities.\n\nKey areas to optimize:\n- Target a debt-to-asset ratio under 20%.\n- Automate savings before spending.\n- Keep track of your monthly budget of ₹${(financialSummary?.monthlyBudget || 0).toLocaleString('en-IN')}.\n\n*(Note: Add your GEMINI_API_KEY in .env to unlock multi-turn live AI reasoning!)*`;
      }

      return NextResponse.json({
        success: true,
        reply: fallbackReply,
        source: 'heuristic',
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `
You are the AI Wealth Advisor for Life Plan 360°.
User profile:
- Name: ${userProfile?.full_name || 'Client'}
- Current Age: ${userProfile?.current_age || 30}
- Target Retirement Age: ${userProfile?.retirement_age || 60}
- Total Income: ₹${financialSummary?.totalIncome || 0}
- Total Expenses: ₹${financialSummary?.totalExpenses || 0}
- Net Savings: ₹${financialSummary?.totalSavings || 0}
- Current Portfolio Value: ₹${financialSummary?.currentPortfolioValue || 0}
- Liabilities: ₹${financialSummary?.totalLiabilities || 0}
- Net Worth: ₹${financialSummary?.netWorth || 0}
- Monthly Budget: ₹${financialSummary?.monthlyBudget || 0}
- Top Expense: ${financialSummary?.topExpenseCategory ? `${financialSummary.topExpenseCategory.category} (₹${financialSummary.topExpenseCategory.amount})` : 'N/A'}

Rules:
1. Ground answers strictly in the user's financial numbers and realistic wealth-building principles in India (INR, mutual funds, SIP, EPF/PPF, FDs, Gold, taxation overview).
2. Answer in clear, empathetic, actionable formatting with markdown bullet points.
3. Include an educational disclaimer when discussing investments. Do not guarantee returns or recommend specific speculative stock purchases.
`;

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: `Understood. I am your Life Plan 360° AI Wealth Advisor. How can I help optimize your financial roadmap today?` }],
        },
        ...(history || []).slice(-6).map((h: any) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        })),
      ],
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return NextResponse.json({
      success: true,
      reply,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate chat response' },
      { status: 500 }
    );
  }
}
