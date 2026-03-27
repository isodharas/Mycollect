export { default } from 'next-auth/middleware'
export const config = {
  matcher: ['/dashboard/:path*', '/bins/:path*', '/routes/:path*', '/analytics/:path*', '/alerts/:path*', '/reports/:path*']
}
