import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Unix Timestamp Converter - Epoch Time Converter Online',
  description: 'Convert Unix timestamp to date and time, or date to timestamp. Support for seconds and milliseconds. Free online epoch time converter with timezone support. No registration required.',
  keywords: [
    'unix timestamp converter',
    'epoch time converter',
    'timestamp to date',
    'date to timestamp',
    'unix time converter',
    'epoch converter',
    'timestamp converter online',
    'unix timestamp to datetime',
    'convert timestamp',
    'epoch time calculator'
  ],
  path: '/unix-timestamp-converter',
  category: 'Time Tools'
})

export default function UnixTimestampConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

