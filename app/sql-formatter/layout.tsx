import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free SQL Formatter - Format & Beautify SQL Queries Online',
  description: 'Format and beautify SQL queries online for free. Auto-format SQL with proper indentation, keyword capitalization, and syntax highlighting. No registration required.',
  keywords: [
    'SQL formatter',
    'SQL beautifier',
    'format SQL',
    'SQL prettifier',
    'SQL query formatter',
    'SQL syntax formatter',
    'beautify SQL',
    'free SQL formatter'
  ],
  path: '/sql-formatter',
  category: 'Code Tools'
})

export default function SQLFormatterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


