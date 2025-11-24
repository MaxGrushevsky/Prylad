import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free CSS Formatter & Minifier - Format and Minify CSS Online',
  description: 'Format and minify CSS code online for free. Beautify CSS with proper indentation or compress it for production. Auto-format, customize indentation, and export to file.',
  keywords: [
    'CSS formatter',
    'CSS minifier',
    'CSS beautifier',
    'format CSS',
    'minify CSS',
    'CSS prettifier',
    'CSS compressor',
    'free CSS formatter'
  ],
  path: '/css-formatter',
  category: 'Code Tools'
})

export default function CSSFormatterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


