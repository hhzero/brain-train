'use client'
import { Link } from '@/navigation'
import { useTranslations } from 'next-intl'
import { FC, useState, useEffect } from 'react'
import GithubIcon from '../../icons/github'
import LogoIcon from '../../icons/logo'
import LangSwitcher from './LangSwitcher'
import ThemeSwitch from './ThemeSwitch'
import UserMenu from './UserMenu'

import { usePathname } from 'next/navigation'

interface Props {
  locale: string
}
export const Header: FC<Props> = ({ locale }) => {
  const t = useTranslations('')
  const [isGamesMenuOpen, setIsGamesMenuOpen] = useState(false)

  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  // 确保在客户端渲染时才应用动态样式，避免hydration警告
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <div className='mx-auto flex max-w-screen-2xl flex-row items-center justify-between p-5 z-[200] relative'>
      <Link href='/'>
        <div className='flex flex-row items-center'>
          <div className='mb-2 h-14 w-14'>
            <LogoIcon />
          </div>
          <strong className='mx-2 select-none text-white'>Zero Brain</strong>
        </div>
      </Link>
      <div className='flex flex-row items-center gap-3'>
        <nav className='mr-10 inline-flex gap-5'>
          <Link href='/' className={`text-white hover:text-cyan-300 transition-colors${isClient && (pathname === `/${locale}` || pathname === `/${locale}/`) ? ' active' : ''}`}>
            {t('navigation.home')}
          </Link>
          
          <Link href={`/memory`} className={`text-white hover:text-cyan-300 transition-colors${isClient && pathname === `/${locale}/memory` ? ' active' : ''}`}>
            {t('navigation.memory')}
          </Link>
          <Link href={`/attention`} className={`text-white hover:text-cyan-300 transition-colors${isClient && pathname === `/${locale}/attention` ? ' active' : ''}`}>
            {t('navigation.attention')}
          </Link>

          <Link href={`/reaction-speed`} className={`text-white hover:text-cyan-300 transition-colors${isClient && pathname.includes('/reaction-speed') ? ' active' : ''}`}>
            {t('navigation.reactionSpeed')}
          </Link>

          <Link href={`/about`} className={`text-white hover:text-cyan-300 transition-colors${isClient && pathname === `/${locale}/about` ? ' active' : ''}`}>
            {t('navigation.about')}
          </Link>
          
          {/* <a href=''>{t('Support')}</a> */}
          {/* <a href=''>{t('Other')}</a> */}
        </nav>
        {/* 这是主题按钮，后续这里也需要启用起来
         <ThemeSwitch /> */}
        <LangSwitcher />
        <UserMenu />
      </div>
    </div>
  )
}
