import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

function createSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { get() { return undefined; }, set() {}, remove() {} },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const supabase = createSupabase();

    const { data: membership } = await supabase
      .from('manufacturer_users')
      .select('id, role, partner:manufacturer_partners(id, name)')
      .eq('user_id', user_id)
      .eq('active', true)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'Not a manufacturer account', is_manufacturer: false }, { status: 404 });
    }

    return NextResponse.json({ is_manufacturer: true, membership });
  } catch (error: any) {
    console.error('Manufacturer verify error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
