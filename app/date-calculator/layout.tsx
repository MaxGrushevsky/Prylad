import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: '📅 Date Calculator - Calculate Difference Between Dates & Add/Subtract Days',
  description: 'Calculate the difference between two dates in years, months, weeks, days, hours, minutes, and seconds. Add or subtract years, months, weeks, and days from any date. Free online date calculator with detailed breakdowns.',
  keywords: [
    'date calculator',
    'date difference',
    'calculate days between dates',
    'add days to date',
    'subtract days from date',
    'date arithmetic',
    'days calculator',
    'date math',
    'time between dates',
    'date subtract'
  ],
  path: '/date-calculator',
  category: 'Time'
})

export default function DateCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


