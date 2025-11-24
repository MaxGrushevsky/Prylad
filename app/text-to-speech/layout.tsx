import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Text to Speech - Convert Text to Voice Online',
  description: 'Convert any text to speech online for free. Use our text-to-speech tool with multiple voices, languages, and speed controls. Works entirely in your browser - no registration required.',
  keywords: [
    'text to speech',
    'tts',
    'text to voice',
    'speech synthesis',
    'voice generator',
    'online tts',
    'free text to speech',
    'text reader',
    'speak text',
    'voice synthesizer',
    'text to audio',
    'read aloud',
    'text to speech converter',
    'tts online',
    'text to speech free'
  ],
  path: '/text-to-speech',
  category: 'Text Tools'
})

export default function TextToSpeechLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


