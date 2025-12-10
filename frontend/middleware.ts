import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const appTarget = process.env.APP_TARGET
  const { pathname } = req.nextUrl

  // Allow Next.js internals and direct file assets
  const isInternal = pathname.startsWith('/_next') || pathname === '/favicon.ico'
  const isFile = pathname.includes('.')
  if (isInternal || isFile) {
    return NextResponse.next()
  }

  if (appTarget === 'doctor') {
    // On doctor instance, root should show doctor login
    if (pathname === '/') {
      const url = req.nextUrl.clone()
      url.pathname = '/doctor/login'
      return NextResponse.rewrite(url)
    }
    // Rewrite any non-doctor path to doctor namespace
    if (!pathname.startsWith('/doctor')) {
      const url = req.nextUrl.clone()
      url.pathname = `/doctor${pathname}`
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  // Patient instance: block /doctor and /doctor/*, allow /doctors
  if (pathname === '/doctor' || pathname.startsWith('/doctor/')) {
    return new NextResponse('Not Found', { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
