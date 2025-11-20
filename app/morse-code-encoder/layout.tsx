import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Morse Code Encoder/Decoder - Morse Code Translator Online',
  description: 'Encode and decode Morse code. Convert text to Morse code and Morse code to text. Free online Morse code translator with audio playback. No registration required.',
  keywords: [
    'morse code translator',
    'morse code converter',
    'morse code encoder',
    'morse code decoder',
    'morse code generator',
    'text to morse code',
    'morse code to text',
    'morse code translator online',
    'morse code audio',
    'morse code alphabet'
  ],
  path: '/morse-code-encoder',
  category: 'Converters'
})

export default function MorseCodeEncoderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

