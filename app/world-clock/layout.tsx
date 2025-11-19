import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: '🌍 World Clock - Current Time in Cities Worldwide',
  description: 'View current time in cities around the world. Compare timezones, see UTC offsets, dates, and day of week. Free world clock with real-time updates. Perfect for scheduling meetings and coordinating across timezones.',
  keywords: [
    'world clock',
    'timezone converter',
    'world time',
    'current time',
    'time zones',
    'international time',
    'time converter',
    'global clock',
    'time difference',
    'utc time'
  ],
  path: '/world-clock',
  category: 'Time'
})

export default function WorldClockLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


