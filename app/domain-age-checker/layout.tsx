import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Domain Age Checker - Check When Domain Was Registered',
  description: 'Check domain age and registration date online. Find out when a domain was first registered. Free domain age lookup tool.',
  keywords: [
    'domain age checker',
    'domain registration date',
    'domain age',
    'domain lookup',
    'whois domain',
    'domain registration',
    'free domain age checker'
  ],
  path: '/domain-age-checker',
  category: 'Network'
})

export default function DomainAgeCheckerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

