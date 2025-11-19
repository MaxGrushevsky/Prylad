import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free IP Address Info - Lookup IP Address Details Online',
  description: 'Get detailed information about any IP address. Find location, ISP, organization, and network details. Free IP address lookup tool.',
  keywords: [
    'IP address lookup',
    'IP address info',
    'IP geolocation',
    'IP address checker',
    'IP location',
    'IP information',
    'free IP lookup'
  ],
  path: '/ip-address-info',
  category: 'Network'
})

export default function IPAddressInfoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

