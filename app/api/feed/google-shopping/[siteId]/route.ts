import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Use service role to bypass RLS since this is a public feed endpoint
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function mapCondition(condition: string): string {
  // Google accepts: new, refurbished, used
  const map: Record<string, string> = {
    'new': 'new',
    'used': 'used',
    'refurbished': 'refurbished',
    'demo': 'used', // Map demo to used for Google
  };
  return map[condition] || 'new';
}

function mapAvailability(status: string, stockQty: number): string {
  // Google accepts: in_stock, out_of_stock, preorder, backorder
  if (status === 'sold') return 'out_of_stock';
  if (status === 'on_hold') return 'out_of_stock';
  if (status === 'pending') return 'preorder';
  if (stockQty <= 0) return 'out_of_stock';
  return 'in_stock';
}

function mapCategory(category: string): string {
  // Map Fleet Market categories to Google product taxonomy
  // https://support.google.com/merchants/answer/6324436
  const map: Record<string, string> = {
    'Mowers': 'Business & Industrial > Agriculture > Landscaping > Lawn Mowers',
    'Tractors': 'Business & Industrial > Agriculture > Tractors',
    'Trimmers & Edgers': 'Business & Industrial > Agriculture > Landscaping > Trimmers & Edgers',
    'Blowers': 'Business & Industrial > Agriculture > Landscaping > Leaf Blowers',
    'Chainsaws': 'Hardware > Tools > Cutting Tools > Chainsaws',
    'Attachments': 'Business & Industrial > Agriculture > Agricultural Machinery Accessories',
    'Parts & Accessories': 'Business & Industrial > Agriculture > Agricultural Machinery Accessories',
    'Utility Vehicles': 'Vehicles & Parts > Vehicle Parts & Accessories',
    'Sprayers': 'Business & Industrial > Agriculture > Landscaping > Sprayers',
    'Aerators': 'Business & Industrial > Agriculture > Landscaping > Aerators',
    'Snow Equipment': 'Business & Industrial > Agriculture > Snow Removal Equipment',
    'Other': 'Business & Industrial > Agriculture > Landscaping',
  };
  return map[category] || 'Business & Industrial > Agriculture > Landscaping';
}

export async function GET(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const { siteId } = params;

  // Load site info
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('id, site_name, subdomain, custom_domain')
    .eq('id', siteId)
    .single();

  if (siteError || !site) {
    return new NextResponse('Site not found', { status: 404 });
  }

  // Determine site URL
  const siteUrl = site.custom_domain
    ? `https://${site.custom_domain}`
    : `https://${site.subdomain}.fleetmarket.com`;

  // Load all available inventory items
  const { data: items, error: itemsError } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('site_id', siteId)
    .eq('status', 'available')
    .order('display_order', { ascending: true });

  if (itemsError) {
    return new NextResponse('Failed to load inventory', { status: 500 });
  }

  // Build XML feed
  const now = new Date().toISOString();
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(site.site_name)} - Equipment Inventory</title>
    <link>${siteUrl}</link>
    <description>Equipment inventory from ${escapeXml(site.site_name)}</description>
`;

  for (const item of (items || [])) {
    // Skip items without a title
    if (!item.title) continue;

    const productUrl = `${siteUrl}/inventory/${item.slug || item.id}`;
    const price = item.price ? `${Number(item.price).toFixed(2)} USD` : null;
    const salePrice = item.sale_price ? `${Number(item.sale_price).toFixed(2)} USD` : null;
    const availability = mapAvailability(item.status, item.stock_quantity);
    const condition = mapCondition(item.condition);
    const googleCategory = mapCategory(item.category);
    const images = item.images || [];
    const primaryImage = item.primary_image || (images.length > 0 ? images[0] : null);

    // Build description from available fields
    let description = item.description || '';
    if (item.specifications && Object.keys(item.specifications).length > 0) {
      const specs = Object.entries(item.specifications)
        .map(([k, v]) => `${k}: ${v}`)
        .join('. ');
      description = description ? `${description}. ${specs}` : specs;
    }
    if (!description) {
      description = `${item.title}${item.model ? ` - Model ${item.model}` : ''}${item.year ? ` (${item.year})` : ''}`;
    }

    xml += `    <item>
      <g:id>${escapeXml(item.id)}</g:id>
      <g:title>${escapeXml(item.title)}${item.model ? ` ${escapeXml(item.model)}` : ''}${item.year ? ` (${item.year})` : ''}</g:title>
      <g:description>${escapeXml(description.substring(0, 5000))}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:availability>${availability}</g:availability>
      <g:condition>${condition}</g:condition>
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
      <g:product_type>${escapeXml(item.category || 'Equipment')}</g:product_type>
`;

    // Price (required for most products)
    if (price) {
      xml += `      <g:price>${price}</g:price>\n`;
      if (salePrice) {
        xml += `      <g:sale_price>${salePrice}</g:sale_price>\n`;
      }
    }

    // Image
    if (primaryImage) {
      xml += `      <g:image_link>${escapeXml(primaryImage)}</g:image_link>\n`;
      // Additional images (up to 10)
      images
        .filter((img: string) => img !== primaryImage)
        .slice(0, 10)
        .forEach((img: string) => {
          xml += `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>\n`;
        });
    }

    // Brand / Manufacturer
    // If we have a manufacturer, use it; otherwise use the site name
    xml += `      <g:brand>${escapeXml(site.site_name)}</g:brand>\n`;

    // MPN (model number as manufacturer part number)
    if (item.model) {
      xml += `      <g:mpn>${escapeXml(item.model)}</g:mpn>\n`;
    }

    // SKU as identifier
    if (item.sku) {
      xml += `      <g:identifier_exists>yes</g:identifier_exists>\n`;
    } else {
      xml += `      <g:identifier_exists>no</g:identifier_exists>\n`;
    }

    // Custom labels for filtering in Google Ads
    if (item.category) {
      xml += `      <g:custom_label_0>${escapeXml(item.category)}</g:custom_label_0>\n`;
    }
    if (item.condition) {
      xml += `      <g:custom_label_1>${escapeXml(item.condition)}</g:custom_label_1>\n`;
    }
    if (item.featured) {
      xml += `      <g:custom_label_2>featured</g:custom_label_2>\n`;
    }
    if (item.year) {
      xml += `      <g:custom_label_3>${item.year}</g:custom_label_3>\n`;
    }

    xml += `    </item>\n`;
  }

  xml += `  </channel>
</rss>`;

  // Return XML with proper content type and cache for 1 hour
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Feed-Generated': now,
      'X-Feed-Items': String((items || []).length),
    },
  });
}
