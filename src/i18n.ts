import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

// 支持的语言列表
export const locales = [ 'en','zh', 'ja', 'ko'] as const
export type Locale = typeof locales[number]

// 默认语言
export const defaultLocale: Locale = 'en'

// 语言配置
export const languageConfig = {
  en: { name: 'English', flag: '🇺🇸' },
  zh: { name: '中文', flag: '🇨🇳' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' }
}

// Utility functions for locale handling
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocaleFromPathname(pathname: string): Locale | null {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  
  if (isValidLocale(potentialLocale)) {
    return potentialLocale;
  }
  
  return null;
}

export function removeLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (locale) {
    return pathname.replace(`/${locale}`, '') || '/';
  }
  return pathname;
}

export function addLocaleToPathname(pathname: string, locale: Locale): string {
  const cleanPathname = removeLocaleFromPathname(pathname);
  return `/${locale}${cleanPathname === '/' ? '' : cleanPathname}`;
}

export default getRequestConfig(async ({ locale }) => {
  // 验证传入的语言参数是否有效
  if (!locales.includes(locale as Locale)) notFound()

  try {
    // 从 i18n/locales 目录加载翻译文件
    const messages = (await import(`./i18n/locales/${locale}.json`)).default
    
    return {
      messages,
      timeZone: 'Asia/Shanghai'
    }
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error)
    notFound()
  }
})
