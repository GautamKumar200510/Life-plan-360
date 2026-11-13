import { NextResponse } from 'next/server';
import { calculateRetirementPlan, RetirementCalcInput } from '@/lib/calculations/financialCalculations';

export async function POST(request: Request) {
  try {
    const body: RetirementCalcInput = await request.json();

    if (!body.currentAge || !body.retirementAge || !body.expectedMonthlyExpenses) {
      return NextResponse.json(
        { error: 'currentAge, retirementAge, and expectedMonthlyExpenses are required fields.' },
        { status: 400 }
      );
    }

    const result = calculateRetirementPlan(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error calculating retirement projection' },
      { status: 500 }
    );
  }
}
