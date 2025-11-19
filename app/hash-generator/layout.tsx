import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Hash Generator - Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 Hashes Online',
  description: 'Generate cryptographic hashes online for free. Support for MD5, SHA-1, SHA-256, SHA-384, and SHA-512 algorithms. Auto-hash option. Export to file. No registration required.',
  keywords: [
    'hash generator',
    'MD5 generator',
    'SHA-256 generator',
    'SHA-1 generator',
    'SHA-512 generator',
    'cryptographic hash',
    'hash calculator',
    'free hash generator'
  ],
  path: '/hash-generator',
  category: 'Security Tools'
})

export default function HashGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


