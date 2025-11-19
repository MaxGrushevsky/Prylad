import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free JSON Formatter & Validator - Format, Minify & Validate JSON Online',
  description: 'Format, minify, and validate JSON online for free. Auto-format, sort keys, customize indentation. Real-time validation with detailed statistics. Export to file. No registration required.',
  keywords: [
    'JSON formatter',
    'JSON validator',
    'JSON minifier',
    'JSON beautifier',
    'format JSON',
    'validate JSON',
    'JSON prettifier',
    'free JSON formatter'
  ],
  path: '/json-formatter',
  category: 'Code Tools'
})

export default function JSONFormatterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


