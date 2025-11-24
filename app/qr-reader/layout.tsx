import { generateRedirectMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateRedirectMetadata({
  title: 'Free QR Code Reader - Scan QR Codes from Images Online',
  description: 'Scan and decode QR codes from uploaded images online for free. Read QR codes containing text, URLs, WiFi credentials, email addresses, and more. No registration required.',
  keywords: [
    'QR code reader',
    'QR scanner online',
    'scan QR code',
    'QR code decoder',
    'read QR code',
    'QR code from image',
    'decode QR code',
    'QR code scanner',
    'free QR reader',
    'online QR scanner',
    'QR code detector',
    'scan QR from photo',
    'QR code extractor'
  ],
  path: '/qr-reader',
  category: 'QR/Network'
}, '/qr-tools#read')

export default function QRReaderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


