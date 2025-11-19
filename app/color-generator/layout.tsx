import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Color Generator - Generate Random Colors & Palettes Online',
  description: 'Generate random colors and harmonious color palettes online for free. Create complementary, triadic, analogous, and monochromatic color schemes. Export to CSS, TXT, or JSON. No registration required.',
  keywords: [
    'color generator',
    'random color',
    'color palette generator',
    'color scheme generator',
    'complementary colors',
    'triadic colors',
    'analogous colors',
    'monochromatic colors',
    'free color generator'
  ],
  path: '/color-generator',
  category: 'Design Tools'
})

export default function ColorGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


