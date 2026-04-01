// app/api/domain/add/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const VERCEL_API    = 'https://api.vercel.com';
const VERCEL_TOKEN  = process.env.VERCEL_API_TOKEN!;
const PROJECT_ID    = process.env.VERCEL_PROJECT_ID!;
const TEAM_ID       = process.env.VERCEL_TEAM_ID;

function vercelHeaders() {
  return {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value, set() {}, remove() {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { siteId, domain } = await request.json();
    if (!siteId || !domain) return NextResponse.json({ error: 'siteId and domain required' }, { status: 400 });

    // Verify the site belongs to this user
    const { data: site } = await supabase
      .from('sites')
      .select('id, custom_domain')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single();

    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    // Normalize to apex domain (strip www if present)
    const apexDomain = domain.replace(/^www\./, '');
    const wwwDomain  = `www.${apexDomain}`;

    const teamQ = TEAM_ID ? `?teamId=${TEAM_ID}` : '';

    // Remove old domains from Vercel if switching
    if (site.custom_domain && site.custom_domain !== apexDomain) {
      const oldApex = site.custom_domain.replace(/^www\./, '');
      await fetch(`${VERCEL_API}/v9/projects/${PROJECT_ID}/domains/${oldApex}${teamQ}`,    { method: 'DELETE', headers: vercelHeaders() });
      await fetch(`${VERCEL_API}/v9/projects/${PROJECT_ID}/domains/www.${oldApex}${teamQ}`, { method: 'DELETE', headers: vercelHeaders() });
    }

    // Register both apex and www with Vercel
    const addDomain = async (d: string) => {
      const res = await fetch(
        `${VERCEL_API}/v10/projects/${PROJECT_ID}/domains${teamQ}`,
        { method: 'POST', headers: vercelHeaders(), body: JSON.stringify({ name: d }) }
      );
      const data = await res.json();
      if (!res.ok && data.error?.code !== 'domain_already_in_use') {
        throw new Error(data.error?.message || `Failed to register ${d}`);
      }
      return data;
    };

    await addDomain(apexDomain);
    await addDomain(wwwDomain);

    // Store the apex domain in Supabase (without www)
    await supabase
      .from('sites')
      .update({ custom_domain: apexDomain })
      .eq('id', siteId);

    return NextResponse.json({ success: true, domain: apexDomain, www: wwwDomain });

  } catch (err: any) {
    console.error('Domain add error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value, set() {}, remove() {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { siteId, domain } = await request.json();
    if (!siteId || !domain) return NextResponse.json({ error: 'siteId and domain required' }, { status: 400 });

    const { data: site } = await supabase
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single();

    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    // Remove both apex and www from Vercel
    const apexDomain = domain.replace(/^www\./, '');
    const teamQ = TEAM_ID ? `?teamId=${TEAM_ID}` : '';
    await fetch(`${VERCEL_API}/v9/projects/${PROJECT_ID}/domains/${apexDomain}${teamQ}`,        { method: 'DELETE', headers: vercelHeaders() });
    await fetch(`${VERCEL_API}/v9/projects/${PROJECT_ID}/domains/www.${apexDomain}${teamQ}`,    { method: 'DELETE', headers: vercelHeaders() });

    // Clear from Supabase
    await supabase
      .from('sites')
      .update({ custom_domain: null })
      .eq('id', siteId);

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Domain delete error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
