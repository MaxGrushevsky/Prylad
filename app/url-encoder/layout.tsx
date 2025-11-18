import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free URL Encoder & Decoder - Encode/Decode URLs Online',
  description: 'Encode and decode URLs online for free. Convert special characters, spaces, and Unicode to URL-encoded format. Support for encodeURI and encodeURIComponent. No registration required.',
  keywords: [
    'URL encoder',
    'URL decoder',
    'URL encoding',
    'percent encoding',
    'encodeURI',
    'encodeURIComponent',
    'URL encode',
    'URL decode',
    'free URL encoder'
  ],
  path: '/url-encoder',
  category: 'Converters'
})

export default function URLEncoderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
