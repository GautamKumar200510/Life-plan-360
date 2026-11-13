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
      .from('expenses')
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
    const { user_id, amount, title, category, date, description, payment_method, is_recurring } = body;

    if (!user_id || !amount || !title || !category) {
      return NextResponse.json({ error: 'Missing required expense fields' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        data: { id: `exp-${Date.now()}`, ...body },
        message: 'Saved to local session',
      });
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id,
        amount: Number(amount),
        title,
        category,
        date: date || new Date().toISOString().split('T')[0],
        description,
        payment_method: payment_method || 'UPI/Card',
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
