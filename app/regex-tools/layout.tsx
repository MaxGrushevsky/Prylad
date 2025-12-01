import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '🔎 Regex Tools - Tester & Builder',
  description: 'Test and build regular expressions online for free. Real-time matching, flag options, group capture, visual builder, and syntax highlighting. Perfect for developers and programmers.',
  keywords: [
    'regex tools',
    'regex tester',
    'regex builder',
    'regular expression tester',
    'regex tester online',
    'regex matcher',
    'regex debugger',
    'test regex',
    'regex validator',
    'pattern matcher',
    'regex tool',
    'free regex tester',
    'visual regex builder',
    'regex constructor',
    'regex generator'
  ],
  openGraph: {
    title: 'Regex Tools - Tester & Builder',
    description: 'Test and build regular expressions online for free. Real-time matching, flag options, and visual builder.',
    url: 'https://prylad.pro/regex-tools',
    siteName: 'Prylad',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Regex Tools - Tester & Builder',
    description: 'Test and build regular expressions online for free.',
  },
  alternates: {
    canonical: 'https://prylad.pro/regex-tools',
  },
}

export default function RegexToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


