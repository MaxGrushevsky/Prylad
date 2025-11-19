import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Transliteration Tool - Convert Cyrillic to Latin Online',
  description: 'Convert between Cyrillic and Latin scripts online for free. Real-time transliteration with auto-convert option. Export results. No registration required.',
  keywords: [
    'transliteration',
    'cyrillic to latin',
    'latin to cyrillic',
    'russian transliteration',
    'cyrillic converter',
    'transliterate',
    'cyrillic keyboard',
    'free transliteration'
  ],
  path: '/transliteration',
  category: 'Text Tools'
})

export default function TransliterationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


