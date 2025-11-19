import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://prylad.pro')
  const currentDate = new Date()

  // Все страницы сайта
  const routes = [
    // Главная страница
    '',
    // QR/Network
    '/qr-generator',
    '/wifi-qr-generator',
    '/url-encoder',
    '/ip-address-info',
    '/domain-age-checker',
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
    // Random Numbers
    '/number-generator',
    // Games
    '/dice-roller',
    '/decision-generator',
    '/wheel-of-fortune',
    // Images
    '/watermark',
    '/placeholder-generator',
    '/favicon-generator',
    '/avatar-generator',
    '/meme-generator',
    '/ascii-art',
    '/image-compressor',
    // Text
    '/lorem-generator',
    '/word-counter',
    '/text-case',
    '/text-cleaner',
    '/text-diff',
    '/slug-generator',
    '/transliteration',
    '/palindrome-checker',
    // Converters
    '/base64-converter',
    '/csv-json-converter',
    // Code
    '/json-formatter',
    '/minifier',
    '/regex-tester',
    '/markdown',
    '/sql-formatter',
    '/xml-formatter',
    '/yaml-formatter',
    '/jwt-decoder',
    '/jwt-token-generator',
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
    '/password-strength-checker',
    '/hash-generator',
    '/text-encryption',
    // Time
    '/world-clock',
    '/age-calculator',
    '/date-calculator',
    '/timezone-converter',
    // Other
    '/http-status-codes',
    '/test-data-generator',
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

