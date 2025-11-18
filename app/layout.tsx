import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://shortlink-qr.com'),
  title: {
    default: 'Tuly - Free Online Generators, Converters & Utilities',
    template: '%s | Tuly'
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
  authors: [{ name: 'Tuly' }],
  creator: 'Tuly',
  publisher: 'Tuly',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ru_RU', 'es_ES', 'fr_FR', 'de_DE', 'zh_CN', 'ja_JP'],
    url: 'https://shortlink-qr.com',
    siteName: 'Tuly',
    title: 'Tuly - Free Online Generators, Converters & Utilities',
    description: 'Free online tools for development, design, and data work. QR codes, passwords, colors, JSON, text utilities and more. All tools work in your browser.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tuly',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tuly - Free Online Tools',
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
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://shortlink-qr.com',
    languages: {
      'en': 'https://shortlink-qr.com',
      'ru': 'https://shortlink-qr.com/ru',
      'es': 'https://shortlink-qr.com/es',
      'fr': 'https://shortlink-qr.com/fr',
      'de': 'https://shortlink-qr.com/de',
      'zh': 'https://shortlink-qr.com/zh',
      'ja': 'https://shortlink-qr.com/ja',
    },
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
        <link rel="canonical" href="https://shortlink-qr.com" />
        <link rel="alternate" hrefLang="en" href="https://shortlink-qr.com" />
        <link rel="alternate" hrefLang="ru" href="https://shortlink-qr.com/ru" />
        <link rel="alternate" hrefLang="es" href="https://shortlink-qr.com/es" />
        <link rel="alternate" hrefLang="fr" href="https://shortlink-qr.com/fr" />
        <link rel="alternate" hrefLang="de" href="https://shortlink-qr.com/de" />
        <link rel="alternate" hrefLang="zh" href="https://shortlink-qr.com/zh" />
        <link rel="alternate" hrefLang="ja" href="https://shortlink-qr.com/ja" />
        <link rel="alternate" hrefLang="x-default" href="https://shortlink-qr.com" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tuly" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Tuly",
              "description": "Free online tools: generators, converters, text utilities and more. All tools work in the browser.",
              "url": "https://shortlink-qr.com",
              "applicationCategory": "UtilityApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250"
              },
              "featureList": [
                "QR Code Generator",
                "Password Generator",
                "Color Tools",
                "Text Utilities",
                "Code Formatters",
                "Hash Generators",
                "UUID Generator",
                "JSON Formatter"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Tuly",
              "url": "https://shortlink-qr.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://shortlink-qr.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
