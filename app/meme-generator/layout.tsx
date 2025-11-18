import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Meme Generator - Create Memes Online for Free',
  description: 'Create memes online for free. Upload your own images or use popular meme templates. Add text, customize fonts, colors, and download your memes instantly.',
  keywords: [
    'meme generator',
    'meme maker',
    'create memes',
    'meme creator',
    'meme templates',
    'funny memes',
    'meme maker online',
    'free meme generator',
    'meme editor'
  ],
  path: '/meme-generator',
  category: 'Entertainment'
})

export default function MemeGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

