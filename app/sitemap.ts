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
    // Colors
    '/color-generator',
    '/gradient-generator',
    '/color-converter',
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
    // Code
    '/json-formatter',
    '/minifier',
    '/regex-tester',
    '/markdown',
    // CSS/Design
    '/box-shadow',
    '/layout-generator',
    // Security
    '/password-generator',
    '/hash-generator',
    '/text-encryption',
    // Time
    '/world-clock',
    '/age-calculator',
    '/date-calculator',
    '/timezone-converter',
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

