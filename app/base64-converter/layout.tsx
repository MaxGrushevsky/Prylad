import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Base64 Encoder & Decoder - Convert Text & Images Online',
  description: 'Encode and decode Base64 strings online for free. Support for standard and URL-safe formats. Convert text or images to Base64. Auto-convert option. No registration required.',
  keywords: [
    'base64 encoder',
    'base64 decoder',
    'base64 converter',
    'base64 encode',
    'base64 decode',
    'base64 image',
    'URL-safe base64',
    'free base64 converter'
  ],
  path: '/base64-converter',
  category: 'Converters'
})

export default function Base64ConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

