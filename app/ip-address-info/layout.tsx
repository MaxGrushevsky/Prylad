import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: '🌐 IP Address Info - Free IP Lookup Tool',
  description: 'Get detailed information about any IP address. Find location, ISP, organization, ASN, and network details. Free online IP address lookup tool.',
  keywords: [
    'IP address lookup',
    'IP geolocation',
    'IP information',
    'IP location',
    'ISP lookup',
    'ASN lookup',
    'IP address info',
    'free IP lookup',
    'IP address details',
    'network information',
    'IP geolocation tool',
    'IP address finder'
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


