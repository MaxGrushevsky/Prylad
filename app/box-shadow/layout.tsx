import { generateRedirectMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateRedirectMetadata({
  title: '💎 Box Shadow Generator - Create Beautiful CSS Shadows Online',
  description: 'Generate CSS box-shadow effects with our free online tool. Create single or multiple shadows, adjust blur, spread, color, and opacity. Export CSS code and preview in real-time. Perfect for web designers and developers.',
  keywords: [
    'box shadow generator',
    'css shadow',
    'box shadow css',
    'shadow generator',
    'css shadow tool',
    'drop shadow',
    'css effects',
    'web design tool',
    'shadow creator',
    'css box shadow'
  ],
  path: '/box-shadow',
  category: 'CSS/Design'
}, '/css-generators#box-shadow')

export default function BoxShadowLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


