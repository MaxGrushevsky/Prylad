'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Tool {
  name: string
  path: string
  icon: string
  desc: string
  category: string
  categoryIcon: string
}

const allTools: Tool[] = [
  { name: 'QR Tools', path: '/qr-tools', icon: '📱', desc: 'Generate and read QR codes in one place', category: 'QR/Network', categoryIcon: '📶' },
  { name: 'Barcode Generator', path: '/barcode-generator', icon: '📊', desc: 'Create EAN, Code128, Code39 barcodes', category: 'QR/Network', categoryIcon: '📶' },
  { name: 'URL Tools', path: '/url-tools', icon: '🔗', desc: 'URL encoder, parser & query builder', category: 'QR/Network', categoryIcon: '📶' },
  { name: 'Color Generator', path: '/color-generator', icon: '🎨', desc: 'Random colors, palettes, and gradients', category: 'Colors', categoryIcon: '🎨' },
  { name: 'Color Converter', path: '/color-converter', icon: '🔄', desc: 'HEX ↔ RGB ↔ HSL', category: 'Colors', categoryIcon: '🎨' },
  { name: 'Palette from Image', path: '/color-palette-from-image', icon: '🖼️', desc: 'Extract color palette from images', category: 'Colors', categoryIcon: '🎨' },
  { name: 'UUID/GUID', path: '/uuid-generator', icon: '🆔', desc: 'Unique identifier generator', category: 'Generators', categoryIcon: '🎲' },
  { name: 'Name Generator', path: '/name-generator', icon: '👤', desc: 'Random names and nicknames', category: 'Generators', categoryIcon: '🎲' },
  { name: 'Number Generator', path: '/number-generator', icon: '🎲', desc: 'Generator for lotteries and games', category: 'Generators', categoryIcon: '🎲' },
  { name: 'Watermark', path: '/watermark', icon: '💧', desc: 'Add watermark to images', category: 'Images', categoryIcon: '🖼️' },
  { name: 'Placeholder Generator', path: '/placeholder-generator', icon: '🖼️', desc: 'Generate placeholder images', category: 'Images', categoryIcon: '🖼️' },
  { name: 'Favicon Generator', path: '/favicon-generator', icon: '🎯', desc: 'Create favicons from images', category: 'Images', categoryIcon: '🖼️' },
  { name: 'Avatar Generator', path: '/avatar-generator', icon: '👤', desc: 'Random geometric avatars', category: 'Images', categoryIcon: '🖼️' },
  { name: 'Image Editor', path: '/image-resizer', icon: '🖼️', desc: 'Resize, compress, rotate & flip images', category: 'Images', categoryIcon: '🖼️' },
  { name: 'Image Format Converter', path: '/image-format-converter', icon: '🔄', desc: 'Convert images between PNG, JPG, WebP, SVG', category: 'Images', categoryIcon: '🖼️' },
  { name: 'Lorem Ipsum', path: '/lorem-generator', icon: '📝', desc: 'Placeholder text for design', category: 'Text', categoryIcon: '📝' },
  { name: 'Word Counter', path: '/word-counter', icon: '🔢', desc: 'Count words and characters', category: 'Text', categoryIcon: '📝' },
  { name: 'Text Tools', path: '/text-tools', icon: '⌨️', desc: 'Case converter, text cleaner, and text reverser', category: 'Text', categoryIcon: '📝' },
  { name: 'Text Diff', path: '/text-diff', icon: '🔍', desc: 'Compare two texts', category: 'Text', categoryIcon: '📝' },
  { name: 'Slug Generator', path: '/slug-generator', icon: '🔗', desc: 'URL-friendly string generator', category: 'Text', categoryIcon: '📝' },
  { name: 'Transliteration', path: '/transliteration', icon: '🔄', desc: 'Cyrillic ↔ Latin conversion', category: 'Text', categoryIcon: '📝' },
  { name: 'Character Reference', path: '/character-reference', icon: '🔤', desc: 'ASCII table, Unicode lookup, and emoji picker', category: 'Text', categoryIcon: '📝' },
  { name: 'Speech to Text', path: '/speech-to-text', icon: '🎤', desc: 'Convert speech to text using voice recognition', category: 'Text', categoryIcon: '📝' },
  { name: 'Text to Speech', path: '/text-to-speech', icon: '🔊', desc: 'Convert text to speech with voice selection', category: 'Text', categoryIcon: '📝' },
  { name: 'Base64 Converter', path: '/base64-converter', icon: '📦', desc: 'Text and image encoding', category: 'Converters', categoryIcon: '🔄' },
  { name: 'CSV ↔ JSON', path: '/csv-json-converter', icon: '🔄', desc: 'Convert CSV to JSON and back', category: 'Converters', categoryIcon: '🔄' },
  { name: 'Morse Code', path: '/morse-code-encoder', icon: '📡', desc: 'Encode/decode Morse code with audio', category: 'Converters', categoryIcon: '🔄' },
  { name: 'Temperature Converter', path: '/temperature-converter', icon: '🌡️', desc: 'Convert Celsius, Fahrenheit, Kelvin', category: 'Converters', categoryIcon: '🔄' },
  { name: 'Unit Converter', path: '/unit-converter', icon: '📏', desc: 'Convert length, weight, volume, area, time', category: 'Converters', categoryIcon: '🔄' },
  { name: 'Text ↔ Binary', path: '/text-to-binary', icon: '💻', desc: 'Convert text to binary and binary to text', category: 'Converters', categoryIcon: '🔄' },
  { name: 'Roman Numerals', path: '/roman-numerals-converter', icon: '🔢', desc: 'Convert numbers to Roman numerals and back', category: 'Converters', categoryIcon: '🔄' },
  { name: 'Number Base Converter', path: '/number-base-converter', icon: '🔢', desc: 'Convert between binary, octal, decimal, and hex', category: 'Converters', categoryIcon: '🔄' },
  { name: 'JSON Formatter', path: '/json-formatter', icon: '📋', desc: 'Format and validate JSON', category: 'Code', categoryIcon: '💻' },
  { name: 'JSONPath Query', path: '/json-path-query', icon: '🔍', desc: 'Query JSON data using JSONPath expressions', category: 'Code', categoryIcon: '💻' },
  { name: 'CSS Formatter', path: '/css-formatter', icon: '🎨', desc: 'Format and minify CSS code', category: 'Code', categoryIcon: '💻' },
  { name: 'JavaScript Formatter', path: '/js-formatter', icon: '💻', desc: 'Format and minify JavaScript code', category: 'Code', categoryIcon: '💻' },
  { name: 'HTML Entity Encoder', path: '/html-entity-encoder', icon: '🔤', desc: 'Encode/decode HTML entities and format HTML', category: 'Code', categoryIcon: '💻' },
  { name: 'SQL Formatter', path: '/sql-formatter', icon: '💾', desc: 'Format and beautify SQL queries', category: 'Code', categoryIcon: '💻' },
  { name: 'XML Formatter', path: '/xml-formatter', icon: '📄', desc: 'Format, minify and validate XML', category: 'Code', categoryIcon: '💻' },
  { name: 'YAML Formatter', path: '/yaml-formatter', icon: '📝', desc: 'Format YAML and convert to/from JSON', category: 'Code', categoryIcon: '💻' },
  { name: 'HTTP Status Codes', path: '/http-status-codes', icon: '📡', desc: 'Complete reference of HTTP status codes', category: 'Code', categoryIcon: '💻' },
  { name: 'Test Data Generator', path: '/test-data-generator', icon: '🧪', desc: 'Generate fake data for testing', category: 'Code', categoryIcon: '💻' },
  { name: 'Regex Tools', path: '/regex-tools', icon: '🔎', desc: 'Test and build regular expressions', category: 'Code', categoryIcon: '💻' },
  { name: 'Cron Expression', path: '/cron-expression-generator', icon: '⏰', desc: 'Generate and parse cron expressions', category: 'Code', categoryIcon: '💻' },
  { name: 'Markdown Preview', path: '/markdown', icon: '📄', desc: 'Markdown preview', category: 'Code', categoryIcon: '💻' },
  { name: 'JWT Decoder & Generator', path: '/jwt-decoder', icon: '🔐', desc: 'Decode and generate JWT tokens with custom payload', category: 'Security', categoryIcon: '🔒' },
  { name: 'CSS Generators', path: '/css-generators', icon: '💎', desc: 'Box shadow, border radius, and text shadow generators', category: 'CSS/Design', categoryIcon: '🎨' },
  { name: 'Font Pairing', path: '/font-pairing-generator', icon: '🔤', desc: 'Discover beautiful Google Fonts combinations', category: 'CSS/Design', categoryIcon: '🎨' },
  { name: 'Contrast Checker', path: '/contrast-checker', icon: '🎯', desc: 'Check WCAG color contrast ratio', category: 'CSS/Design', categoryIcon: '🎨' },
  { name: 'CSS Animation', path: '/css-animation-generator', icon: '🎬', desc: 'Generate CSS animations and keyframes', category: 'CSS/Design', categoryIcon: '🎨' },
  { name: 'Color Blindness', path: '/color-blindness-simulator', icon: '👁️', desc: 'Simulate color blindness for accessibility testing', category: 'CSS/Design', categoryIcon: '🎨' },
  { name: 'Typography Scale', path: '/typography-scale-generator', icon: '📐', desc: 'Generate perfect typography scales', category: 'CSS/Design', categoryIcon: '🎨' },
  { name: 'Grid/Flexbox', path: '/layout-generator', icon: '📐', desc: 'CSS Grid and Flexbox generator', category: 'CSS/Design', categoryIcon: '🎨' },
  { name: 'Password Generator', path: '/password-generator', icon: '🔐', desc: 'Generate secure passwords and check strength', category: 'Security', categoryIcon: '🔒' },
  { name: 'Hash Generator', path: '/hash-generator', icon: '🔐', desc: 'MD5, SHA-1, SHA-256, SHA-512, HMAC', category: 'Security', categoryIcon: '🔒' },
  { name: 'Text Encryption', path: '/text-encryption', icon: '🔒', desc: 'Caesar cipher and Base64', category: 'Security', categoryIcon: '🔒' },
  { name: 'World Clock', path: '/world-clock', icon: '🌍', desc: 'Time in different cities', category: 'Time', categoryIcon: '⏰' },
  { name: 'Date & Age Calculator', path: '/date-calculator', icon: '📅', desc: 'Calculate date differences & age', category: 'Time', categoryIcon: '⏰' },
  { name: 'Timezone Converter', path: '/timezone-converter', icon: '🌍', desc: 'Time converter between zones', category: 'Time', categoryIcon: '⏰' },
  { name: 'Unix Timestamp Converter', path: '/unix-timestamp-converter', icon: '⏰', desc: 'Convert timestamp to date and time', category: 'Time', categoryIcon: '⏰' },
  { name: 'Dice Roller', path: '/dice-roller', icon: '🎲', desc: 'D&D dice with bonuses', category: 'Entertainment', categoryIcon: '🎮' },
  { name: 'Decision Generator', path: '/decision-generator', icon: '🎯', desc: 'Yes/No and Magic 8 Ball', category: 'Entertainment', categoryIcon: '🎮' },
  { name: 'Wheel of Fortune', path: '/wheel-of-fortune', icon: '🎡', desc: 'Random choice from options', category: 'Entertainment', categoryIcon: '🎮' },
  { name: 'Meme Generator', path: '/meme-generator', icon: '😂', desc: 'Create memes with text', category: 'Entertainment', categoryIcon: '🎮' },
  { name: 'ASCII Art', path: '/ascii-art', icon: '🎨', desc: 'Generate ASCII art from text', category: 'Entertainment', categoryIcon: '🎮' },
  { name: 'Palindrome Checker', path: '/palindrome-checker', icon: '🔄', desc: 'Check if text is palindrome', category: 'Entertainment', categoryIcon: '🎮' },
]

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedItemRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const trimmedQuery = query.trim()
  const hasQuery = trimmedQuery.length > 0

  const filteredTools = hasQuery
    ? allTools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
          tool.desc.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
          tool.category.toLowerCase().includes(trimmedQuery.toLowerCase())
      )
    : []

  const [recentTools, setRecentTools] = useState<Tool[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentTools')
      if (saved) {
        try {
          const paths = JSON.parse(saved)
          return paths
            .map((path: string) => allTools.find((t) => t.path === path))
            .filter((t: Tool | undefined): t is Tool => t !== undefined)
            .slice(0, 5)
        } catch {
          return []
        }
      }
    }
    return []
  })

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (hasQuery) setSelectedIndex(0)
  }, [hasQuery])

  const handleSelect = useCallback((tool: Tool) => {
    const currentRecent = recentTools.filter((t) => t.path !== tool.path)
    const newRecent = [tool, ...currentRecent].slice(0, 5)
    setRecentTools(newRecent)
    localStorage.setItem('recentTools', JSON.stringify(newRecent.map((t) => t.path)))

    onClose()
    router.push(tool.path)
  }, [recentTools, onClose, router])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const tools = hasQuery ? filteredTools : recentTools

    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }

    if (tools.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % tools.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + tools.length) % tools.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const tool = tools[selectedIndex] ?? tools[tools.length - 1]
      if (tool) handleSelect(tool)
    }
  }, [hasQuery, filteredTools, recentTools, selectedIndex, handleSelect, onClose])

  const displayTools = hasQuery ? filteredTools : recentTools
  const showRecent = !hasQuery && recentTools.length > 0
  const safeSelectedIndex =
    displayTools.length > 0 ? Math.min(selectedIndex, displayTools.length - 1) : 0

  useEffect(() => {
    if (displayTools.length > 0) {
      selectedItemRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [safeSelectedIndex, displayTools.length])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search tools"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tools..."
              className="flex-1 text-lg outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
              ESC
            </kbd>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {displayTools.length === 0 && hasQuery ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg font-semibold mb-2">No tools found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : displayTools.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg font-semibold mb-2">No recent tools</p>
              <p className="text-sm">Start using tools to see them here</p>
            </div>
          ) : (
            <>
              {showRecent && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                  Recent
                </div>
              )}
              {displayTools.map((tool, index) => (
                <button
                  type="button"
                  ref={index === safeSelectedIndex ? selectedItemRef : undefined}
                  key={tool.path}
                  onClick={() => handleSelect(tool)}
                  className={`w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                    index === safeSelectedIndex ? 'bg-primary-50 dark:bg-primary-900/30 border-l-4 border-primary-600' : ''
                  }`}
                >
                  <span className="text-2xl">{tool.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{tool.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{tool.desc}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs">{tool.categoryIcon}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{tool.category}</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </>
          )}
        </div>

        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">Enter</kbd>
              <span>Select</span>
            </span>
          </div>
          <span>{displayTools.length} {displayTools.length === 1 ? 'tool' : 'tools'}</span>
        </div>
      </div>
    </div>
  )
}

