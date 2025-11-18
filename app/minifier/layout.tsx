import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Code Minifier & Beautifier - Minify and Format CSS, JS, JSON, HTML Online',
  description: 'Minify and beautify CSS, JavaScript, JSON, and HTML code online for free. Reduce file size, improve performance, and format code with proper indentation. Perfect for web development.',
  keywords: [
    'css minifier',
    'javascript minifier',
    'js minifier',
    'code minifier',
    'css beautifier',
    'js beautifier',
    'code formatter',
    'minify css',
    'minify javascript',
    'minify json',
    'minify html',
    'json beautifier',
    'html beautifier',
    'free minifier',
    'code compressor'
  ],
  path: '/minifier',
  category: 'Developer Tools'
})

export default function MinifierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

