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
  '/memory': '/memory',
  '/reaction': '/reaction',
  '/attention': '/attention',
  '/categories': '/categories',
  '/speedreading': '/speedreading',
  '/test-buttons': '/test-buttons',
  '/train': '/train',
  '/reaction-speed': '/reaction-speed',
  '/reaction-speed/quick-math': '/reaction-speed/quick-math'
} satisfies Pathnames<typeof locales>

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames })
