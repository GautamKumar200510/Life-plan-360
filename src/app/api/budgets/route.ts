import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const supabase = getServerSupabase();
    if (!supabase || !userId) {
      return NextResponse.json({ success: true, data: null });
    }

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    if (error) throw error;
    return NextResponse.json({ success: true, data: data?.[0] || null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, month_year, total_budget, category_budgets, notes } = body;

    if (!user_id || total_budget === undefined) {
      return NextResponse.json({ error: 'Missing required budget fields' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        data: { id: `bud-${Date.now()}`, ...body },
      });
    }

    const { data, error } = await supabase
      .from('budgets')
      .upsert({
        user_id,
        month_year: month_year || new Date().toISOString().substring(0, 7),
        total_budget: Number(total_budget),
        category_budgets: category_budgets || {},
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
