import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Unit Converter - Length, Weight, Volume, Area Online',
  description: 'Convert units of length, weight, volume, area, and time. Free online unit converter with support for metric and imperial units. No registration required.',
  keywords: [
    'unit converter',
    'length converter',
    'weight converter',
    'volume converter',
    'area converter',
    'metric converter',
    'imperial converter',
    'measurement converter',
    'convert units',
    'unit conversion'
  ],
  path: '/unit-converter',
  category: 'Converters'
})

export default function UnitConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}



