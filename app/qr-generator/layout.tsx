import { generateRedirectMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateRedirectMetadata({
  title: 'Free QR Code Generator - Create Custom QR Codes Online',
  description: 'Generate QR codes for free. Create custom QR codes for text, URLs, WiFi networks, and email addresses. Add your logo, customize colors, size, and error correction level. No registration required.',
  keywords: [
    'QR code generator',
    'QR code maker',
    'free QR code',
    'custom QR code',
    'QR code with logo',
    'WiFi QR code',
    'QR code online',
    'QR code creator',
    'barcode generator'
  ],
  path: '/qr-generator',
  category: 'QR Code Tools'
}, '/qr-tools#generate')

export default function QRGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


