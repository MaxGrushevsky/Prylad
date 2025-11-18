import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Placeholder Image Generator - Create Custom Placeholder Images Online',
  description: 'Generate placeholder images of any size online for free. Customize colors, text, styles, and patterns. Export as PNG or JPG. Perfect for web development and design mockups.',
  keywords: [
    'placeholder generator',
    'placeholder image',
    'image placeholder',
    'placeholder image generator',
    'dummy image',
    'mockup image',
    'web development placeholder',
    'free placeholder generator'
  ],
  path: '/placeholder-generator',
  category: 'Design Tools'
})

export default function PlaceholderGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

