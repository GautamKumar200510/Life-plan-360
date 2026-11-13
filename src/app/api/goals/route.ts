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
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('target_date', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, goal_name, target_amount, current_saved_amount, target_date, category, description, status } = body;

    if (!user_id || !goal_name || !target_amount || !target_date) {
      return NextResponse.json({ error: 'Missing required goal fields' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        data: { id: `goal-${Date.now()}`, ...body },
      });
    }

    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id,
        goal_name,
        target_amount: Number(target_amount),
        current_saved_amount: Number(current_saved_amount || 0),
        target_date,
        category: category || 'Emergency Fund',
        description,
        status: status || 'in_progress',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
