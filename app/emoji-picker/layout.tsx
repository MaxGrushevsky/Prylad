import { generateRedirectMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateRedirectMetadata(
  {
    title: 'Redirecting to Character Reference',
    description: 'This page has moved. You will be redirected to the consolidated Character Reference tool, which includes Emoji Picker.',
    path: '/emoji-picker',
    category: 'Text Tools'
  },
  '/character-reference#emoji'
)

export default function EmojiPickerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


