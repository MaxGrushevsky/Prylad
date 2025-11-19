import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: '📄 Markdown Editor & Preview - Real-time Markdown Preview Online',
  description: 'Edit and preview Markdown in real-time. Free online Markdown editor with live preview, syntax highlighting, export to HTML, and comprehensive formatting support. Perfect for writing documentation, README files, and formatted text.',
  keywords: [
    'markdown editor',
    'markdown preview',
    'markdown to html',
    'markdown converter',
    'markdown syntax',
    'github markdown',
    'readme editor',
    'documentation tool',
    'text formatter',
    'markdown parser'
  ],
  path: '/markdown',
  category: 'Code'
})

export default function MarkdownLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


