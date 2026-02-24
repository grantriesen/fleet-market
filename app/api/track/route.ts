import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteId, page, referrer, sessionId } = body;

    if (!siteId || !page) {
      return NextResponse.json({ error: 'Missing siteId or page' }, { status: 400 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get() { return undefined; },
          set() {},
          remove() {},
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Hash IP for privacy (don't store raw IPs)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const ipHash = createHash('sha256').update(ip + siteId).digest('hex').substring(0, 16);

    const userAgent = request.headers.get('user-agent') || '';

    await supabase.from('page_views').insert({
      site_id: siteId,
      page,
      referrer: referrer || null,
      user_agent: userAgent,
      ip_hash: ipHash,
      session_id: sessionId || null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Track error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
