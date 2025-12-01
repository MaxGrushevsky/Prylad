import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free URL Tools - Encoder, Parser & Query Builder Online',
  description: 'All-in-one URL tools: encode/decode URLs, parse URL components, and build query strings. Free online URL encoder, decoder, parser, and query string builder for developers. No registration required.',
  keywords: [
    'URL encoder',
    'URL decoder',
    'URL parser',
    'query string builder',
    'URL encoding',
    'URL decoding',
    'parse URL',
    'URL components',
    'query parameters',
    'URL tools',
    'free URL encoder',
    'URL analyzer'
  ],
  path: '/url-tools',
  category: 'QR/Network'
})

export default function URLToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}



