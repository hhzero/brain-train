'use client'
import { useEffect } from 'react'
import Head from 'next/head'
import { useLocale } from 'next-intl'

// SEO配置接口
export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  structuredData?: any
  noindex?: boolean
  nofollow?: boolean
  alternateLanguages?: { [locale: string]: string }
}

// 页面类型
export type PageType = 
  | 'home' 
  | 'training' 
  | 'attention' 
  | 'memory' 
  | 'cognitive-flexibility' 
  | 'emotional-management'
  | 'about'
  | 'profile'
  | 'leaderboard'

// 默认SEO配置
const defaultSEOConfigs: Record<PageType, Partial<SEOConfig>> = {
  home: {
    title: '脑力训练平台 - 提升认知能力的科学训练',
    description: '专业的脑力训练平台，通过科学的认知训练提升注意力、记忆力、认知灵活性和情绪管理能力。个性化训练方案，实时进度跟踪。',
    keywords: ['脑力训练', '认知训练', '注意力训练', '记忆力训练', '认知灵活性', '情绪管理', '大脑训练'],
    ogType: 'website'
  },
  training: {
    title: '训练中心 - 个性化脑力训练方案',
    description: '探索多样化的脑力训练模块，包括注意力挑战、认知灵活性训练营、情绪管理训练等。科学设计，循序渐进。',
    keywords: ['训练中心', '脑力训练模块', '个性化训练', '认知提升'],
    ogType: 'website'
  },
  attention: {
    title: '多维注意力挑战 - 提升专注力和反应速度',
    description: '沉浸式3D环境下的注意力训练，多感官融合体验，自适应难度调节，全面提升注意力各个维度。',
    keywords: ['注意力训练', '专注力提升', '反应速度', '3D训练环境', '多感官训练'],
    ogType: 'article'
  },
  memory: {
    title: '记忆力训练 - 科学提升记忆能力',
    description: '基于认知科学的记忆力训练方法，包括工作记忆、长期记忆、空间记忆等多种训练模式。',
    keywords: ['记忆力训练', '工作记忆', '长期记忆', '空间记忆', '记忆技巧'],
    ogType: 'article'
  },
  'cognitive-flexibility': {
    title: '认知灵活性训练营 - 提升思维敏捷性',
    description: '通过任务切换、Stroop测试、工作记忆更新等训练，提升认知灵活性和思维转换能力。职场模拟、学习场景应有尽有。',
    keywords: ['认知灵活性', '思维训练', '任务切换', 'Stroop测试', '工作记忆', '职场模拟'],
    ogType: 'article'
  },
  'emotional-management': {
    title: '情绪管理训练 - 融合中华文化的情绪调节',
    description: '结合太极、禅修等中华传统文化的情绪管理训练，包括情绪识别、压力缓解、社交情商提升等模块。',
    keywords: ['情绪管理', '情绪调节', '压力缓解', '社交情商', '太极', '禅修', '中华文化'],
    ogType: 'article'
  },
  about: {
    title: '关于我们 - 专业的脑力训练平台',
    description: '了解我们的使命、愿景和团队。基于科学研究的脑力训练方法，帮助用户全面提升认知能力。',
    keywords: ['关于我们', '脑力训练平台', '认知科学', '团队介绍'],
    ogType: 'website'
  },
  profile: {
    title: '个人中心 - 训练进度和成就管理',
    description: '查看您的训练进度、成就徽章、能力评估和个性化推荐。持续跟踪认知能力提升。',
    keywords: ['个人中心', '训练进度', '成就系统', '能力评估', '个性化推荐'],
    ogType: 'website'
  },
  leaderboard: {
    title: '排行榜 - 与全球用户一起挑战',
    description: '查看全球排行榜，与其他用户比较训练成果，参与挑战赛，获得更多成就。',
    keywords: ['排行榜', '全球排名', '挑战赛', '竞技训练', '社交功能'],
    ogType: 'website'
  }
}

// 生成结构化数据
function generateStructuredData(pageType: PageType, config: SEOConfig) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '脑力训练平台',
    description: config.description,
    url: typeof window !== 'undefined' ? window.location.origin : '',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY'
    },
    author: {
      '@type': 'Organization',
      name: '脑力训练平台团队'
    }
  }

  // 根据页面类型添加特定的结构化数据
  switch (pageType) {
    case 'training':
    case 'attention':
    case 'memory':
    case 'cognitive-flexibility':
    case 'emotional-management':
      return {
        ...baseStructuredData,
        '@type': 'Course',
        courseMode: 'online',
        educationalLevel: 'beginner',
        teaches: config.keywords?.join(', '),
        provider: {
          '@type': 'Organization',
          name: '脑力训练平台'
        }
      }
    
    case 'leaderboard':
      return {
        ...baseStructuredData,
        '@type': 'Game',
        genre: 'Educational Game',
        gamePlatform: 'Web Browser'
      }
    
    default:
      return baseStructuredData
  }
}

// 生成hreflang标签
function generateHreflangTags(alternateLanguages?: { [locale: string]: string }) {
  if (!alternateLanguages) return []
  
  return Object.entries(alternateLanguages).map(([locale, url]) => (
    <link key={locale} rel="alternate" hrefLang={locale} href={url} />
  ))
}

interface SEOOptimizationProps {
  pageType: PageType
  customConfig?: Partial<SEOConfig>
  children?: React.ReactNode
}

export default function SEOOptimization({ 
  pageType, 
  customConfig = {}, 
  children 
}: SEOOptimizationProps) {
  const locale = useLocale()
  
  // 合并默认配置和自定义配置
  const config: SEOConfig = {
    ...defaultSEOConfigs[pageType],
    ...customConfig,
    // 根据语言环境调整标题和描述
    title: customConfig.title || 
           (locale === 'en' ? `Brain Training Platform - ${defaultSEOConfigs[pageType].title}` : 
            defaultSEOConfigs[pageType].title || ''),
    description: customConfig.description || defaultSEOConfigs[pageType].description || ''
  }

  // 生成结构化数据
  const structuredData = config.structuredData || generateStructuredData(pageType, config)
  
  // 生成完整的URL
  const fullUrl = typeof window !== 'undefined' ? 
    `${window.location.origin}${config.canonical || window.location.pathname}` : ''
  
  // 生成OG图片URL
  const ogImageUrl = config.ogImage || 
    `${typeof window !== 'undefined' ? window.location.origin : ''}/images/og-default.jpg`

  useEffect(() => {
    // 动态设置页面标题
    if (config.title) {
      document.title = config.title
    }
    
    // 添加结构化数据
    if (structuredData) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(structuredData)
      document.head.appendChild(script)
      
      return () => {
        document.head.removeChild(script)
      }
    }
  }, [config.title, structuredData])

  return (
    <>
      <Head>
        {/* 基础元数据 */}
        <title>{config.title}</title>
        <meta name="description" content={config.description} />
        {config.keywords && (
          <meta name="keywords" content={config.keywords.join(', ')} />
        )}
        
        {/* 规范链接 */}
        {config.canonical && (
          <link rel="canonical" href={config.canonical} />
        )}
        
        {/* 机器人指令 */}
        <meta name="robots" content={
          `${config.noindex ? 'noindex' : 'index'},${config.nofollow ? 'nofollow' : 'follow'}`
        } />
        
        {/* Open Graph */}
        <meta property="og:title" content={config.title} />
        <meta property="og:description" content={config.description} />
        <meta property="og:type" content={config.ogType || 'website'} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:site_name" content="脑力训练平台" />
        <meta property="og:locale" content={locale === 'en' ? 'en_US' : 'zh_CN'} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content={config.twitterCard || 'summary_large_image'} />
        <meta name="twitter:title" content={config.title} />
        <meta name="twitter:description" content={config.description} />
        <meta name="twitter:image" content={ogImageUrl} />
        
        {/* 移动端优化 */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0891b2" />
        
        {/* PWA相关 */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        
        {/* 预连接重要域名 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* 多语言支持 */}
        {generateHreflangTags(config.alternateLanguages)}
        
        {/* 性能优化 */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </Head>
      
      {children}
    </>
  )
}

// 导出常用的SEO钩子
export function useSEO(pageType: PageType, customConfig?: Partial<SEOConfig>) {
  const locale = useLocale()
  
  const config = {
    ...defaultSEOConfigs[pageType],
    ...customConfig
  }
  
  return {
    config,
    locale,
    generateStructuredData: () => generateStructuredData(pageType, config as SEOConfig)
  }
}

// 导出页面类型常量
export const PAGE_TYPES = {
  HOME: 'home' as const,
  TRAINING: 'training' as const,
  ATTENTION: 'attention' as const,
  MEMORY: 'memory' as const,
  COGNITIVE_FLEXIBILITY: 'cognitive-flexibility' as const,
  EMOTIONAL_MANAGEMENT: 'emotional-management' as const,
  ABOUT: 'about' as const,
  PROFILE: 'profile' as const,
  LEADERBOARD: 'leaderboard' as const
}