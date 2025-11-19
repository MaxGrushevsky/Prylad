import type { Metadata } from 'next'

export interface PageSEO {
  title: string
  description: string
  keywords?: string[]
  path: string
  category?: string
}

export function generatePageMetadata(seo: PageSEO): Metadata {
  const baseUrl = 'https://shortlink-qr.com'
  const fullUrl = `${baseUrl}${seo.path}`
  
  const keywords = seo.keywords || []
  const allKeywords = [
    ...keywords,
    'free online tools',
    'web tools',
    'browser tools',
    'no registration',
    'privacy focused'
  ]

  return {
    title: seo.title,
    description: seo.description,
    keywords: allKeywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: fullUrl,
      siteName: 'Prylad',
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: ['/og-image.jpg'],
    },
    alternates: {
      canonical: fullUrl,
    },
    category: seo.category || 'Technology',
  }
}

