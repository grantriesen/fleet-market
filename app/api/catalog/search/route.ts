export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const manufacturer = searchParams.get('manufacturer') || '';
    const category = searchParams.get('category') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    if (!query && !manufacturer && !category) {
      return NextResponse.json({ results: [] });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: { get() { return undefined; }, set() {}, remove() {} },
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );

    let dbQuery = supabase
      .from('product_catalog')
      .select('id, sku, product_name, manufacturer, category, subcategory, short_description, full_description, primary_image, image_urls, specs')
      .limit(limit);

    // Full-text search if query provided
    if (query) {
      // Search across SKU, name, manufacturer, and description
      dbQuery = dbQuery.or(
        `sku.ilike.%${query}%,product_name.ilike.%${query}%,manufacturer.ilike.%${query}%,short_description.ilike.%${query}%`
      );
    }

    // Optional filters
    if (manufacturer) {
      dbQuery = dbQuery.ilike('manufacturer', `%${manufacturer}%`);
    }
    if (category) {
      dbQuery = dbQuery.ilike('category', `%${category}%`);
    }

    dbQuery = dbQuery.order('manufacturer').order('product_name');

    const { data, error } = await dbQuery;

    if (error) {
      console.error('Catalog search error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    return NextResponse.json({ results: data || [] });
  } catch (error: any) {
    console.error('Catalog API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
