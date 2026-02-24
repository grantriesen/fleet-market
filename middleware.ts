import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  // Get all supabase-related cookies for debugging
  const allCookies = request.cookies.getAll()
  const sbCookies = allCookies.filter(c => c.name.includes('supabase') || c.name.includes('sb-'))
  
  console.log('=== MIDDLEWARE DEBUG ===')
  console.log('Path:', pathname)
  console.log('Has session:', !!session)
  console.log('Session user:', session?.user?.email || 'none')
  console.log('Supabase cookies:', sbCookies.map(c => `${c.name}=${c.value.slice(0, 20)}...`))
  console.log('All cookie names:', allCookies.map(c => c.name))

  // Protect authenticated routes
  if (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/customize') ||
      pathname.startsWith('/deploy') ||
      pathname.startsWith('/onboarding')) {
    if (!session) {
      console.log('>>> BLOCKED: No session on protected route, redirecting to /auth/login')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    console.log('>>> ALLOWED: Session exists for protected route')

    // If user hits /dashboard, check if they have a site — if not, send to onboarding
    if (pathname.startsWith('/dashboard')) {
      const { data: sites } = await supabase
        .from('sites')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1)

      console.log('>>> Dashboard check - has sites:', sites?.length || 0)
      if (!sites || sites.length === 0) {
        console.log('>>> REDIRECT: No sites, sending to /onboarding')
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }
  }

  // Redirect logged-in users away from auth pages (but NOT to dashboard blindly)
  if (pathname.startsWith('/auth') && session) {
    const { data: sites } = await supabase
      .from('sites')
      .select('id')
      .eq('user_id', session.user.id)
      .limit(1)

    console.log('>>> Auth page with session - has sites:', sites?.length || 0)
    if (sites && sites.length > 0) {
      console.log('>>> REDIRECT: Has sites, sending to /dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      console.log('>>> REDIRECT: No sites, sending to /onboarding')
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  console.log('>>> PASSTHROUGH: No redirect needed')
  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/customize/:path*', '/deploy/:path*', '/auth/:path*', '/onboarding/:path*'],
}
