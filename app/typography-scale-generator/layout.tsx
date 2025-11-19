import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Typography Scale Generator - Create Perfect Font Size Scales',
  description: 'Generate typography scales for perfect font sizing. Create harmonious font size scales with different ratios. Export CSS variables. No registration required.',
  keywords: [
    'typography scale generator',
    'font scale generator',
    'type scale',
    'typography scale',
    'font size scale',
    'CSS typography',
    'free typography scale'
  ],
  path: '/typography-scale-generator',
  category: 'CSS/Design'
})

export default function TypographyScaleGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

