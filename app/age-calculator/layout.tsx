import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: '📅 Age Calculator - Calculate Exact Age in Years, Months, Days, Hours, Minutes, Seconds',
  description: 'Calculate your exact age with detailed breakdown in years, months, days, hours, minutes, and seconds. Live updating counter, next birthday countdown, zodiac sign, and more. Free online age calculator.',
  keywords: [
    'age calculator',
    'calculate age',
    'age in years months days',
    'age in days',
    'age in hours',
    'age in minutes',
    'age in seconds',
    'how old am i',
    'birthday calculator',
    'age finder',
    'age between dates',
    'zodiac sign',
    'next birthday',
    'age counter',
    'live age calculator',
    'age in milliseconds'
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


