import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PASSWORD_COOKIE = 'fm_site_auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const formData = await request.formData();
  const submitted = formData.get('password') as string;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { get() { return undefined; }, set() {}, remove() {} },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

  const { data: site } = await supabase
    .from('sites')
    .select('id, site_password')
    .eq('slug', params.slug)
    .single();

  if (!site) {
    return NextResponse.redirect(new URL(`/site/${params.slug}`, request.url));
  }

  const pageUrl = new URL(`/site/${params.slug}`, request.url);

  if (submitted === site.site_password) {
    // Correct — set auth cookie and redirect to site
    const response = NextResponse.redirect(pageUrl);
    response.cookies.set(`${PASSWORD_COOKIE}_${site.id}`, site.site_password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return response;
  }

  // Wrong password — redirect back with error flag
  pageUrl.searchParams.set('auth_error', '1');
  return NextResponse.redirect(pageUrl);
}
