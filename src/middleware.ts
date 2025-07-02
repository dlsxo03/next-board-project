import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

// 공개 경로 목록 (로그인 없이 접근 가능)
const publicRoutes = [
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/auth/forgot-password',
  '/api/auth'
]

// 관리자 전용 경로 목록
const adminRoutes = [
  '/admin',
  '/notices/create'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 정적 파일, 이미지 등의 요청은 무시
  if (
    pathname.includes('/_next/') ||
    pathname.includes('/images/') ||
    pathname.includes('/uploads/') ||
    pathname.includes('.') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }
  
  // API 요청은 NextAuth가 처리하도록 무시 (단, /api/auth 이외의 API 요청)
  if (pathname.includes('/api/') && !pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }
  
  // NextAuth 세션 토큰 가져오기
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  // 공개 경로 체크
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  // 관리자 전용 경로 체크
  const isAdminRoute = adminRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  // 세션이 없고 공개 경로가 아닌 경우 - 로그인 페이지로 리디렉션
  if (!token && !isPublicRoute) {
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }
  
  // 관리자가 아닌 사용자가 관리자 전용 경로로 접근하려는 경우 - 대시보드로 리디렉션
  if (token && isAdminRoute && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // 이미 로그인한 사용자가 로그인/회원가입 페이지로 접근하려는 경우 - 대시보드로 리디렉션
  if (token && (pathname === '/auth/signin' || pathname === '/auth/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

// 미들웨어가 모든 경로에 적용되도록 설정
export const config = {
  matcher: [
    /*
     * 모든 경로에 미들웨어 적용 
     * (/_next/, /api/, /static/ 등은 자동으로 제외됨)
     */
    '/((?!_next|static|favicon.ico).*)'
  ],
} 