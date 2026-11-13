import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ success: true, data: { id, ...body } });
    }

    const { data, error } = await supabase
      .from('income')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = getServerSupabase();
    if (!supabase) {
      return NextResponse.json({ success: true, id });
    }

    const { error } = await supabase.from('income').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
