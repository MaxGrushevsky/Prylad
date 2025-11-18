import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Regex Tester - Test Regular Expressions Online',
  description: 'Test and debug regular expressions online for free. Real-time matching, flag options, group capture, and syntax highlighting. Perfect for developers and programmers.',
  keywords: [
    'regex tester',
    'regular expression tester',
    'regex tester online',
    'regex matcher',
    'regex debugger',
    'test regex',
    'regex validator',
    'pattern matcher',
    'regex tool',
    'free regex tester'
  ],
  path: '/regex-tester',
  category: 'Developer Tools'
})

export default function RegexTesterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

