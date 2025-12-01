import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Query String Builder - URL Parameter Builder Online',
  description: 'Build and edit URL query strings. Add, remove, and modify URL parameters. Parse existing query strings. Free online query string builder tool for developers. No registration required.',
  keywords: [
    'query string builder',
    'url parameter builder',
    'query string generator',
    'url query builder',
    'query parameter builder',
    'url query string',
    'build query string',
    'query string editor',
    'url params builder',
    'query string parser'
  ],
  path: '/query-string-builder',
  category: 'QR/Network'
})

export default function QueryStringBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}



