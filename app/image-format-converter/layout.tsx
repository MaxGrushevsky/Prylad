import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Image Format Converter - PNG, JPG, WebP, SVG Converter Online',
  description: 'Convert images between PNG, JPG, WebP, and SVG formats online for free. Fast, secure, and works entirely in your browser. No registration required. Convert PNG to JPG, JPG to PNG, WebP to PNG, SVG to PNG, and more.',
  keywords: [
    'image format converter',
    'png to jpg',
    'jpg to png',
    'webp converter',
    'svg converter',
    'image converter',
    'format converter',
    'png converter',
    'jpg converter',
    'webp to png',
    'png to webp',
    'svg to png',
    'png to svg',
    'image format changer',
    'convert image format',
    'change image format',
    'image type converter',
    'free image converter',
    'online image converter',
    'image format tool',
    'convert png',
    'convert jpg',
    'convert webp',
    'convert svg',
    'image file converter'
  ],
  path: '/image-format-converter',
  category: 'Images'
})

export default function ImageFormatConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


