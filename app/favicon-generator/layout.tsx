import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Favicon Generator - Create Custom Favicons Online',
  description: 'Generate favicons from images or text online for free. Create single favicons or complete favicon packages for all devices. Export PNG files and HTML code.',
  keywords: [
    'favicon generator',
    'favicon maker',
    'create favicon',
    'favicon creator',
    'favicon from image',
    'favicon from text',
    'favicon package',
    'apple touch icon',
    'android chrome icon',
    'free favicon generator'
  ],
  path: '/favicon-generator',
  category: 'Design Tools'
})

export default function FaviconGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


