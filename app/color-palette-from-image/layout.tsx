import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Color Palette from Image - Extract Colors from Photos Online',
  description: 'Extract color palette from images online. Upload an image and get dominant colors in HEX, RGB, and HSL formats. Export palette for design projects. No registration required.',
  keywords: [
    'color palette from image',
    'extract colors from image',
    'image color picker',
    'color extractor',
    'palette generator',
    'dominant colors',
    'free color palette'
  ],
  path: '/color-palette-from-image',
  category: 'Colors'
})

export default function ColorPaletteFromImageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

