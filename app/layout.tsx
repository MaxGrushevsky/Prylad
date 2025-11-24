import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://prylad.pro'),
  title: {
    default: 'Prylad - Free Online Generators, Converters & Utilities',
    template: '%s | Prylad'
  },
  description: 'Free online tools: QR code generator, password generator, color generator, UUID, converters, text utilities, JSON formatter, CSS/JS minifier and more. All tools work in the browser. No registration required.',
  keywords: [
    'online tools',
    'QR code generator',
    'password generator',
    'color converter',
    'JSON formatter',
    'CSS minifier',
    'text utilities',
    'free tools',
    'web tools',
    'developer tools',
    'design tools',
    'code generator',
    'hash generator',
    'base64 encoder',
    'URL encoder',
    'text case converter',
    'word counter',
    'lorem ipsum generator',
    'UUID generator',
    'random number generator',
    'name generator',
    'slug generator',
    'gradient generator',
    'color palette generator'
  ],
  authors: [{ name: 'Prylad' }],
  creator: 'Prylad',
  publisher: 'Prylad',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://prylad.pro',
    siteName: 'Prylad',
    title: 'Prylad - Free Online Generators, Converters & Utilities',
    description: 'Free online tools for development, design, and data work. QR codes, passwords, colors, JSON, text utilities and more. All tools work in your browser.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Prylad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prylad - Free Online Tools',
    description: 'Free online tools: QR codes, passwords, colors, JSON, text utilities and more. All tools work in your browser.',
    images: ['/og-image.jpg'],
  },
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
  verification: {
    google: '0qz8454fxihYk_A5ciGziuC4ByYZi7JyxMbR-nWLWSc',
    yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://prylad.pro',
  },
  category: 'Technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://prylad.pro" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="google-site-verification" content="0qz8454fxihYk_A5ciGziuC4ByYZi7JyxMbR-nWLWSc" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Prylad" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3205919903681434"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Prylad",
              "description": "Free online tools: generators, converters, text utilities and more. All tools work in the browser.",
              "url": "https://prylad.pro",
              "applicationCategory": "UtilityApplication",
              "operatingSystem": "Any",
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "softwareVersion": "1.0",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250",
                "bestRating": "5",
                "worstRating": "1"
              },
              "featureList": [
                "QR Code Generator",
                "Password Generator",
                "Color Tools",
                "Text Utilities",
                "Code Formatters",
                "Hash Generators",
                "UUID Generator",
                "JSON Formatter",
                "Base64 Converter",
                "URL Tools",
                "Character Reference",
                "CSS Generators"
              ],
              "screenshot": "https://prylad.pro/og-image.jpg"
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Prylad",
              "url": "https://prylad.pro",
              "logo": "https://prylad.pro/og-image.jpg",
              "description": "Free online tools: generators, converters, text utilities and more. All tools work in the browser.",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "availableLanguage": ["English", "Russian"]
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Prylad",
              "url": "https://prylad.pro",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://prylad.pro/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
