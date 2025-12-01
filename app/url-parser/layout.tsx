import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free URL Parser & Analyzer - Parse URLs Online',
  description: 'Parse and analyze URLs online for free. Extract protocol, domain, path, query parameters, and hash from any URL. Perfect for web developers and API testing. No registration required.',
  keywords: [
    'URL parser',
    'URL analyzer',
    'parse URL',
    'URL components',
    'query parameter parser',
    'URL structure',
    'URL breakdown',
    'free URL parser',
    'URL decoder',
    'URL inspector'
  ],
  path: '/url-parser',
  category: 'Network'
})

export default function URLParserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}



