import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://prylad.pro')
  const currentDate = new Date()

  // Все страницы сайта - синхронизировано с SearchModal.tsx
  const routes = [
    // Главная страница
    '',
    // QR/Network
    '/qr-generator',
    '/qr-reader',
    '/barcode-generator',
    '/url-tools',
    // Colors
    '/color-generator',
    '/gradient-generator',
    '/color-converter',
    '/color-palette-from-image',
    '/color-blindness-simulator',
    '/contrast-checker',
    // Generators
    '/uuid-generator',
    '/name-generator',
    '/number-generator',
    // Images
    '/watermark',
    '/placeholder-generator',
    '/favicon-generator',
    '/avatar-generator',
    '/image-resizer',
    // Text
    '/lorem-generator',
    '/word-counter',
    '/text-case',
    '/text-cleaner',
    '/text-diff',
    '/text-reverser',
    '/slug-generator',
    '/transliteration',
    // Converters
    '/base64-converter',
    '/csv-json-converter',
    '/morse-code-encoder',
    '/temperature-converter',
    '/unit-converter',
    '/text-to-binary',
    '/roman-numerals-converter',
    '/number-base-converter',
    // Code
    '/json-formatter',
    '/css-formatter',
    '/js-formatter',
    '/html-entity-encoder',
    '/sql-formatter',
    '/xml-formatter',
    '/yaml-formatter',
    '/http-status-codes',
    '/test-data-generator',
    '/regex-tester',
    '/markdown',
    '/jwt-decoder',
    // CSS/Design
    '/box-shadow',
    '/layout-generator',
    '/border-radius-generator',
    '/css-animation-generator',
    '/text-shadow-generator',
    '/font-pairing-generator',
    '/typography-scale-generator',
    // Security
    '/password-generator',
    '/hash-generator',
    '/text-encryption',
    // Time
    '/world-clock',
    '/date-calculator',
    '/timezone-converter',
    '/unix-timestamp-converter',
    // Entertainment
    '/dice-roller',
    '/decision-generator',
    '/wheel-of-fortune',
    '/meme-generator',
    '/ascii-art',
    '/palindrome-checker',
  ]

  // Все страницы с максимальным приоритетом (каждая страница - полноценный инструмент)
  // Каждая страница одинаково важна, так как это отдельный полноценный инструмент
  const sitemapEntries: MetadataRoute.Sitemap = routes.map(route => ({
    url: route === '' ? baseUrl : `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: 1.0, // Максимальный приоритет для всех страниц - каждая страница полноценный инструмент
  }))

  return sitemapEntries
}
