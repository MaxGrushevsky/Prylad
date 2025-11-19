import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'HTTP Status Codes Reference - Complete List with Descriptions',
  description: 'Complete reference of HTTP status codes with descriptions, use cases, and examples. Search and filter by category (1xx, 2xx, 3xx, 4xx, 5xx). Free online reference.',
  keywords: [
    'HTTP status codes',
    'status code reference',
    'HTTP codes',
    'status codes',
    'HTTP response codes',
    'error codes',
    'HTTP reference',
    'free HTTP status codes'
  ],
  path: '/http-status-codes',
  category: 'Code Tools'
})

export default function HTTPStatusCodesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
