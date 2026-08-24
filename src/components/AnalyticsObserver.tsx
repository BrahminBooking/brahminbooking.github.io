'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { track } from '@/lib/analytics'

export function AnalyticsObserver() {
  const pathname = usePathname()
  useEffect(() => {
    if (pathname === '/panchang') track('panchang_opened', { route: pathname })
    else if (pathname.startsWith('/pujas/')) track('puja_opened', { route: pathname, content_slug: pathname.split('/')[2] })
    else if (pathname.startsWith('/festivals/')) track('festival_opened', { route: pathname, content_slug: pathname.split('/')[2] })
    else if (pathname === '/booking/requested') track('optional_account_cta_shown', { route: pathname })
  }, [pathname])
  return null
}
