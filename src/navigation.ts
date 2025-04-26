'use client'
import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation'
import { locales } from './i18n'

export const localePrefix = 'always'

export const pathnames = {
  '/': '/',
  '/about': '/about',
  '/games/memory-training': '/games/memory-training',
  '/games/reaction-speed': '/games/reaction-speed',
  '/games/attention-training': '/games/attention-training',
  '/categories': '/categories',
  '/training': '/training'
} satisfies Pathnames<typeof locales>

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames })
