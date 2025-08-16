import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

// 支持的语言列表
export const locales = ['zh', 'en'] as const
export type Locale = typeof locales[number]

// 默认语言
export const defaultLocale: Locale = 'zh'

// 语言配置
export const languageConfig = {
  zh: { name: '中文', flag: '🇨🇳' },
  en: { name: 'English', flag: '🇺🇸' }
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
