// app/api/inventory/cart/[siteId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function createSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// GET — fetch cart by session
export async function GET(request: NextRequest, { params }: { params: { siteId: string } }) {
  const sessionId = request.headers.get('x-session-id') || request.nextUrl.searchParams.get('session');
  if (!sessionId) return NextResponse.json({ items: [] });

  const supabase = createSupabase();
  const { data: cart } = await supabase
    .from('carts')
    .select('id, items')
    .eq('site_id', params.siteId)
    .eq('session_id', sessionId)
    .maybeSingle();

  return NextResponse.json({ cartId: cart?.id || null, items: cart?.items || [] });
}

// POST — add or update item in cart
export async function POST(request: NextRequest, { params }: { params: { siteId: string } }) {
  try {
    const { sessionId, item } = await request.json();
    // item: { id, title, price, quantity, primary_image, slug }
    if (!sessionId || !item?.id) return NextResponse.json({ error: 'Missing sessionId or item' }, { status: 400 });

    const supabase = createSupabase();

    // Get or create cart
    let { data: cart } = await supabase
      .from('carts')
      .select('id, items')
      .eq('site_id', params.siteId)
      .eq('session_id', sessionId)
      .maybeSingle();

    let items: any[] = cart?.items || [];

    // Update quantity if item exists, otherwise add
    const existing = items.findIndex((i: any) => i.id === item.id);
    if (existing >= 0) {
      items[existing].quantity = (items[existing].quantity || 1) + (item.quantity || 1);
    } else {
      items.push({ ...item, quantity: item.quantity || 1 });
    }

    if (cart) {
      await supabase.from('carts').update({ items, updated_at: new Date().toISOString() }).eq('id', cart.id);
    } else {
      const { data: newCart } = await supabase
        .from('carts')
        .insert({ site_id: params.siteId, session_id: sessionId, items })
        .select('id')
        .single();
      cart = newCart;
    }

    return NextResponse.json({ success: true, cartId: cart?.id, items });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — remove item or clear cart
export async function DELETE(request: NextRequest, { params }: { params: { siteId: string } }) {
  try {
    const { sessionId, itemId, clearAll } = await request.json();
    if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });

    const supabase = createSupabase();
    const { data: cart } = await supabase
      .from('carts')
      .select('id, items')
      .eq('site_id', params.siteId)
      .eq('session_id', sessionId)
      .maybeSingle();

    if (!cart) return NextResponse.json({ success: true, items: [] });

    if (clearAll) {
      await supabase.from('carts').update({ items: [], updated_at: new Date().toISOString() }).eq('id', cart.id);
      return NextResponse.json({ success: true, items: [] });
    }

    const items = (cart.items || []).filter((i: any) => i.id !== itemId);
    await supabase.from('carts').update({ items, updated_at: new Date().toISOString() }).eq('id', cart.id);
    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
