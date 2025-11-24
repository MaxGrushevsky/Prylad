import { generateRedirectMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateRedirectMetadata({
  title: 'Free Regex Builder - Visual Regular Expression Constructor',
  description: 'Build regular expressions visually with our free online regex builder. Drag-and-drop interface, real-time preview, pattern testing, and export. Perfect for developers learning regex syntax.',
  keywords: [
    'regex builder',
    'regular expression builder',
    'visual regex builder',
    'regex constructor',
    'regex generator',
    'regex maker',
    'build regex',
    'regex visualizer',
    'regex creator',
    'free regex builder',
    'online regex builder',
    'regex tool',
    'pattern builder',
    'regex designer',
    'regex composer'
  ],
  path: '/regex-builder',
  category: 'Developer Tools'
}, '/regex-tools#builder')

export default function RegexBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


