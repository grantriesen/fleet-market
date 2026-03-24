// app/api/rental/settings/[siteId]/route.ts
// Returns rental settings (tax rate, etc.) for a given site
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest, { params }: { params: { siteId: string } }) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data } = await supabase
      .from('rental_settings')
      .select('tax_rate, min_rental_hours, cancellation_policy, collect_deposit_online')
      .eq('site_id', params.siteId)
      .maybeSingle();

    return NextResponse.json(data || { tax_rate: 0, min_rental_hours: 1, cancellation_policy: '', collect_deposit_online: true });
  } catch (err: any) {
    return NextResponse.json({ tax_rate: 0 });
  }
}
