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
    const { siteId, contentRows, manufacturers } = await request.json();

    if (!siteId || !contentRows) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createSupabase();

    // Verify site exists
    const { data: site } = await supabase
      .from('sites').select('id').eq('id', siteId).single();
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Upsert all content rows using service role (bypasses RLS)
    const validRows = contentRows.filter((r: any) => r.field_key && r.value);
    
    if (validRows.length > 0) {
      const { error: contentError } = await supabase
        .from('site_content')
        .upsert(
          validRows.map((r: any) => ({
            site_id: siteId,
            field_key: r.field_key,
            value: r.value,
            field_type: r.field_type || 'text',
          })),
          { onConflict: 'site_id,field_key' }
        );

      if (contentError) {
        console.error('Content upsert error:', contentError);
        return NextResponse.json({ error: contentError.message }, { status: 500 });
      }
    }

    // Insert manufacturers if provided
    if (manufacturers && manufacturers.length > 0) {
      // Delete existing first to avoid duplicates on re-run
      await supabase.from('manufacturers').delete().eq('site_id', siteId);

      const { error: mfgError } = await supabase
        .from('manufacturers')
        .insert(manufacturers.map((m: any, i: number) => ({
          site_id: siteId,
          name: m.name,
          description: m.description || null,
          website_url: m.website_url || null,
          logo_url: null,
          display_order: i,
          is_featured: false,
        })));

      if (mfgError) {
        console.error('Manufacturers insert error:', mfgError);
        // Non-fatal — content already saved
      }
    }

    // Mark onboarding complete if column exists
    await supabase.from('sites')
      .update({ onboarding_completed: true })
      .eq('id', siteId)
      .then(() => {}); // ignore error if column doesn't exist

    return NextResponse.json({ success: true, savedRows: validRows.length });
  } catch (error: any) {
    console.error('Save onboarding error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
