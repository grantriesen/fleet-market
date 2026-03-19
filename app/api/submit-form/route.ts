import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { site_id, form_type, name, email, phone, message, extra_data } = body;

    if (!site_id || !form_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: { get() { return undefined; }, set() {}, remove() {} },
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );

    const { error } = await supabase.from('form_submissions').insert({
      site_id,
      form_type,
      name: name || null,
      email: email || null,
      phone: phone || null,
      message: message || null,
      extra_data: extra_data || null,
    });

    if (error) {
      console.error('Form submission error:', error);
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Submit form error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
