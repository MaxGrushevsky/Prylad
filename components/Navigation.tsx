'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import SearchModal from './SearchModal'

const categories = [
  {
    name: 'QR/Network',
    icon: '📶',
    tools: [
      { name: 'QR Code', path: '/qr-generator', icon: '📱' },
      { name: 'URL Encoder', path: '/url-encoder', icon: '🔗' },
    ]
  },
  {
    name: 'Colors',
    icon: '🎨',
    tools: [
      { name: 'Color Generator', path: '/color-generator', icon: '🎨' },
      { name: 'Gradient Generator', path: '/gradient-generator', icon: '🌈' },
      { name: 'Color Converter', path: '/color-converter', icon: '🔄' },
    ]
  },
  {
    name: 'Generators',
    icon: '🎲',
    tools: [
      { name: 'UUID', path: '/uuid-generator', icon: '🆔' },
      { name: 'Names', path: '/name-generator', icon: '👤' },
    ]
  },
  {
    name: 'Random Numbers',
    icon: '🔢',
    tools: [
      { name: 'Number Generator', path: '/number-generator', icon: '🎲' },
    ]
  },
  {
    name: 'Games',
    icon: '🎮',
    tools: [
      { name: 'Dice Roller', path: '/dice-roller', icon: '🎲' },
      { name: 'Decision', path: '/decision-generator', icon: '🎯' },
      { name: 'Wheel of Fortune', path: '/wheel-of-fortune', icon: '🎡' },
    ]
  },
  {
    name: 'Images',
    icon: '🖼️',
    tools: [
      { name: 'Watermark', path: '/watermark', icon: '💧' },
      { name: 'Placeholder', path: '/placeholder-generator', icon: '🖼️' },
      { name: 'Favicon', path: '/favicon-generator', icon: '🎯' },
      { name: 'Avatar', path: '/avatar-generator', icon: '👤' },
      { name: 'Meme', path: '/meme-generator', icon: '😂' },
      { name: 'ASCII Art', path: '/ascii-art', icon: '🎨' },
    ]
  },
  {
    name: 'Text',
    icon: '📝',
    tools: [
      { name: 'Lorem Ipsum', path: '/lorem-generator', icon: '📝' },
      { name: 'Word Counter', path: '/word-counter', icon: '🔢' },
      { name: 'Text Case', path: '/text-case', icon: '⌨️' },
      { name: 'Text Cleaner', path: '/text-cleaner', icon: '🧹' },
      { name: 'Text Diff', path: '/text-diff', icon: '🔍' },
      { name: 'Slug Generator', path: '/slug-generator', icon: '🔗' },
      { name: 'Transliteration', path: '/transliteration', icon: '🔄' },
      { name: 'Palindrome', path: '/palindrome-checker', icon: '🔄' },
    ]
  },
  {
    name: 'Converters',
    icon: '🔄',
    tools: [
      { name: 'Base64', path: '/base64-converter', icon: '📦' },
    ]
  },
  {
    name: 'Code',
    icon: '💻',
    tools: [
      { name: 'JSON Formatter', path: '/json-formatter', icon: '📋' },
      { name: 'Code Minifier & Beautifier', path: '/minifier', icon: '⚡' },
      { name: 'Regex Tester', path: '/regex-tester', icon: '🔎' },
      { name: 'Markdown', path: '/markdown', icon: '📄' },
    ]
  },
  {
    name: 'CSS/Design',
    icon: '🎨',
    tools: [
      { name: 'Box Shadow', path: '/box-shadow', icon: '💎' },
      { name: 'Grid/Flexbox', path: '/layout-generator', icon: '📐' },
    ]
  },
  {
    name: 'Security',
    icon: '🔒',
    tools: [
      { name: 'Password', path: '/password-generator', icon: '🔐' },
      { name: 'Hash', path: '/hash-generator', icon: '🔐' },
      { name: 'Text Encryption', path: '/text-encryption', icon: '🔒' },
    ]
  },
  {
    name: 'Time',
    icon: '⏰',
    tools: [
      { name: 'World Clock', path: '/world-clock', icon: '🌍' },
      { name: 'Age Calculator', path: '/age-calculator', icon: '📅' },
      { name: 'Date Calculator', path: '/date-calculator', icon: '📅' },
      { name: 'Timezones', path: '/timezone-converter', icon: '🌍' },
    ]
  },
]

export default function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollRestoredRef = useRef(false)
  
  // Load saved expanded categories from localStorage on mount
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('navExpandedCategories')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          return {}
        }
      }
    }
    return {}
  })

  // Restore scroll position immediately when container is mounted
  const setScrollContainerRef = (element: HTMLDivElement | null) => {
    scrollContainerRef.current = element
    
    if (element && !scrollRestoredRef.current) {
      const savedScrollPosition = localStorage.getItem('navScrollPosition')
      if (savedScrollPosition) {
        const scrollPos = parseInt(savedScrollPosition, 10)
        
        // Set immediately to prevent visual jump
        element.scrollTop = scrollPos
        
        // Verify and fix position after content is rendered (max 3 attempts)
        let attempts = 0
        const maxAttempts = 3
        const verifyScroll = () => {
          attempts++
          if (element && element.scrollTop !== scrollPos && attempts < maxAttempts) {
            // Only restore if content height allows it
            if (element.scrollHeight >= scrollPos) {
              element.scrollTop = scrollPos
            }
            requestAnimationFrame(verifyScroll)
          } else {
            scrollRestoredRef.current = true
          }
        }
        
        requestAnimationFrame(verifyScroll)
      } else {
        scrollRestoredRef.current = true
      }
    }
  }

  // Save scroll position to localStorage
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      if (scrollRestoredRef.current) {
        localStorage.setItem('navScrollPosition', container.scrollTop.toString())
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Save expanded categories to localStorage
  useEffect(() => {
    localStorage.setItem('navExpandedCategories', JSON.stringify(expandedCategories))
  }, [expandedCategories])

  // Keyboard shortcut for search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen])

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }))
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 bg-white p-3 rounded-lg shadow-lg border border-gray-200"
        aria-label="Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Navigation */}
      <nav
        className={`fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 shadow-xl z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div ref={setScrollContainerRef} className="p-6 h-full overflow-y-auto">
          <div className="mb-6">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                🛠️ Tools
              </h1>
              <p className="text-sm text-gray-500 mt-1">All tools in one place</p>
            </Link>
          </div>

          {/* Search Button */}
          <div className="mb-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-between w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm text-gray-600">Search tools...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-300 rounded">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}K
              </kbd>
            </button>
          </div>

          {/* Buy Me a Coffee Button */}
          <div className="mb-6">
            <a
              href="https://buymeacoffee.com/mgrushevsky"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              <span className="text-xl">☕</span>
              <span>Buy Me a Coffee</span>
            </a>
          </div>

          <div className="space-y-2">
            {categories.map((category) => {
              const isExpanded = expandedCategories[category.name] ?? true
              return (
                <div key={category.name} className="mb-2">
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-semibold text-gray-700">{category.name}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {category.tools.map((tool) => {
                        const isActive = pathname === tool.path
                        return (
                          <Link
                            key={tool.path}
                            href={tool.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                              isActive
                                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className="text-lg">{tool.icon}</span>
                            <span className="font-medium text-sm">{tool.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
