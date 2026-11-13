import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const supabase = getServerSupabase();
    if (!supabase || !userId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .order('current_value', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, investment_name, investment_type, invested_amount, current_value, investment_date, description, folio_or_symbol } = body;

    if (!user_id || !investment_name || !investment_type || invested_amount === undefined || current_value === undefined) {
      return NextResponse.json({ error: 'Missing required investment fields' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        data: { id: `inv-${Date.now()}`, ...body },
      });
    }

    const { data, error } = await supabase
      .from('investments')
      .insert({
        user_id,
        investment_name,
        investment_type,
        invested_amount: Number(invested_amount),
        current_value: Number(current_value),
        investment_date: investment_date || new Date().toISOString().split('T')[0],
        description,
        folio_or_symbol,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
