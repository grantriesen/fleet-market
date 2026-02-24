// app/api/service/types/[siteId]/route.ts
// Public endpoint: returns active service types for customer booking form
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest, { params }: { params: { siteId: string } }) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: types } = await supabase
      .from('service_types')
      .select('id, name, description, duration_minutes, price_estimate, category')
      .eq('site_id', params.siteId)
      .eq('is_active', true)
      .order('sort_order');

    return NextResponse.json({ types: types || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
