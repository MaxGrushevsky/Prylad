import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Barcode Generator - Create Barcodes Online (EAN, Code128, Code39)',
  description: 'Generate barcodes for free. Create EAN-13, EAN-8, Code128, Code39, ITF-14 and more. Customize format, size, and download as image. No registration required.',
  keywords: [
    'barcode generator',
    'create barcode',
    'EAN barcode',
    'Code128 generator',
    'Code39 generator',
    'barcode maker',
    'free barcode',
    'barcode online',
    'generate barcode',
    'barcode creator'
  ],
  path: '/barcode-generator',
  category: 'QR/Network'
})

export default function BarcodeGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

