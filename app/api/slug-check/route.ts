// app/api/slug-check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug    = searchParams.get('slug');
  const siteId  = searchParams.get('siteId');

  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get() { return undefined; }, set() {}, remove() {} } }
  );

  const query = supabase
    .from('sites')
    .select('id')
    .eq('slug', slug);

  if (siteId) query.neq('id', siteId);

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Slug check error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ available: !data });
}
