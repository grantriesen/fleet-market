import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Uses service role since manufacturers don't have Supabase auth yet
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { partner_id, site_id, items, notes } = body;

    // ── Validate required fields ──
    if (!partner_id || !site_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'partner_id, site_id, and items[] are required' },
        { status: 400 }
      );
    }

    // ── Verify partner exists ──
    const { data: partner, error: partnerErr } = await supabase
      .from('manufacturer_partners')
      .select('id, company_name')
      .eq('id', partner_id)
      .single();

    if (partnerErr || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // ── Verify site exists ──
    const { data: site, error: siteErr } = await supabase
      .from('sites')
      .select('id, site_name')
      .eq('id', site_id)
      .single();

    if (siteErr || !site) {
      return NextResponse.json({ error: 'Dealer site not found' }, { status: 404 });
    }

    // ── Generate shipment code ──
    const { data: codeResult } = await supabase.rpc('generate_shipment_code');
    const shipmentCode = codeResult || `SHP-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    // ── Calculate total item count ──
    const totalQuantity = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);

    // ── Create shipment ──
    const { data: shipment, error: shipErr } = await supabase
      .from('shipments')
      .insert({
        partner_id,
        site_id,
        shipment_code: shipmentCode,
        status: 'shipped',
        shipped_at: new Date().toISOString(),
        notes: notes || null,
        item_count: totalQuantity,
      })
      .select()
      .single();

    if (shipErr || !shipment) {
      console.error('Shipment creation error:', shipErr);
      return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
    }

    // ── Insert shipment items ──
    const shipmentItems = items.map((item: any) => ({
      shipment_id: shipment.id,
      catalog_product_id: item.catalog_product_id || null,
      title: item.title,
      model: item.model || null,
      sku: item.sku || null,
      category: item.category || null,
      description: item.description || null,
      primary_image: item.primary_image || null,
      images: item.images || [],
      specifications: item.specifications || {},
      msrp: item.msrp || null,
      dealer_cost: item.dealer_cost || null,
      quantity: item.quantity || 1,
      brand_name: item.brand_name || null,
      serial_numbers: item.serial_numbers || null,
    }));

    const { error: itemsErr } = await supabase
      .from('shipment_items')
      .insert(shipmentItems);

    if (itemsErr) {
      console.error('Shipment items error:', itemsErr);
      // Cleanup the shipment if items failed
      await supabase.from('shipments').delete().eq('id', shipment.id);
      return NextResponse.json({ error: 'Failed to add shipment items' }, { status: 500 });
    }

    // ── Build QR code URL ──
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fleetmarket.us';
    const receiveUrl = `${baseUrl}/receive/${shipment.id}`;

    return NextResponse.json({
      shipment: {
        id: shipment.id,
        shipment_code: shipmentCode,
        status: shipment.status,
        item_count: totalQuantity,
      },
      receive_url: receiveUrl,
      // QR code can be generated client-side with this URL,
      // or use a service like: https://api.qrserver.com/v1/create-qr-code/?data=URL&size=400x400
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(receiveUrl)}`,
      dealer: {
        site_id: site.id,
        site_name: site.site_name,
      },
      partner: {
        id: partner.id,
        company_name: partner.company_name,
      },
    });

  } catch (err: any) {
    console.error('Create shipment error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
