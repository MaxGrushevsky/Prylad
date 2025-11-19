import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Test Data Generator - Generate Fake Data for Testing',
  description: 'Generate test data for development and testing. Create fake names, emails, addresses, phone numbers, dates, and more. Export to JSON, CSV, or SQL. No registration required.',
  keywords: [
    'test data generator',
    'fake data generator',
    'mock data generator',
    'test data',
    'fake data',
    'sample data',
    'data generator',
    'free test data generator'
  ],
  path: '/test-data-generator',
  category: 'Code'
})

export default function TestDataGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

