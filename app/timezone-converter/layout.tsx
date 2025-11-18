import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: '🌍 Timezone Converter - Convert Time Between Timezones',
  description: 'Convert time between different timezones accurately. See current time in multiple timezones, calculate time differences, and handle DST automatically. Free online timezone converter with 50+ timezones.',
  keywords: [
    'timezone converter',
    'time zone converter',
    'convert timezone',
    'time converter',
    'world clock',
    'time difference',
    'DST converter',
    'timezone calculator',
    'international time',
    'timezone tool'
  ],
  path: '/timezone-converter',
  category: 'Time'
})

export default function TimezoneConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

