import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free JavaScript Formatter & Minifier - Format and Minify JS Online',
  description: 'Format and minify JavaScript code online for free. Beautify JS with proper indentation or compress it for production. Auto-format, customize indentation, and export to file.',
  keywords: [
    'JavaScript formatter',
    'JS formatter',
    'JavaScript minifier',
    'JS minifier',
    'format JavaScript',
    'minify JavaScript',
    'JS prettifier',
    'JavaScript beautifier',
    'free JS formatter'
  ],
  path: '/js-formatter',
  category: 'Code Tools'
})

export default function JSFormatterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}



