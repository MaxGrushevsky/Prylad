import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: '📅 Age Calculator - Calculate Exact Age in Years, Months, Days',
  description: 'Calculate your exact age or age between two dates. Get detailed breakdown in years, months, days, hours, minutes, and seconds. Find your zodiac sign, next birthday, and more. Free online age calculator.',
  keywords: [
    'age calculator',
    'calculate age',
    'age in years months days',
    'birthday calculator',
    'age finder',
    'how old am i',
    'age between dates',
    'zodiac sign',
    'next birthday',
    'age in days'
  ],
  path: '/age-calculator',
  category: 'Time'
})

export default function AgeCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

