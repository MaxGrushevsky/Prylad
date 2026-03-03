'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react'
import SearchModal from './SearchModal'
import { useTheme } from '@/contexts/ThemeContext'

const categories = [
  {
    name: 'QR/Network',
    icon: '📶',
    tools: [
      { name: 'QR Tools', path: '/qr-tools', icon: '📱' },
      { name: 'Barcode', path: '/barcode-generator', icon: '📊' },
      { name: 'URL Tools', path: '/url-tools', icon: '🔗' },
    ]
  },
  {
    name: 'Colors',
    icon: '🎨',
    tools: [
      { name: 'Color Generator', path: '/color-generator', icon: '🎨' },
      { name: 'Color Converter', path: '/color-converter', icon: '🔄' },
      { name: 'Palette from Image', path: '/color-palette-from-image', icon: '🖼️' },
    ]
  },
  {
    name: 'Generators',
    icon: '🎲',
    tools: [
      { name: 'UUID', path: '/uuid-generator', icon: '🆔' },
      { name: 'Names', path: '/name-generator', icon: '👤' },
      { name: 'Number Generator', path: '/number-generator', icon: '🎲' },
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
      { name: 'Image Editor', path: '/image-resizer', icon: '🖼️' },
      { name: 'Image Format Converter', path: '/image-format-converter', icon: '🔄' },
    ]
  },
  {
    name: 'Text',
    icon: '📝',
    tools: [
      { name: 'Lorem Ipsum', path: '/lorem-generator', icon: '📝' },
      { name: 'Word Counter', path: '/word-counter', icon: '🔢' },
      { name: 'Text Tools', path: '/text-tools', icon: '⌨️' },
      { name: 'Text Diff', path: '/text-diff', icon: '🔍' },
      { name: 'Slug Generator', path: '/slug-generator', icon: '🔗' },
      { name: 'Transliteration', path: '/transliteration', icon: '🔄' },
      { name: 'Character Reference', path: '/character-reference', icon: '🔤' },
      { name: 'Speech to Text', path: '/speech-to-text', icon: '🎤' },
      { name: 'Text to Speech', path: '/text-to-speech', icon: '🔊' },
    ]
  },
  {
    name: 'Converters',
    icon: '🔄',
    tools: [
      { name: 'Base64', path: '/base64-converter', icon: '📦' },
      { name: 'CSV ↔ JSON', path: '/csv-json-converter', icon: '🔄' },
      { name: 'Morse Code', path: '/morse-code-encoder', icon: '📡' },
      { name: 'Temperature', path: '/temperature-converter', icon: '🌡️' },
      { name: 'Unit Converter', path: '/unit-converter', icon: '📏' },
      { name: 'Text ↔ Binary', path: '/text-to-binary', icon: '💻' },
      { name: 'Roman Numerals', path: '/roman-numerals-converter', icon: '🔢' },
      { name: 'Number Base', path: '/number-base-converter', icon: '🔢' },
    ]
  },
  {
    name: 'Code',
    icon: '💻',
    tools: [
      { name: 'JSON Formatter', path: '/json-formatter', icon: '📋' },
      { name: 'CSS Formatter', path: '/css-formatter', icon: '🎨' },
      { name: 'JavaScript Formatter', path: '/js-formatter', icon: '💻' },
      { name: 'HTML Entities', path: '/html-entity-encoder', icon: '🔤' },
      { name: 'SQL Formatter', path: '/sql-formatter', icon: '💾' },
      { name: 'XML Formatter', path: '/xml-formatter', icon: '📄' },
      { name: 'YAML Formatter', path: '/yaml-formatter', icon: '📝' },
      { name: 'HTTP Status Codes', path: '/http-status-codes', icon: '📡' },
      { name: 'Test Data Generator', path: '/test-data-generator', icon: '🧪' },
      { name: 'Regex Tools', path: '/regex-tools', icon: '🔎' },
      { name: 'Markdown', path: '/markdown', icon: '📄' },
      { name: 'JWT Decoder & Generator', path: '/jwt-decoder', icon: '🔐' },
    ]
  },
  {
    name: 'CSS/Design',
    icon: '🎨',
    tools: [
      { name: 'CSS Generators', path: '/css-generators', icon: '💎' },
      { name: 'Font Pairing', path: '/font-pairing-generator', icon: '🔤' },
      { name: 'Contrast Checker', path: '/contrast-checker', icon: '🎯' },
      { name: 'CSS Animation', path: '/css-animation-generator', icon: '🎬' },
      { name: 'Color Blindness', path: '/color-blindness-simulator', icon: '👁️' },
      { name: 'Typography Scale', path: '/typography-scale-generator', icon: '📐' },
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
      { name: 'Date & Age Calculator', path: '/date-calculator', icon: '📅' },
      { name: 'Timezones', path: '/timezone-converter', icon: '🌍' },
      { name: 'Unix Timestamp', path: '/unix-timestamp-converter', icon: '⏰' },
    ]
  },
  {
    name: 'Entertainment',
    icon: '🎮',
    tools: [
      { name: 'Dice Roller', path: '/dice-roller', icon: '🎲' },
      { name: 'Decision', path: '/decision-generator', icon: '🎯' },
      { name: 'Wheel of Fortune', path: '/wheel-of-fortune', icon: '🎡' },
      { name: 'Meme Generator', path: '/meme-generator', icon: '😂' },
      { name: 'ASCII Art', path: '/ascii-art', icon: '🎨' },
      { name: 'Palindrome', path: '/palindrome-checker', icon: '🔄' },
    ]
  },
]

export default function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const scrollRestoredRef = useRef(false)
  const { theme, toggleTheme } = useTheme()
  
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('navExpandedCategories')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return {}
        }
      }
    }
    return {}
  })

  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('navFavorites')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return []
        }
      }
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem('navFavorites', JSON.stringify(favorites))
  }, [favorites])

  const allTools = useMemo(() => 
    categories.flatMap(category => 
      category.tools.map(tool => ({ ...tool, category: category.name, categoryIcon: category.icon }))
    ), []
  )

  const favoriteTools = useMemo(() => 
    allTools.filter(tool => favorites.includes(tool.path)), 
    [allTools, favorites]
  )

  const toggleFavorite = useCallback((path: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites(prev => {
      if (prev.includes(path)) {
        return prev.filter(p => p !== path)
      } else {
        return [...prev, path]
      }
    })
  }, [])

  const saveScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current
    if (container && container.scrollTop > 0) {
      localStorage.setItem('navScrollPosition', container.scrollTop.toString())
    }
  }, [])

  const handleLinkMouseDown = useCallback(() => {
    saveScrollPosition()
  }, [saveScrollPosition])

  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    saveScrollPosition()
    scrollRestoredRef.current = false
    setIsOpen(false)
  }, [saveScrollPosition])

  const restoreScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return false

    const savedScrollPosition = localStorage.getItem('navScrollPosition')
    if (!savedScrollPosition) return false

    const scrollPos = parseInt(savedScrollPosition, 10)
    if (isNaN(scrollPos)) return false

    if (container.scrollHeight < scrollPos) return false

    container.scrollTop = scrollPos
    return true
  }, [])

  const setScrollContainerRef = (element: HTMLDivElement | null) => {
    scrollContainerRef.current = element

    if (element) {
      scrollRestoredRef.current = false

      const savedScrollPosition = localStorage.getItem('navScrollPosition')
      if (savedScrollPosition) {
        const scrollPos = parseInt(savedScrollPosition, 10)
        if (!isNaN(scrollPos)) {
          const tryRestore = (attempt = 0) => {
            if (element.scrollHeight >= scrollPos) {
              element.scrollTop = scrollPos
              scrollRestoredRef.current = true
            } else if (attempt < 10) {
              setTimeout(() => tryRestore(attempt + 1), 50)
            } else {
              scrollRestoredRef.current = true
            }
          }
          tryRestore()
        } else {
          scrollRestoredRef.current = true
        }
      } else {
        scrollRestoredRef.current = true
      }
    }
  }

  useLayoutEffect(() => {
    const container = scrollContainerRef.current
    if (!container) {
      scrollRestoredRef.current = false
      return
    }

    scrollRestoredRef.current = false

    const savedScrollPosition = localStorage.getItem('navScrollPosition')
    if (savedScrollPosition) {
      const scrollPos = parseInt(savedScrollPosition, 10)
      if (!isNaN(scrollPos)) {
        if (container.scrollHeight >= scrollPos) {
          container.scrollTop = scrollPos
          scrollRestoredRef.current = true
        } else {
          scrollRestoredRef.current = false
        }
      } else {
        scrollRestoredRef.current = true
      }
    } else {
      scrollRestoredRef.current = true
    }
  }, [pathname])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    if (scrollRestoredRef.current) return

    let attempts = 0
    const maxAttempts = 20
    let timeoutId: NodeJS.Timeout | null = null
    
    const tryRestore = () => {
      attempts++
      const restored = restoreScrollPosition()
      
      if (restored) {
        scrollRestoredRef.current = true
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      } else if (attempts < maxAttempts) {
        timeoutId = setTimeout(tryRestore, 50)
      } else {
        scrollRestoredRef.current = true
      }
    }

    requestAnimationFrame(() => {
      tryRestore()
    })

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [expandedCategories, restoreScrollPosition])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    if (scrollRestoredRef.current) return

    const observer = new MutationObserver(() => {
      if (!scrollRestoredRef.current) {
        const restored = restoreScrollPosition()
        if (restored) {
          scrollRestoredRef.current = true
        }
      }
    })

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    })

    return () => {
      observer.disconnect()
    }
  }, [restoreScrollPosition])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let scrollTimeout: NodeJS.Timeout | null = null
    let lastSavedPosition = container.scrollTop

    const handleScroll = () => {
      const currentPosition = container.scrollTop

      if (currentPosition !== lastSavedPosition && currentPosition > 0 && scrollRestoredRef.current) {
        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
        }
        scrollTimeout = setTimeout(() => {
          localStorage.setItem('navScrollPosition', currentPosition.toString())
          lastSavedPosition = currentPosition
        }, 100)
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('navExpandedCategories', JSON.stringify(expandedCategories))
  }, [expandedCategories])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveScrollPosition()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', saveScrollPosition)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', saveScrollPosition)
    }
  }, [saveScrollPosition])

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

  const toggleCategory = useCallback((categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }))
  }, [])

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
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

      <nav
        className={`fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 pb-4 flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-2 mb-1">
              <Link href="/" onMouseDown={handleLinkMouseDown} onClick={handleLinkClick} className="flex-1">
                <h1 className="text-2xl font-bold flex items-center gap-2 overflow-visible">
                  <span>🛠️</span>
                  <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap leading-tight" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', padding: '0 1px' }}>Prylad</span>
                </h1>
              </Link>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Search tools (⌘K)"
                  aria-label="Search tools"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                >
                  {theme === 'dark' ? (
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">All tools in one place</p>
          </div>

          <div className="mb-0">
            <p className="text-xs text-gray-600 dark:text-gray-300 text-center mb-1.5">
              Do you like it?
            </p>
            <a
              href="https://buymeacoffee.com/mgrushevsky"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              <span className="text-lg">☕</span>
              <span>Buy Me a Coffee</span>
            </a>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1.5">
              This helps us keep the site free for you
            </p>
          </div>
        </div>

        <div ref={setScrollContainerRef} className="flex-1 overflow-y-auto p-6 pt-4">
          <div className="space-y-2">
            {favoriteTools.length > 0 ? (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => toggleCategory('Favorites')}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left mb-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Favorites</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {favoriteTools.length}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${expandedCategories['Favorites'] !== false ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {expandedCategories['Favorites'] !== false && (
                  <div className="ml-4 mt-1 space-y-1">
                    {favoriteTools.map((tool) => {
                      const isActive = pathname === tool.path
                      return (
                        <Link
                          key={tool.path}
                          href={tool.path}
                          onMouseDown={handleLinkMouseDown}
                          onClick={handleLinkClick}
                          className={`flex items-center justify-between gap-2 px-4 py-2 rounded-lg transition-all group ${
                            isActive
                              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-lg flex-shrink-0">{tool.icon}</span>
                            <span className="font-medium text-sm truncate">{tool.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 opacity-70 truncate">
                              {tool.category}
                            </span>
                          </div>
                          <button
                            onClick={(e) => toggleFavorite(tool.path, e)}
                            className={`flex-shrink-0 p-1 rounded hover:bg-opacity-20 transition-colors ${
                              isActive
                                ? 'text-yellow-300 hover:bg-white'
                                : 'text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300'
                            }`}
                            title="Remove from favorites"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 px-4 py-2">
                  <span className="text-lg">⭐</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Favorites</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 px-4 mt-2">
                  Hover over any tool and click the star icon to add it to favorites
                </p>
              </div>
            )}

            {categories.map((category) => {
              const isExpanded = expandedCategories[category.name] ?? true
              return (
                <div key={category.name} className="mb-2">
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{category.name}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
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
                        const isFavorite = favorites.includes(tool.path)
                        return (
                          <Link
                            key={tool.path}
                            href={tool.path}
                          onMouseDown={handleLinkMouseDown}
                          onClick={handleLinkClick}
                          className={`flex items-center justify-between gap-2 px-4 py-2 rounded-lg transition-all group ${
                            isActive
                              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-lg flex-shrink-0">{tool.icon}</span>
                            <span className="font-medium text-sm truncate">{tool.name}</span>
                          </div>
                            <button
                              onClick={(e) => toggleFavorite(tool.path, e)}
                              className={`flex-shrink-0 p-1 rounded hover:bg-opacity-20 transition-all ${
                                isFavorite
                                  ? 'opacity-100'
                                  : 'opacity-0 group-hover:opacity-100'
                              } ${
                                isActive
                                  ? isFavorite
                                    ? 'text-yellow-300 hover:bg-white hover:scale-110'
                                    : 'text-white hover:bg-white hover:scale-110'
                                  : isFavorite
                                    ? 'text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300 hover:scale-110'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400 hover:scale-110'
                              }`}
                              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                              <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke={isFavorite ? "none" : "currentColor"} viewBox="0 0 20 20">
                                {isFavorite ? (
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                )}
                              </svg>
                            </button>
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

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
