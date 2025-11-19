import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Contrast Checker - WCAG Color Contrast Ratio Tool',
  description: 'Check color contrast ratio for WCAG accessibility compliance. Test text and background colors for AA and AAA standards. Free online contrast checker.',
  keywords: [
    'contrast checker',
    'WCAG contrast',
    'color contrast',
    'accessibility checker',
    'contrast ratio',
    'WCAG AA',
    'WCAG AAA',
    'free contrast checker'
  ],
  path: '/contrast-checker',
  category: 'CSS/Design'
})

export default function ContrastCheckerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

