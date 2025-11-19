import { generatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free URL Slug Generator - Create SEO-Friendly Slugs Online',
  description: 'Generate URL slugs online for free. Create SEO-friendly slugs from text. Customize separator, lowercase, and special character removal. Auto-generate option. Export to file. No registration required.',
  keywords: [
    'slug generator',
    'URL slug generator',
    'SEO slug',
    'URL friendly slug',
    'slug maker',
    'permalink generator',
    'URL converter',
    'free slug generator'
  ],
  path: '/slug-generator',
  category: 'Text Tools'
})

export default function SlugGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


