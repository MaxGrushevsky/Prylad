import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Lorem Ipsum Generator - Generate Dummy Text Online',
  description: 'Generate Lorem Ipsum placeholder text online for free. Create paragraphs, words, bytes, or lists. Customize format and options. Export to file. No registration required.',
  keywords: [
    'lorem ipsum generator',
    'lorem ipsum',
    'dummy text generator',
    'placeholder text',
    'latin text generator',
    'text filler',
    'free lorem ipsum generator',
    'random text generator'
  ],
  path: '/lorem-generator',
  category: 'Text Tools'
})

export default function LoremGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

