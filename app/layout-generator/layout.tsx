import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: '📐 CSS Grid & Flexbox Generator - Visual Layout Builder Online',
  description: 'Create CSS Grid and Flexbox layouts visually. Add blocks, adjust properties, see real-time preview, and export CSS code. Perfect for web designers and developers building responsive layouts.',
  keywords: [
    'css grid generator',
    'flexbox generator',
    'layout generator',
    'css grid tool',
    'flexbox tool',
    'grid layout',
    'flexbox layout',
    'css layout builder',
    'responsive grid',
    'visual css editor'
  ],
  path: '/layout-generator',
  category: 'CSS/Design'
})

export default function LayoutGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


