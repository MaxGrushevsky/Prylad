import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Avatar Generator - Create Unique Geometric Avatars Online',
  description: 'Generate unique geometric avatars online for free. Choose from multiple patterns, color schemes, and shapes. Perfect for profile pictures, user icons, and design projects.',
  keywords: [
    'avatar generator',
    'profile picture generator',
    'geometric avatar',
    'avatar maker',
    'random avatar',
    'user avatar',
    'profile avatar',
    'free avatar generator',
    'avatar creator'
  ],
  path: '/avatar-generator',
  category: 'Design Tools'
})

export default function AvatarGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


