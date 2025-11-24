import { generateRedirectMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateRedirectMetadata(
  {
    title: 'Redirecting to Character Reference',
    description: 'This page has moved. You will be redirected to the consolidated Character Reference tool, which includes Unicode Lookup.',
    path: '/unicode-character-lookup',
    category: 'Code Tools'
  },
  '/character-reference#unicode'
)

export default function UnicodeCharacterLookupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


