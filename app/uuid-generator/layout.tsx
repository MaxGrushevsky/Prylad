import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free UUID Generator - Generate UUID/GUID Online',
  description: 'Generate UUIDs (Universally Unique Identifiers) and GUIDs online for free. Support for UUID v1 and v4. Multiple output formats: standard, no dashes, uppercase, braces, brackets. No registration required.',
  keywords: [
    'UUID generator',
    'GUID generator',
    'UUID v1',
    'UUID v4',
    'unique identifier',
    'random UUID',
    'free UUID generator',
    'UUID validator'
  ],
  path: '/uuid-generator',
  category: 'Development Tools'
})

export default function UUIDGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

