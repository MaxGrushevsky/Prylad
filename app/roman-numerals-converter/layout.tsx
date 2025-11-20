import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Roman Numerals Converter - Convert Numbers to Roman Numerals Online',
  description: 'Convert Arabic numbers to Roman numerals and Roman numerals to numbers online for free. Support for numbers 1-3999. Real-time conversion with validation. No registration required.',
  keywords: [
    'roman numerals converter',
    'number to roman',
    'roman to number',
    'roman numeral converter',
    'convert to roman numerals',
    'arabic to roman',
    'roman numerals',
    'roman number converter',
    'roman numeral translator',
    'free roman numerals converter',
    'online roman numerals',
    'roman numerals calculator',
    'number roman converter'
  ],
  path: '/roman-numerals-converter',
  category: 'Converters'
})

export default function RomanNumeralsConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

