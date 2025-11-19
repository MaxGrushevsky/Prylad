import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free ASCII Art Generator - Create ASCII Art from Text and Images',
  description: 'Generate ASCII art from text or images online for free. Choose from multiple styles, customize colors, and export as text or HTML. Perfect for code comments, art projects, and retro aesthetics.',
  keywords: [
    'ascii art generator',
    'ascii art maker',
    'text to ascii',
    'image to ascii',
    'ascii converter',
    'ascii art creator',
    'ascii generator',
    'free ascii art',
    'ascii art from text',
    'ascii art from image'
  ],
  path: '/ascii-art',
  category: 'Design Tools'
})

export default function ASCIIArtLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


