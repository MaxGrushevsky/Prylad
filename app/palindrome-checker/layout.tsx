import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free Palindrome Checker - Check if Text is a Palindrome Online',
  description: 'Check if text is a palindrome online for free. Customize options: ignore case, spaces, punctuation, numbers. See cleaned and reversed text. Export results. No registration required.',
  keywords: [
    'palindrome checker',
    'palindrome',
    'check palindrome',
    'palindrome detector',
    'palindrome validator',
    'palindrome test',
    'reverse text',
    'free palindrome checker'
  ],
  path: '/palindrome-checker',
  category: 'Text Tools'
})

export default function PalindromeCheckerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

