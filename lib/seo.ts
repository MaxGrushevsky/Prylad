import type { Metadata } from 'next'

export interface PageSEO {
  title: string
  description: string
  keywords?: string[]
  path: string
  category?: string
}

export function generatePageMetadata(seo: PageSEO): Metadata {
  const baseUrl = 'https://prylad.pro'
  const fullUrl = `${baseUrl}${seo.path}`
  
  const keywords = seo.keywords || []
  const allKeywords = [
    ...keywords,
    'free online tools',
    'web tools',
    'browser tools',
    'no registration',
    'privacy focused',
    'online utility',
    'web utility',
    'developer tools',
    'free tools online'
  ]

  return {
    title: seo.title,
    description: seo.description,
    keywords: allKeywords,
    authors: [{ name: 'Prylad' }],
    creator: 'Prylad',
    publisher: 'Prylad',
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
      creator: '@prylad', // Add if you have Twitter account
    },
    alternates: {
      canonical: fullUrl,
    },
    category: seo.category || 'Technology',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    // Additional SEO metadata
    metadataBase: new URL('https://prylad.pro'),
    applicationName: 'Prylad',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  }
}

// Функция для создания мета-тегов с редиректом (canonical указывает на новую страницу)
export function generateRedirectMetadata(seo: PageSEO, canonicalPath: string): Metadata {
  const baseUrl = 'https://prylad.pro'
  const fullUrl = `${baseUrl}${seo.path}`
  const canonicalUrl = `${baseUrl}${canonicalPath}`
  
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
      url: canonicalUrl, // OpenGraph указывает на canonical URL
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
      canonical: canonicalUrl, // Canonical указывает на новую страницу
    },
    robots: {
      index: false, // Не индексировать страницу редиректа
      follow: true, // Но следовать редиректу
    },
  }
}
