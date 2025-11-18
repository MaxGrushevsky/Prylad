import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Text Case Converter - Convert Text Case Online',
  description: 'Convert text case online for free. Support for uppercase, lowercase, title case, sentence case, camelCase, PascalCase, snake_case, kebab-case, and more. Export to file. No registration required.',
  keywords: [
    'text case converter',
    'case converter',
    'uppercase converter',
    'lowercase converter',
    'camelCase converter',
    'PascalCase converter',
    'snake_case converter',
    'kebab-case converter',
    'free case converter'
  ],
  path: '/text-case',
  category: 'Text Tools'
})

export default function TextCaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

