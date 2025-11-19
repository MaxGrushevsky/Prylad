import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free CSS Animation Generator - Create Keyframe Animations Online',
  description: 'Generate CSS animations and keyframes online. Create fade, slide, rotate, scale, and bounce animations. Preview and copy CSS code. No registration required.',
  keywords: [
    'CSS animation generator',
    'keyframe generator',
    'CSS animations',
    'animation tool',
    'keyframes',
    'CSS keyframes',
    'free animation generator'
  ],
  path: '/css-animation-generator',
  category: 'CSS/Design'
})

export default function CSSAnimationGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

