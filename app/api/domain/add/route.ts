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

    // If there was a previous custom domain, remove it from Vercel first
    if (site.custom_domain && site.custom_domain !== domain) {
      const teamQ = TEAM_ID ? `?teamId=${TEAM_ID}` : '';
      await fetch(
        `${VERCEL_API}/v9/projects/${PROJECT_ID}/domains/${site.custom_domain}${teamQ}`,
        { method: 'DELETE', headers: vercelHeaders() }
      );
    }

    // Add the new domain to Vercel
    const teamQ = TEAM_ID ? `?teamId=${TEAM_ID}` : '';
    const addRes = await fetch(
      `${VERCEL_API}/v10/projects/${PROJECT_ID}/domains${teamQ}`,
      {
        method: 'POST',
        headers: vercelHeaders(),
        body: JSON.stringify({ name: domain }),
      }
    );

    const addData = await addRes.json();

    if (!addRes.ok) {
      // Domain already exists on this project is fine
      if (addData.error?.code !== 'domain_already_in_use') {
        console.error('Vercel domain add error:', addData);
        return NextResponse.json(
          { error: addData.error?.message || 'Failed to register domain with Vercel' },
          { status: 500 }
        );
      }
    }

    // Update Supabase with the new custom domain
    await supabase
      .from('sites')
      .update({ custom_domain: domain })
      .eq('id', siteId);

    return NextResponse.json({ success: true, domain });

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

    // Remove from Vercel
    const teamQ = TEAM_ID ? `?teamId=${TEAM_ID}` : '';
    await fetch(
      `${VERCEL_API}/v9/projects/${PROJECT_ID}/domains/${domain}${teamQ}`,
      { method: 'DELETE', headers: vercelHeaders() }
    );

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
