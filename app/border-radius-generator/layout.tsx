import { generateRedirectMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateRedirectMetadata({
  title: 'Free Border Radius Generator - CSS Border Radius Tool Online',
  description: 'Generate CSS border-radius values with visual preview. Create rounded corners for any element. Copy CSS code instantly. No registration required.',
  keywords: [
    'border radius generator',
    'CSS border radius',
    'rounded corners',
    'border radius tool',
    'CSS generator',
    'border radius preview',
    'free border radius generator'
  ],
  path: '/border-radius-generator',
  category: 'CSS/Design'
}, '/css-generators#border-radius')

export default function BorderRadiusGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

