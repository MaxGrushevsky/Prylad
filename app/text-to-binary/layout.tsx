import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Text to Binary / Binary to Text Converter Online',
  description: 'Convert text to binary code and binary to text online for free. Support for ASCII, Unicode characters. Multiple formatting options (spaced, no spaces, 8-bit groups). Real-time conversion. No registration required.',
  keywords: [
    'text to binary',
    'binary converter',
    'ascii to binary',
    'binary to text',
    'text binary converter',
    'binary code converter',
    'convert text to binary',
    'convert binary to text',
    'binary encoder',
    'binary decoder',
    'text encoder',
    'text decoder',
    'free binary converter',
    'online binary converter',
    'unicode to binary',
    'ascii binary'
  ],
  path: '/text-to-binary',
  category: 'Converters'
})

export default function TextToBinaryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

