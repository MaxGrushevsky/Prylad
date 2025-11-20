import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Image Editor - Resize, Rotate, Flip & Compress Images Online',
  description: 'Complete image editor: resize, rotate, flip, and compress images online for free. Change image dimensions, rotate by any angle, flip horizontally/vertically, and compress with quality control. Support for JPEG, PNG, and WebP formats. Live preview. No registration required.',
  keywords: [
    'image editor',
    'image resizer',
    'resize image',
    'rotate image',
    'flip image',
    'compress image',
    'image compressor',
    'image rotator',
    'image size changer',
    'resize photo',
    'image dimensions',
    'resize picture',
    'change image size',
    'image resizer online',
    'free image resizer',
    'resize image tool',
    'photo resizer',
    'image scaler',
    'resize image free',
    'online image resizer',
    'image size converter',
    'rotate picture',
    'flip picture',
    'image flipper',
    'image optimizer',
    'reduce image size'
  ],
  path: '/image-resizer',
  category: 'Images'
})

export default function ImageResizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

