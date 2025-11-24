'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'
import AdBanner from '@/components/AdBanner'
import StructuredData from '@/components/StructuredData'
import { generateItemListSchema, generateOrganizationSchema } from '@/lib/structured-data'

const categories = [
  {
    name: 'QR/Network',
    icon: '📶',
    color: 'from-violet-500 to-purple-500',
    tools: [
      { name: 'QR Tools', path: '/qr-tools', icon: '📱', desc: 'Generate and read QR codes in one place' },
      { name: 'Barcode Generator', path: '/barcode-generator', icon: '📊', desc: 'Create EAN, Code128, Code39 barcodes' },
      { name: 'URL Tools', path: '/url-tools', icon: '🔗', desc: 'URL encoder, parser & query builder' },
    ]
  },
  {
    name: 'Colors',
    icon: '🎨',
    color: 'from-pink-500 to-rose-500',
    tools: [
      { name: 'Color Generator', path: '/color-generator', icon: '🎨', desc: 'Random colors, palettes, and gradients' },
      { name: 'Color Converter', path: '/color-converter', icon: '🔄', desc: 'HEX ↔ RGB ↔ HSL' },
      { name: 'Palette from Image', path: '/color-palette-from-image', icon: '🖼️', desc: 'Extract color palette from images' },
    ]
  },
  {
    name: 'Generators',
    icon: '🎲',
    color: 'from-blue-500 to-cyan-500',
    tools: [
      { name: 'UUID/GUID', path: '/uuid-generator', icon: '🆔', desc: 'Unique identifier generator' },
      { name: 'Name Generator', path: '/name-generator', icon: '👤', desc: 'Random names and nicknames' },
      { name: 'Number Generator', path: '/number-generator', icon: '🎲', desc: 'Generator for lotteries and games' },
    ]
  },
  {
    name: 'Images',
    icon: '🖼️',
    color: 'from-purple-500 to-pink-500',
    tools: [
      { name: 'Watermark', path: '/watermark', icon: '💧', desc: 'Add watermark to images' },
      { name: 'Placeholder Generator', path: '/placeholder-generator', icon: '🖼️', desc: 'Generate placeholder images' },
      { name: 'Favicon Generator', path: '/favicon-generator', icon: '🎯', desc: 'Create favicons from images' },
      { name: 'Avatar Generator', path: '/avatar-generator', icon: '👤', desc: 'Random geometric avatars' },
      { name: 'Image Editor', path: '/image-resizer', icon: '🖼️', desc: 'Resize, compress, rotate & flip images' },
    ]
  },
  {
    name: 'Text',
    icon: '📝',
    color: 'from-green-500 to-emerald-500',
    tools: [
      { name: 'Lorem Ipsum', path: '/lorem-generator', icon: '📝', desc: 'Placeholder text for design' },
      { name: 'Word Counter', path: '/word-counter', icon: '🔢', desc: 'Count words and characters' },
      { name: 'Text Tools', path: '/text-tools', icon: '⌨️', desc: 'Case converter, text cleaner, and text reverser' },
      { name: 'Text Diff', path: '/text-diff', icon: '🔍', desc: 'Compare two texts' },
      { name: 'Slug Generator', path: '/slug-generator', icon: '🔗', desc: 'URL-friendly string generator' },
      { name: 'Transliteration', path: '/transliteration', icon: '🔄', desc: 'Cyrillic ↔ Latin conversion' },
    ]
  },
  {
    name: 'Converters',
    icon: '🔄',
    color: 'from-orange-500 to-red-500',
    tools: [
      { name: 'Base64 Converter', path: '/base64-converter', icon: '📦', desc: 'Text and image encoding' },
      { name: 'CSV ↔ JSON', path: '/csv-json-converter', icon: '🔄', desc: 'Convert CSV to JSON and back' },
      { name: 'Morse Code', path: '/morse-code-encoder', icon: '📡', desc: 'Encode/decode Morse code with audio' },
      { name: 'Temperature', path: '/temperature-converter', icon: '🌡️', desc: 'Convert Celsius, Fahrenheit, Kelvin' },
      { name: 'Unit Converter', path: '/unit-converter', icon: '📏', desc: 'Convert length, weight, volume, area, time' },
      { name: 'Text ↔ Binary', path: '/text-to-binary', icon: '💻', desc: 'Convert text to binary and binary to text' },
      { name: 'Roman Numerals', path: '/roman-numerals-converter', icon: '🔢', desc: 'Convert numbers to Roman numerals and back' },
      { name: 'Number Base Converter', path: '/number-base-converter', icon: '🔢', desc: 'Convert between binary, octal, decimal, and hex' },
    ]
  },
  {
    name: 'Code',
    icon: '💻',
    color: 'from-indigo-500 to-blue-500',
    tools: [
      { name: 'JSON Formatter', path: '/json-formatter', icon: '📋', desc: 'Format and validate JSON' },
      { name: 'CSS Formatter', path: '/css-formatter', icon: '🎨', desc: 'Format and minify CSS code' },
      { name: 'JavaScript Formatter', path: '/js-formatter', icon: '💻', desc: 'Format and minify JavaScript code' },
      { name: 'HTML Entity Encoder', path: '/html-entity-encoder', icon: '🔤', desc: 'Encode/decode HTML entities and format HTML' },
      { name: 'SQL Formatter', path: '/sql-formatter', icon: '💾', desc: 'Format and beautify SQL queries' },
      { name: 'XML Formatter', path: '/xml-formatter', icon: '📄', desc: 'Format, minify and validate XML' },
      { name: 'YAML Formatter', path: '/yaml-formatter', icon: '📝', desc: 'Format YAML and convert to/from JSON' },
      { name: 'HTTP Status Codes', path: '/http-status-codes', icon: '📡', desc: 'Complete reference of HTTP status codes' },
      { name: 'Test Data Generator', path: '/test-data-generator', icon: '🧪', desc: 'Generate fake data for testing' },
      { name: 'Regex Tools', path: '/regex-tools', icon: '🔎', desc: 'Test and build regular expressions' },
      { name: 'Markdown Preview', path: '/markdown', icon: '📄', desc: 'Markdown preview' },
      { name: 'JWT Decoder & Generator', path: '/jwt-decoder', icon: '🔐', desc: 'Decode and generate JWT tokens' },
    ]
  },
  {
    name: 'CSS/Design',
    icon: '🎨',
    color: 'from-pink-500 to-rose-500',
    tools: [
      { name: 'CSS Generators', path: '/css-generators', icon: '💎', desc: 'Box shadow, border radius, and text shadow generators' },
      { name: 'Font Pairing', path: '/font-pairing-generator', icon: '🔤', desc: 'Discover beautiful Google Fonts combinations' },
      { name: 'Contrast Checker', path: '/contrast-checker', icon: '🎯', desc: 'Check WCAG color contrast ratio' },
      { name: 'CSS Animation', path: '/css-animation-generator', icon: '🎬', desc: 'Generate CSS animations and keyframes' },
      { name: 'Color Blindness', path: '/color-blindness-simulator', icon: '👁️', desc: 'Simulate color blindness for accessibility testing' },
      { name: 'Typography Scale', path: '/typography-scale-generator', icon: '📐', desc: 'Generate perfect typography scales' },
      { name: 'Grid/Flexbox', path: '/layout-generator', icon: '📐', desc: 'CSS Grid and Flexbox generator' },
    ]
  },
  {
    name: 'Security',
    icon: '🔒',
    color: 'from-red-500 to-orange-500',
    tools: [
      { name: 'Password Generator', path: '/password-generator', icon: '🔐', desc: 'Generate secure passwords and check strength' },
      { name: 'Hash Generator', path: '/hash-generator', icon: '🔐', desc: 'MD5, SHA-1, SHA-256, SHA-512, HMAC' },
      { name: 'Text Encryption', path: '/text-encryption', icon: '🔒', desc: 'Caesar cipher and Base64' },
    ]
  },
  {
    name: 'Time',
    icon: '⏰',
    color: 'from-teal-500 to-cyan-500',
    tools: [
      { name: 'World Clock', path: '/world-clock', icon: '🌍', desc: 'Time in different cities' },
      { name: 'Date & Age Calculator', path: '/date-calculator', icon: '📅', desc: 'Calculate date differences & age' },
      { name: 'Timezone Converter', path: '/timezone-converter', icon: '🌍', desc: 'Time converter between zones' },
      { name: 'Unix Timestamp', path: '/unix-timestamp-converter', icon: '⏰', desc: 'Convert timestamp to date and time' },
    ]
  },
  {
    name: 'Entertainment',
    icon: '🎮',
    color: 'from-purple-500 to-pink-500',
    tools: [
      { name: 'Dice Roller', path: '/dice-roller', icon: '🎲', desc: 'D&D dice with bonuses' },
      { name: 'Decision Generator', path: '/decision-generator', icon: '🎯', desc: 'Yes/No and Magic 8 Ball' },
      { name: 'Wheel of Fortune', path: '/wheel-of-fortune', icon: '🎡', desc: 'Random choice from options' },
      { name: 'Meme Generator', path: '/meme-generator', icon: '😂', desc: 'Create memes with text' },
      { name: 'ASCII Art', path: '/ascii-art', icon: '🎨', desc: 'Generate ASCII art from text' },
      { name: 'Palindrome Checker', path: '/palindrome-checker', icon: '🔄', desc: 'Check if text is palindrome' },
    ]
  },
]

export default function Home() {
  // Generate structured data for homepage
  const allTools = categories.flatMap(category => 
    category.tools.map(tool => ({
      name: tool.name,
      url: `https://prylad.pro${tool.path}`,
      description: tool.desc
    }))
  )

  const structuredData = [
    generateItemListSchema(
      'Free Online Tools - Prylad',
      'Complete collection of free online tools for development, design, and data work. All tools work in your browser without registration.',
      allTools
    ),
    generateOrganizationSchema()
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 lg:ml-80">
        {/* Header */}
        <header className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center max-w-4xl mx-auto overflow-visible">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 flex items-center justify-center gap-3 overflow-visible">
              <span className="text-5xl md:text-6xl lg:text-7xl">🛠️</span>
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap leading-tight" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', padding: '0 2px' }}>Prylad</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              All essential tools for development, design, and data work in one place.
              <br />
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-2 block">
                Free, fast, no registration required
              </span>
            </p>
          </div>
        </header>

        {/* Top ad banner */}
        <div className="container mx-auto px-4 mb-8">
          <AdBanner position="top" />
        </div>

        {/* Tools by categories */}
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-12">
            {categories.map((category) => (
              <div key={category.name} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {category.icon}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {category.name}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.tools.map((tool) => (
                    <Link
                      key={tool.path}
                      href={tool.path}
                      className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-primary-300 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">{tool.icon}</span>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 transition-colors">
                            {tool.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{tool.desc}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom ad banner */}
        <div className="container mx-auto px-4 mt-12 mb-8">
          <AdBanner position="bottom" />
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-2 font-medium">© 2025 Prylad</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              All tools are free and work in the browser
            </p>
            <a
              href="https://buymeacoffee.com/mgrushevsky"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <span>☕</span>
              <span>Support us</span>
            </a>
          </div>
        </footer>
      </main>
    </>
  )
}
