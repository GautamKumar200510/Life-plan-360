import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { calculateFinancialSummary } from '@/lib/calculations/financialCalculations';
import { IncomeItem, ExpenseItem, InvestmentItem, LiabilityItem, BudgetItem } from '@/types/financial';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const supabase = getServerSupabase();
    if (!supabase || !userId) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const [
      incRes,
      expRes,
      invRes,
      liabRes,
      budRes
    ] = await Promise.all([
      supabase.from('income').select('*').eq('user_id', userId),
      supabase.from('expenses').select('*').eq('user_id', userId),
      supabase.from('investments').select('*').eq('user_id', userId),
      supabase.from('liabilities').select('*').eq('user_id', userId),
      supabase.from('budgets').select('*').eq('user_id', userId).limit(1),
    ]);

    const summary = calculateFinancialSummary(
      (incRes.data as IncomeItem[]) || [],
      (expRes.data as ExpenseItem[]) || [],
      (invRes.data as InvestmentItem[]) || [],
      (liabRes.data as LiabilityItem[]) || [],
      (budRes.data?.[0] as BudgetItem) || null
    );

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
