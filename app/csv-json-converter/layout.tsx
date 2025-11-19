import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free CSV to JSON Converter - Convert CSV & JSON Online',
  description: 'Convert CSV to JSON and JSON to CSV online for free. Parse CSV with custom delimiters, handle headers, and export results. No registration required.',
  keywords: [
    'CSV to JSON',
    'JSON to CSV',
    'CSV converter',
    'JSON converter',
    'CSV parser',
    'convert CSV',
    'convert JSON',
    'free CSV converter'
  ],
  path: '/csv-json-converter',
  category: 'Converters'
})

export default function CSVJSONConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


