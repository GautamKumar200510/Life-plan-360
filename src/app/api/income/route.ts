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
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, amount, source, category, date, description, is_recurring } = body;

    if (!user_id || !amount || !source || !category) {
      return NextResponse.json({ error: 'Missing required income fields' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        data: { id: `inc-${Date.now()}`, ...body },
        message: 'Saved to local session',
      });
    }

    const { data, error } = await supabase
      .from('income')
      .insert({
        user_id,
        amount: Number(amount),
        source,
        category,
        date: date || new Date().toISOString().split('T')[0],
        description,
        is_recurring: Boolean(is_recurring),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
