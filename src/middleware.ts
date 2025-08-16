import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { locales, defaultLocale } from './i18n'
import { localePrefix } from './navigation'

type CustomMiddleware = (req: NextRequest) => Promise<NextRequest>
const customMiddleware: CustomMiddleware = async req => {
  console.log('Custom middleware executed before next-intl')
  return req
}

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix
})

export default async function middleware(
  req: NextRequest
): Promise<ReturnType<typeof intlMiddleware>> {
  await customMiddleware(req)
  return intlMiddleware(req)
}

export const config = {
  matcher: [
    // 匹配所有国际化路径
    '/',
    '/(zh|en|fr|ja|de|ru|es|fa|ar)/:path*',
    // 排除API路由、静态文件等
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ]
}
