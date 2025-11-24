import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Number Base Converter - Binary, Octal, Decimal, Hex Converter Online',
  description: 'Convert numbers between different number systems: binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16). Free online number base converter with real-time conversion. No registration required.',
  keywords: [
    'binary converter',
    'hex to decimal',
    'number base converter',
    'binary to hex',
    'decimal to binary',
    'hexadecimal converter',
    'octal converter',
    'base converter',
    'number system converter',
    'binary decimal hex',
    'convert binary to decimal',
    'convert hex to binary',
    'free base converter',
    'online number converter',
    'radix converter'
  ],
  path: '/number-base-converter',
  category: 'Converters'
})

export default function NumberBaseConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


