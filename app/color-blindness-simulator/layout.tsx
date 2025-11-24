import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Color Blindness Simulator - Test Images for Accessibility',
  description: 'Simulate 6 types of color blindness (Protanopia, Protanomaly, Deuteranopia, Deuteranomaly, Tritanopia, Tritanomaly) to test image accessibility. Side-by-side comparison, all-types view, URL loading. Free online tool for designers and developers.',
  keywords: [
    'color blindness simulator',
    'color blind simulator',
    'accessibility test',
    'protanopia',
    'protanomaly',
    'deuteranopia',
    'deuteranomaly',
    'tritanopia',
    'tritanomaly',
    'color vision deficiency',
    'free color blindness simulator',
    'accessibility checker',
    'WCAG color blindness',
    'color accessibility test'
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

