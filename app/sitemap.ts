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
    '/qr-tools', // Объединенный инструмент (главный)
    '/qr-generator', // Редирект на /qr-tools#generate
    '/qr-reader', // Редирект на /qr-tools#read
    '/barcode-generator',
    '/url-tools',
    // Colors
    '/color-generator', // Включает градиенты
    '/gradient-generator', // Редирект на /color-generator#gradient
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
    '/text-tools', // Объединенный инструмент (главный)
    '/text-case', // Редирект на /text-tools#case
    '/text-cleaner', // Редирект на /text-tools#cleaner
    '/text-diff',
    '/text-reverser', // Редирект на /text-tools#reverser
    '/slug-generator',
    '/transliteration',
    '/character-reference', // Объединенный инструмент (главный)
    '/ascii-table-generator', // Редирект на /character-reference#ascii
    '/unicode-character-lookup', // Редирект на /character-reference#unicode
    '/emoji-picker', // Редирект на /character-reference#emoji
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
    '/regex-tools', // Объединенный инструмент (главный)
    '/regex-tester', // Редирект на /regex-tools#tester
    '/regex-builder', // Редирект на /regex-tools#builder
    '/markdown',
    '/jwt-decoder', // Включает генерацию
    // CSS/Design
    '/css-generators', // Объединенный инструмент (главный)
    '/box-shadow', // Редирект на /css-generators#box-shadow
    '/border-radius-generator', // Редирект на /css-generators#border-radius
    '/text-shadow-generator', // Редирект на /css-generators#text-shadow
    '/layout-generator',
    '/css-animation-generator',
    '/font-pairing-generator',
    '/typography-scale-generator',
    // Security
    '/password-generator', // Включает проверку силы
    '/password-strength-meter', // Редирект на /password-generator#check
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

  // Определяем приоритеты и частоту обновления для разных типов страниц
  const getPageConfig = (route: string) => {
    // Главная страница - максимальный приоритет
    if (route === '') {
      return { priority: 1.0, changeFrequency: 'daily' as const }
    }
    
    // Объединенные инструменты (главные) - высокий приоритет
    const mainTools = [
      '/qr-tools',
      '/text-tools',
      '/character-reference',
      '/color-generator',
      '/password-generator',
      '/jwt-decoder',
      '/regex-tools',
      '/css-generators',
      '/url-tools',
    ]
    if (mainTools.includes(route)) {
      return { priority: 0.9, changeFrequency: 'weekly' as const }
    }
    
    // Популярные инструменты - высокий приоритет
    const popularTools = [
      '/base64-converter',
      '/json-formatter',
      '/uuid-generator',
      '/hash-generator',
      '/color-converter',
      '/word-counter',
      '/slug-generator',
    ]
    if (popularTools.includes(route)) {
      return { priority: 0.8, changeFrequency: 'weekly' as const }
    }
    
    // Редиректы - низкий приоритет, но оставляем для индексации
    const redirectRoutes = [
      '/qr-generator',
      '/qr-reader',
      '/text-case',
      '/text-cleaner',
      '/text-reverser',
      '/ascii-table-generator',
      '/unicode-character-lookup',
      '/emoji-picker',
      '/gradient-generator',
      '/password-strength-meter',
      '/regex-tester',
      '/regex-builder',
      '/box-shadow',
      '/border-radius-generator',
      '/text-shadow-generator',
    ]
    if (redirectRoutes.includes(route)) {
      return { priority: 0.3, changeFrequency: 'monthly' as const }
    }
    
    // Остальные инструменты - стандартный приоритет
    return { priority: 0.7, changeFrequency: 'weekly' as const }
  }

  // Все страницы с оптимизированными приоритетами
  const sitemapEntries: MetadataRoute.Sitemap = routes.map(route => {
    const config = getPageConfig(route)
    return {
      url: route === '' ? baseUrl : `${baseUrl}${route}`,
      lastModified: currentDate,
      changeFrequency: config.changeFrequency,
      priority: config.priority,
    }
  })

  return sitemapEntries
}
