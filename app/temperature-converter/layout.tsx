import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Temperature Converter - Celsius, Fahrenheit, Kelvin Online',
  description: 'Convert temperature between Celsius, Fahrenheit, and Kelvin. Free online temperature converter with instant results. No registration required.',
  keywords: [
    'temperature converter',
    'celsius to fahrenheit',
    'fahrenheit to celsius',
    'celsius to kelvin',
    'fahrenheit to kelvin',
    'kelvin converter',
    'temperature calculator',
    'convert temperature',
    'temp converter',
    'degree converter'
  ],
  path: '/temperature-converter',
  category: 'Converters'
})

export default function TemperatureConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}



