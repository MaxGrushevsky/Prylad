import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'QR Code Tools - Generator & Reader',
  description: 'Generate and read QR codes online for free. Create custom QR codes for text, URLs, WiFi networks, and email addresses. Scan QR codes from uploaded images.',
  keywords: [
    'QR code generator',
    'QR code reader',
    'QR code scanner',
    'free QR code',
    'custom QR code',
    'QR code with logo',
    'WiFi QR code',
    'QR code online',
    'QR code creator',
    'scan QR code'
  ],
  path: '/qr-tools',
  category: 'QR Code Tools'
})

export default function QRToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


