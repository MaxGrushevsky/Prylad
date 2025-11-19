import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Random Number Generator - Generate Random Numbers Online',
  description: 'Generate random numbers online for free. Customize range, count, duplicates, and sorting. Perfect for lotteries, games, statistics, and random sampling. Export to file. No registration required.',
  keywords: [
    'random number generator',
    'number generator',
    'random number',
    'lottery number generator',
    'random integer',
    'statistics generator',
    'free random number generator',
    'random sampling'
  ],
  path: '/number-generator',
  category: 'Generators'
})

export default function NumberGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


