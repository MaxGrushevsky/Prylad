import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Text Diff Tool - Compare & Find Differences Online',
  description: 'Compare two texts and find differences online for free. Line-by-line, word-by-word, or character-by-character comparison. Export results. No registration required.',
  keywords: [
    'text diff',
    'text comparison',
    'diff tool',
    'text difference',
    'compare text',
    'text diff online',
    'diff checker',
    'free text diff'
  ],
  path: '/text-diff',
  category: 'Text Tools'
})

export default function TextDiffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

