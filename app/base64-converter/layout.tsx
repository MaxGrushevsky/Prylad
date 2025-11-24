import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Base64 Encoder & Decoder - Convert Text & Images Online | Base64 Converter',
  description: 'Free online Base64 encoder and decoder. Convert text and images to Base64 format instantly. Support for standard and URL-safe encoding, Data URI format, auto-convert, and image preview. No registration required. 100% client-side processing for maximum privacy.',
  keywords: [
    'base64 encoder',
    'base64 decoder',
    'base64 converter',
    'base64 encode',
    'base64 decode',
    'base64 image',
    'base64 image converter',
    'image to base64',
    'base64 to image',
    'URL-safe base64',
    'data uri',
    'data uri generator',
    'base64 string',
    'base64 encoding',
    'base64 decoding',
    'base64 tool',
    'free base64 converter',
    'online base64',
    'base64 generator',
    'base64 encoder decoder',
    'convert image to base64',
    'base64 image encoder',
    'base64 text encoder',
    'base64 online tool',
    'base64 encode decode',
    'base64 string converter',
    'base64 data uri',
    'base64 css',
    'base64 html',
    'base64 javascript',
    'base64 api'
  ],
  path: '/base64-converter',
  category: 'Converters'
})

export default function Base64ConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


