import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Text Tools - Case Converter, Cleaner & Reverser',
  description: 'All-in-one text tools: convert text case, clean text, and reverse text. Free online text manipulation tools.',
  keywords: [
    'text case converter',
    'text cleaner',
    'text reverser',
    'case converter',
    'text tools',
    'free text tools'
  ],
  path: '/text-tools',
  category: 'Text'
})

export default function TextToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


