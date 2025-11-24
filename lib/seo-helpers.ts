// SEO helpers for automatic generation of structured data and related tools

import { BreadcrumbItem } from '@/components/Breadcrumbs'
import { RelatedTool } from '@/components/RelatedTools'

// Tool categories mapping
export const toolCategories: Record<string, { name: string; path: string; tools: Array<{ name: string; path: string; description: string; icon: string }> }> = {
  'qr-network': {
    name: 'QR/Network',
    path: '/qr-network',
    tools: [
      { name: 'QR Code Generator', path: '/qr-generator', description: 'Create QR codes for text, URLs, WiFi, and email', icon: '📱' },
      { name: 'QR Reader', path: '/qr-reader', description: 'Scan and decode QR codes from images', icon: '📱' },
      { name: 'Barcode Generator', path: '/barcode-generator', description: 'Create EAN, Code128, Code39 barcodes', icon: '📊' },
      { name: 'URL Tools', path: '/url-tools', description: 'URL encoder, parser & query builder', icon: '🔗' },
    ]
  },
  'colors': {
    name: 'Colors',
    path: '/colors',
    tools: [
      { name: 'Color Generator', path: '/color-generator', description: 'Random colors and palettes', icon: '🎨' },
      { name: 'Gradient Generator', path: '/gradient-generator', description: 'Create CSS gradients', icon: '🌈' },
      { name: 'Color Converter', path: '/color-converter', description: 'HEX ↔ RGB ↔ HSL', icon: '🔄' },
      { name: 'Palette from Image', path: '/color-palette-from-image', description: 'Extract color palette from images', icon: '🖼️' },
      { name: 'Color Blindness Simulator', path: '/color-blindness-simulator', description: 'Simulate color blindness', icon: '👁️' },
      { name: 'Contrast Checker', path: '/contrast-checker', description: 'Check WCAG color contrast ratio', icon: '🎯' },
    ]
  },
  'generators': {
    name: 'Generators',
    path: '/generators',
    tools: [
      { name: 'UUID Generator', path: '/uuid-generator', description: 'Generate unique identifiers', icon: '🆔' },
      { name: 'Password Generator', path: '/password-generator', description: 'Create strong secure passwords', icon: '🔐' },
      { name: 'Name Generator', path: '/name-generator', description: 'Random names and nicknames', icon: '👤' },
      { name: 'Number Generator', path: '/number-generator', description: 'Generator for lotteries and games', icon: '🎲' },
    ]
  },
  'text': {
    name: 'Text',
    path: '/text',
    tools: [
      { name: 'Text Case Converter', path: '/text-case', description: 'UPPERCASE, lowercase, Title Case', icon: '⌨️' },
      { name: 'Word Counter', path: '/word-counter', description: 'Count words and characters', icon: '🔢' },
      { name: 'Text Cleaner', path: '/text-cleaner', description: 'Remove spaces and duplicates', icon: '🧹' },
      { name: 'Text Diff', path: '/text-diff', description: 'Compare two texts', icon: '🔍' },
      { name: 'Text Reverser', path: '/text-reverser', description: 'Reverse text, words, and sentences', icon: '🔄' },
      { name: 'Slug Generator', path: '/slug-generator', description: 'URL-friendly string generator', icon: '🔗' },
      { name: 'Transliteration', path: '/transliteration', description: 'Cyrillic ↔ Latin conversion', icon: '🔄' },
      { name: 'Lorem Generator', path: '/lorem-generator', description: 'Placeholder text for design', icon: '📝' },
      { name: 'Emoji Picker', path: '/emoji-picker', description: 'Search and copy emojis by category', icon: '😀' },
    ]
  },
  'converters': {
    name: 'Converters',
    path: '/converters',
    tools: [
      { name: 'Base64 Converter', path: '/base64-converter', description: 'Text and image encoding', icon: '📦' },
      { name: 'CSV ↔ JSON', path: '/csv-json-converter', description: 'Convert CSV to JSON and back', icon: '🔄' },
      { name: 'Morse Code', path: '/morse-code-encoder', description: 'Encode/decode Morse code', icon: '📡' },
      { name: 'Temperature Converter', path: '/temperature-converter', description: 'Convert Celsius, Fahrenheit, Kelvin', icon: '🌡️' },
      { name: 'Unit Converter', path: '/unit-converter', description: 'Convert length, weight, volume, area, time', icon: '📏' },
      { name: 'Text ↔ Binary', path: '/text-to-binary', description: 'Convert text to binary and back', icon: '💻' },
      { name: 'Roman Numerals', path: '/roman-numerals-converter', description: 'Convert numbers to Roman numerals', icon: '🔢' },
      { name: 'Number Base Converter', path: '/number-base-converter', description: 'Convert between binary, octal, decimal, hex', icon: '🔢' },
    ]
  },
  'code': {
    name: 'Code',
    path: '/code',
    tools: [
      { name: 'JSON Formatter', path: '/json-formatter', description: 'Format and validate JSON', icon: '📋' },
      { name: 'CSS Formatter', path: '/css-formatter', description: 'Format and minify CSS code', icon: '🎨' },
      { name: 'JavaScript Formatter', path: '/js-formatter', description: 'Format and minify JavaScript code', icon: '💻' },
      { name: 'HTML Entity Encoder', path: '/html-entity-encoder', description: 'Encode/decode HTML entities', icon: '🔤' },
      { name: 'SQL Formatter', path: '/sql-formatter', description: 'Format and beautify SQL queries', icon: '💾' },
      { name: 'XML Formatter', path: '/xml-formatter', description: 'Format, minify and validate XML', icon: '📄' },
      { name: 'YAML Formatter', path: '/yaml-formatter', description: 'Format YAML and convert to/from JSON', icon: '📝' },
      { name: 'Regex Tester', path: '/regex-tester', description: 'Regular expression testing', icon: '🔎' },
      { name: 'Regex Builder', path: '/regex-builder', description: 'Visual regex constructor and builder', icon: '🔨' },
      { name: 'Markdown Preview', path: '/markdown', description: 'Markdown preview and editor', icon: '📄' },
      { name: 'JWT Decoder', path: '/jwt-decoder', description: 'Decode and generate JWT tokens', icon: '🔐' },
      { name: 'Cron Expression Generator', path: '/cron-expression-generator', description: 'Generate and parse cron expressions', icon: '⏰' },
      { name: 'ASCII Table Generator', path: '/ascii-table-generator', description: 'Complete ASCII character codes table', icon: '📊' },
      { name: 'Unicode Character Lookup', path: '/unicode-character-lookup', description: 'Lookup Unicode characters by code or name', icon: '🔍' },
    ]
  },
  'security': {
    name: 'Security',
    path: '/security',
    tools: [
      { name: 'Password Generator', path: '/password-generator', description: 'Generate strong secure passwords', icon: '🔐' },
      { name: 'Hash Generator', path: '/hash-generator', description: 'MD5, SHA-1, SHA-256, SHA-512, HMAC', icon: '🔐' },
      { name: 'Text Encryption', path: '/text-encryption', description: 'Caesar cipher and Base64', icon: '🔒' },
    ]
  },
  'time': {
    name: 'Time',
    path: '/time',
    tools: [
      { name: 'World Clock', path: '/world-clock', description: 'Time in different cities', icon: '🌍' },
      { name: 'Date Calculator', path: '/date-calculator', description: 'Calculate date differences & age', icon: '📅' },
      { name: 'Timezone Converter', path: '/timezone-converter', description: 'Time converter between zones', icon: '🌍' },
      { name: 'Unix Timestamp', path: '/unix-timestamp-converter', description: 'Convert timestamp to date and time', icon: '⏰' },
    ]
  },
  'image': {
    name: 'Images',
    path: '/images',
    tools: [
      { name: 'Image Format Converter', path: '/image-format-converter', description: 'Convert PNG, JPG, WebP, SVG formats', icon: '🖼️' },
      { name: 'Image Editor', path: '/image-resizer', description: 'Resize, rotate, flip, and compress images', icon: '✂️' },
      { name: 'Image Compressor', path: '/image-compressor', description: 'Compress images to reduce file size', icon: '🗜️' },
      { name: 'Watermark Generator', path: '/watermark', description: 'Add text or image watermarks', icon: '💧' },
      { name: 'Color Palette from Image', path: '/color-palette-from-image', description: 'Extract color palette from images', icon: '🎨' },
      { name: 'Color Blindness Simulator', path: '/color-blindness-simulator', description: 'Simulate color blindness', icon: '👁️' },
    ]
  },
}

/**
 * Generate breadcrumbs for a page
 */
export function generateBreadcrumbs(
  toolName: string,
  toolPath: string,
  category?: string
): BreadcrumbItem[] {
  const baseUrl = 'https://prylad.pro'
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: baseUrl }
  ]

  if (category && toolCategories[category]) {
    breadcrumbs.push({
      name: toolCategories[category].name,
      url: `${baseUrl}${toolCategories[category].path}`
    })
  }

  breadcrumbs.push({
    name: toolName,
    url: `${baseUrl}${toolPath}`
  })

  return breadcrumbs
}

/**
 * Get related tools for a page
 */
export function getRelatedTools(
  currentPath: string,
  category?: string,
  limit: number = 6
): RelatedTool[] {
  if (!category || !toolCategories[category]) {
    return []
  }

  const categoryTools = toolCategories[category].tools
  const related = categoryTools
    .filter(tool => tool.path !== currentPath)
    .slice(0, limit)
    .map(tool => ({
      name: tool.name,
      path: tool.path,
      description: tool.description,
      icon: tool.icon
    }))

  return related
}

/**
 * Get category for a tool path
 */
export function getCategoryForPath(path: string): string | undefined {
  for (const [categoryKey, category] of Object.entries(toolCategories)) {
    if (category.tools.some(tool => tool.path === path)) {
      return categoryKey
    }
  }
  return undefined
}

/**
 * Get tool name from path
 */
export function getToolNameFromPath(path: string): string {
  for (const category of Object.values(toolCategories)) {
    const tool = category.tools.find(t => t.path === path)
    if (tool) {
      return tool.name
    }
  }
  // Fallback: generate name from path
  return path
    .split('/')
    .pop()!
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

