import { generateRedirectMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateRedirectMetadata({
  title: 'Free CSS Gradient Generator - Create Beautiful Gradients Online',
  description: 'Generate CSS gradients online for free. Create linear and radial gradients with multiple colors. Customize direction, angle, and colors. Export CSS code instantly. No registration required.',
  keywords: [
    'gradient generator',
    'CSS gradient',
    'linear gradient',
    'radial gradient',
    'gradient maker',
    'CSS gradient generator',
    'free gradient generator',
    'color gradient'
  ],
  path: '/gradient-generator',
  category: 'Design Tools'
}, '/color-generator#gradient')

export default function GradientGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


