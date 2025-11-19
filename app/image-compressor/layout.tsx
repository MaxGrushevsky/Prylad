import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Image Compressor - Compress Images Online Without Quality Loss',
  description: 'Compress images online for free. Reduce file size of JPEG, PNG, and WebP images. Adjust quality settings and preview results. No registration required.',
  keywords: [
    'image compressor',
    'compress images',
    'image optimizer',
    'reduce image size',
    'JPEG compressor',
    'PNG compressor',
    'WebP converter',
    'free image compressor'
  ],
  path: '/image-compressor',
  category: 'Images'
})

export default function ImageCompressorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

