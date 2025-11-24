import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free HTML Entity Encoder/Decoder - HTML Escape Tool Online',
  description: 'Encode and decode HTML entities. Convert special characters to HTML entities (&lt;, &gt;, &amp;) and vice versa. Free online HTML escape tool for developers. No registration required.',
  keywords: [
    'html entity encoder',
    'html entity decoder',
    'html escape',
    'html special characters',
    'html entity converter',
    'html encode',
    'html decode',
    'html entities',
    'escape html',
    'unescape html',
    'html character encoder',
    'html character decoder'
  ],
  path: '/html-entity-encoder',
  category: 'Code Tools'
})

export default function HtmlEntityEncoderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


