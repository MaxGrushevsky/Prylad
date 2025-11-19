import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free XML Formatter & Validator - Format, Minify & Validate XML Online',
  description: 'Format, minify, and validate XML online for free. Auto-format XML with proper indentation, validate structure, and check for errors. No registration required.',
  keywords: [
    'XML formatter',
    'XML validator',
    'XML minifier',
    'XML beautifier',
    'format XML',
    'validate XML',
    'XML prettifier',
    'free XML formatter'
  ],
  path: '/xml-formatter',
  category: 'Code Tools'
})

export default function XMLFormatterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


