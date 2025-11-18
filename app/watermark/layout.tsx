import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Watermark Generator - Add Watermarks to Images Online',
  description: 'Add custom text or logo watermarks to your images online. Adjust opacity, rotation, tiling, and placement. 100% browser-based, no uploads, no registration.',
  keywords: [
    'watermark generator',
    'add watermark',
    'watermark image',
    'online watermark',
    'photo watermark',
    'logo watermark',
    'watermark tool',
    'free watermark generator'
  ],
  path: '/watermark',
  category: 'Design Tools'
})

export default function WatermarkLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

