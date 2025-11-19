import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Font Pairing Generator - Google Fonts Combinations Tool',
  description: 'Discover beautiful font pairings from Google Fonts. Preview heading and body text combinations. Get CSS code and import links. No registration required.',
  keywords: [
    'font pairing generator',
    'Google Fonts',
    'font combinations',
    'typography pairs',
    'font pairing tool',
    'font matching',
    'free font pairing'
  ],
  path: '/font-pairing-generator',
  category: 'CSS/Design'
})

export default function FontPairingGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

