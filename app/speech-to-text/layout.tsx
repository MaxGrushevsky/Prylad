import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Speech to Text - Voice to Text Converter Online',
  description: 'Convert speech to text online for free. Use our voice-to-text tool with real-time transcription. Works entirely in your browser - no registration required.',
  keywords: [
    'speech to text',
    'voice to text',
    'speech recognition',
    'voice recognition',
    'dictation',
    'transcription',
    'online speech to text',
    'free speech to text',
    'voice typing',
    'speech converter',
    'audio to text',
    'voice transcription',
    'speech to text converter',
    'dictation tool',
    'voice to text free'
  ],
  path: '/speech-to-text',
  category: 'Text Tools'
})

export default function SpeechToTextLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


