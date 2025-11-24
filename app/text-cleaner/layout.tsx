import { generateRedirectMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateRedirectMetadata({
  title: 'Free Text Cleaner - Clean & Format Text Online',
  description: 'Clean and format text online for free. Remove extra spaces, duplicates, special characters, numbers, or letters. Trim lines, clean all. Export to file. No registration required.',
  keywords: [
    'text cleaner',
    'text formatter',
    'remove duplicates',
    'remove spaces',
    'text sanitizer',
    'clean text',
    'format text',
    'free text cleaner'
  ],
  path: '/text-cleaner',
  category: 'Text Tools'
}, '/text-tools#cleaner')

export default function TextCleanerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


