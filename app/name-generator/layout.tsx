import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Name Generator - Generate Random Names & Nicknames Online',
  description: 'Generate random names and nicknames online for free. Choose from modern, classic, fantasy, or sci-fi styles. Generate full names or gaming nicknames. Export to file. No registration required.',
  keywords: [
    'name generator',
    'random name generator',
    'nickname generator',
    'character name generator',
    'fantasy name generator',
    'gaming name generator',
    'free name generator',
    'random names'
  ],
  path: '/name-generator',
  category: 'Generators'
})

export default function NameGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


