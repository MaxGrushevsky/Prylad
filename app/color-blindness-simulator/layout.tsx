import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Color Blindness Simulator - Test Images for Accessibility',
  description: 'Simulate color blindness to test image accessibility. Preview how images look with Protanopia, Deuteranopia, and Tritanopia. Free online tool.',
  keywords: [
    'color blindness simulator',
    'color blind simulator',
    'accessibility test',
    'protanopia',
    'deuteranopia',
    'tritanopia',
    'color vision deficiency',
    'free color blindness simulator'
  ],
  path: '/color-blindness-simulator',
  category: 'CSS/Design'
})

export default function ColorBlindnessSimulatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

