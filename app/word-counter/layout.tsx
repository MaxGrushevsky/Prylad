import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Word Counter - Count Words, Characters & Text Analysis Online',
  description: 'Count words, characters, paragraphs, sentences, and analyze text with detailed statistics. Free online word counter with frequency analysis, readability score (Flesch), text analyzer, reading time, and export options. No registration required.',
  keywords: [
    'word counter',
    'character counter',
    'word count',
    'character count',
    'reading time calculator',
    'text statistics',
    'text analyzer',
    'text analysis',
    'word analyzer',
    'word frequency',
    'character frequency',
    'frequency counter',
    'word frequency counter',
    'character frequency counter',
    'text frequency analysis',
    'readability score',
    'flesch reading ease',
    'readability calculator',
    'text statistics analyzer',
    'free word counter'
  ],
  path: '/word-counter',
  category: 'Text Tools'
})

export default function WordCounterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


