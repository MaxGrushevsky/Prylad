import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Text Reverser - Reverse Text, Words, and Sentences Online',
  description: 'Reverse text, words, sentences, and characters. Flip text backwards, reverse word order, or invert character order. Free online text reverser tool. No registration required.',
  keywords: [
    'reverse text',
    'text reverser',
    'flip text',
    'text inverter',
    'reverse words',
    'backwards text',
    'invert text',
    'reverse string',
    'text flip',
    'mirror text'
  ],
  path: '/text-reverser',
  category: 'Text Tools'
})

export default function TextReverserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

