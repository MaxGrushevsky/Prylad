import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Color Converter - Convert HEX, RGB, HSL, HSV, CMYK Online',
  description: 'Convert colors between HEX, RGB, HSL, HSV, and CMYK formats online for free. Get color information, brightness, contrast ratios, and WCAG compliance. No registration required.',
  keywords: [
    'color converter',
    'HEX to RGB',
    'RGB to HEX',
    'HSL converter',
    'CMYK converter',
    'color format converter',
    'WCAG contrast',
    'color brightness',
    'free color converter'
  ],
  path: '/color-converter',
  category: 'Design Tools'
})

export default function ColorConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


