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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }

    const supabase = createSupabase();

    const { data: partner } = await supabase
      .from('manufacturer_partners')
      .select('name, early_adopter_enabled, early_adopter_slots, early_adopter_used, commission_enabled')
      .eq('referral_code', code.toUpperCase())
      .eq('active', true)
      .maybeSingle();

    if (!partner) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    const slotsRemaining = Math.max(0, (partner.early_adopter_slots || 0) - (partner.early_adopter_used || 0));
    const isEarlyAdopter = partner.early_adopter_enabled && slotsRemaining > 0;

    let message = '';
    if (isEarlyAdopter) {
      message = `🎉 ${partner.name} Early Adopter Program — Your add-ons are FREE for the first 3 months! Only ${slotsRemaining} spot${slotsRemaining !== 1 ? 's' : ''} left.`;
    } else {
      message = `You're signing up through ${partner.name}. Your discount will be applied at checkout.`;
    }

    return NextResponse.json({
      partnerName: partner.name,
      isEarlyAdopter,
      slotsRemaining,
      message,
    });

  } catch (error: any) {
    console.error('Referral info error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
