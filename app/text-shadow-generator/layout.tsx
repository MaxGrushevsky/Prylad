import { generateRedirectMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateRedirectMetadata({
  title: 'Free Text Shadow Generator - CSS Text Shadow Tool Online',
  description: 'Generate CSS text-shadow values with visual preview. Create beautiful text shadows with multiple layers. Copy CSS code instantly. No registration required.',
  keywords: [
    'text shadow generator',
    'CSS text shadow',
    'text shadow tool',
    'CSS generator',
    'text shadow preview',
    'free text shadow generator'
  ],
  path: '/text-shadow-generator',
  category: 'CSS/Design'
}, '/css-generators#text-shadow')

export default function TextShadowGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

