import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free YAML Formatter & Validator - Format, Minify & Validate YAML Online',
  description: 'Format, minify, and validate YAML online for free. Auto-format YAML with proper indentation, convert YAML to JSON and back. No registration required.',
  keywords: [
    'YAML formatter',
    'YAML validator',
    'YAML minifier',
    'YAML beautifier',
    'format YAML',
    'validate YAML',
    'YAML to JSON',
    'JSON to YAML',
    'free YAML formatter'
  ],
  path: '/yaml-formatter',
  category: 'Code Tools'
})

export default function YAMLFormatterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


