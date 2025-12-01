import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Character Reference - ASCII Table, Unicode Lookup & Emoji Picker',
  description: 'All-in-one character reference tool: ASCII table with decimal/hex/octal/binary, Unicode character lookup with code points and escape sequences, and emoji picker with categories. Free online character reference for developers.',
  keywords: [
    'character reference',
    'ASCII table',
    'Unicode lookup',
    'emoji picker',
    'ASCII codes',
    'Unicode characters',
    'character codes',
    'emoji search',
    'free character reference',
    'ASCII converter',
    'Unicode converter',
    'character lookup'
  ],
  path: '/character-reference',
  category: 'Text Tools'
})

export default function CharacterReferenceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


