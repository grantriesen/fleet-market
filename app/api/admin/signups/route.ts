// ─── app/api/admin/signups/route.ts ───
// Returns all beta signups for the admin panel
// Uses service role key (server-side only, never exposed)
import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/beta_signups?order=created_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Admin signups fetch error:', err);
      return NextResponse.json([], { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin signups error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
