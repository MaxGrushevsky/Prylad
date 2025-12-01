import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free CSS Generators - Box Shadow, Border Radius & Text Shadow',
  description: 'All-in-one CSS generators: create box shadows, border radius, and text shadows with visual preview. Free online CSS generators for developers.',
  keywords: [
    'CSS generator',
    'box shadow generator',
    'border radius generator',
    'text shadow generator',
    'CSS shadow',
    'CSS border radius',
    'CSS tools',
    'free CSS generator'
  ],
  path: '/css-generators',
  category: 'CSS'
})

export default function CSSGeneratorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}



