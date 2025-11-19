import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Word Counter - Count Words, Characters & Reading Time Online',
  description: 'Count words, characters, paragraphs, sentences, and lines online for free. Calculate reading time, character statistics, and average word length. Export to file. No registration required.',
  keywords: [
    'word counter',
    'character counter',
    'word count',
    'character count',
    'reading time calculator',
    'text statistics',
    'word analyzer',
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


