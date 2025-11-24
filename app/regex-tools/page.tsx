'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'

type Tab = 'tester' | 'builder'

export default function RegexToolsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('tester')

  // Check URL hash for tab switching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash === '#builder') {
        setActiveTab('builder')
      } else if (hash === '#tester') {
        setActiveTab('tester')
      }
    }
  }, [])

  // Update URL hash when tab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = activeTab === 'tester' ? '' : '#builder'
      if (window.location.hash !== hash) {
        window.history.replaceState(null, '', hash || window.location.pathname)
      }
    }
  }, [activeTab])

  // ========== REGEX TESTER STATE ==========
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [flags, setFlags] = useState({
    global: false,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false,
  })
  const [matches, setMatches] = useState<RegExpMatchArray[]>([])
  const [error, setError] = useState<string | null>(null)
  const [totalTested, setTotalTested] = useState(0)

  // ========== REGEX BUILDER STATE ==========
  const [builderPattern, setBuilderPattern] = useState('')
  const [builderTestString, setBuilderTestString] = useState('')
  const [builderMatches, setBuilderMatches] = useState<RegExpMatchArray[]>([])
  const [builderError, setBuilderError] = useState<string | null>(null)

  // Test regex pattern
  const testPattern = useCallback(() => {
    if (!pattern.trim()) {
      setMatches([])
      setError(null)
      return
    }

    try {
      let flagsString = ''
      if (flags.global) flagsString += 'g'
      if (flags.ignoreCase) flagsString += 'i'
      if (flags.multiline) flagsString += 'm'
      if (flags.dotAll) flagsString += 's'
      if (flags.unicode) flagsString += 'u'
      if (flags.sticky) flagsString += 'y'

      const regex = new RegExp(pattern, flagsString)
      const testMatches: RegExpMatchArray[] = []
      
      if (flags.global) {
        let match
        while ((match = regex.exec(testString)) !== null) {
          testMatches.push([...match] as RegExpMatchArray)
          if (!flags.global) break
        }
      } else {
        const match = testString.match(regex)
        if (match) {
          testMatches.push([...match] as RegExpMatchArray)
        }
      }

      setMatches(testMatches)
      setError(null)
      setTotalTested(prev => prev + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid regex pattern')
      setMatches([])
    }
  }, [pattern, testString, flags])

  // Test builder pattern
  const testBuilderPattern = useCallback(() => {
    if (!builderPattern.trim()) {
      setBuilderMatches([])
      setBuilderError(null)
      return
    }

    try {
      const regex = new RegExp(builderPattern, 'g')
      const testMatches: RegExpMatchArray[] = []
      
      let match
      while ((match = regex.exec(builderTestString)) !== null) {
        testMatches.push([...match] as RegExpMatchArray)
      }

      setBuilderMatches(testMatches)
      setBuilderError(null)
    } catch (e) {
      setBuilderError(e instanceof Error ? e.message : 'Invalid regex pattern')
      setBuilderMatches([])
    }
  }, [builderPattern, builderTestString])

  // Auto-test when pattern or test string changes
  useEffect(() => {
    if (activeTab === 'tester') {
      const timeoutId = setTimeout(() => {
        testPattern()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [pattern, testString, flags, activeTab, testPattern])

  // Auto-test builder
  useEffect(() => {
    if (activeTab === 'builder') {
      const timeoutId = setTimeout(() => {
        testBuilderPattern()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [builderPattern, builderTestString, activeTab, testBuilderPattern])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Silent fail
    }
  }

  // SEO data
  const toolPath = '/regex-tools'
  const toolName = 'Regex Tools'
  const category = 'code'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is a regular expression?",
      answer: "A regular expression (regex) is a sequence of characters that defines a search pattern. It's used for pattern matching in strings, text processing, and validation. Regex is supported in most programming languages and text editors."
    },
    {
      question: "How do I test a regular expression?",
      answer: "Enter your regex pattern in the pattern field, add a test string to match against, select flags (global, case-insensitive, etc.), and the tool will show all matches in real-time. Matches are highlighted and grouped for easy inspection."
    },
    {
      question: "What are regex flags?",
      answer: "Flags modify how the regex pattern is matched: 'g' (global) finds all matches, 'i' (ignoreCase) makes matching case-insensitive, 'm' (multiline) makes ^ and $ match line boundaries, 's' (dotAll) makes . match newlines, 'u' (unicode) enables full Unicode support, and 'y' (sticky) matches only from the last index."
    },
    {
      question: "Can I build regex patterns visually?",
      answer: "Yes! Use the Builder tab to construct regex patterns step by step. You can test your pattern in real-time as you build it, making it easier to learn and debug regular expressions."
    },
    {
      question: "What if my regex pattern is invalid?",
      answer: "The tool will display an error message explaining what's wrong with your pattern. Common issues include unclosed brackets, invalid escape sequences, or incorrect quantifier usage. Fix the error and try again."
    },
    {
      question: "Are my patterns stored or saved?",
      answer: "No, all processing happens entirely in your browser. We never see, store, or transmit any of your regex patterns or test strings. Your privacy and data security are completely protected."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Choose Tool",
      text: "Select between Tester (test existing regex patterns) or Builder (construct patterns step by step) using the tabs."
    },
    {
      name: "Enter Pattern",
      text: "For Tester: Enter your regex pattern. For Builder: Build your pattern using the visual interface or type directly."
    },
    {
      name: "Add Test String",
      text: "Enter text to test your pattern against. The tool will highlight all matches in real-time."
    },
    {
      name: "Configure Flags",
      text: "Select regex flags (global, case-insensitive, multiline, etc.) to modify matching behavior."
    },
    {
      name: "Review Results",
      text: "View all matches, captured groups, and match positions. Copy results or export for use in your code."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Use Regex Tools",
      "Learn how to test and build regular expressions using our free online regex tools. Test patterns, build regex visually, and debug expressions.",
      howToSteps,
      "PT5M"
    ),
    generateSoftwareApplicationSchema(
      "Regex Tools",
      "Free online regex tester and builder. Test regular expressions with real-time matching, flag options, and visual pattern builder.",
      "https://prylad.pro/regex-tools",
      "DeveloperApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🔎 Regex Tools - Tester & Builder"
        description="Test and build regular expressions online for free. Real-time matching, flag options, group capture, visual builder, and syntax highlighting. Perfect for developers and programmers."
        breadcrumbs={breadcrumbs}
      >
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 mb-6 border border-gray-100 dark:border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('tester')}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'tester'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Regex Tester
              </button>
              <button
                onClick={() => setActiveTab('builder')}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'builder'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Regex Builder
              </button>
            </div>
          </div>

          {/* Tester Tab */}
          {activeTab === 'tester' && (
            <div className="space-y-6">
              {/* Pattern Input */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Regex Pattern
                    </label>
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="Enter regex pattern (e.g., /[a-z]+/g)"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  {/* Flags */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Flags
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(flags).map(([key, value]) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setFlags(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {key === 'global' ? 'g' : key === 'ignoreCase' ? 'i' : key === 'multiline' ? 'm' : key === 'dotAll' ? 's' : key === 'unicode' ? 'u' : 'y'} - {key}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Test String */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Test String
                    </label>
                    <textarea
                      value={testString}
                      onChange={(e) => setTestString(e.target.value)}
                      placeholder="Enter text to test against..."
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4">Results</h2>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
                  </div>
                )}

                {!error && pattern && (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Matches found: <span className="font-semibold text-primary-600">{matches.length}</span>
                      </p>
                    </div>

                    {matches.length > 0 ? (
                      <div className="space-y-3">
                        {matches.map((match, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Match {index + 1}
                              </span>
                              <button
                                onClick={() => copyToClipboard(match[0])}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                              >
                                Copy
                              </button>
                            </div>
                            <code className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                              {match[0]}
                            </code>
                            {match.length > 1 && (
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Groups:</p>
                                {match.slice(1).map((group, groupIndex) => (
                                  <div key={groupIndex} className="text-xs font-mono text-gray-700 dark:text-gray-300 mb-1">
                                    Group {groupIndex}: {group || '(empty)'}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No matches found</p>
                    )}
                  </>
                )}

                {!pattern && !error && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Enter a pattern and test string to see results</p>
                )}
              </div>

              {/* Stats */}
              {totalTested > 0 && (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Patterns tested: <span className="font-semibold text-primary-600">{totalTested}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Builder Tab */}
          {activeTab === 'builder' && (
            <div className="space-y-6">
              {/* Builder Input */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Build Your Pattern
                    </label>
                    <textarea
                      value={builderPattern}
                      onChange={(e) => setBuilderPattern(e.target.value)}
                      placeholder="Start building your regex pattern here..."
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Tip: Use common regex patterns like [a-z] for letters, \d for digits, \w for word characters
                    </p>
                  </div>

                  {/* Test String */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Test String
                    </label>
                    <textarea
                      value={builderTestString}
                      onChange={(e) => setBuilderTestString(e.target.value)}
                      placeholder="Enter text to test your pattern..."
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Builder Results */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4">Test Results</h2>

                {builderError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{builderError}</p>
                  </div>
                )}

                {!builderError && builderPattern && (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Matches found: <span className="font-semibold text-primary-600">{builderMatches.length}</span>
                      </p>
                    </div>

                    {builderMatches.length > 0 ? (
                      <div className="space-y-3">
                        {builderMatches.map((match, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Match {index + 1}
                              </span>
                              <button
                                onClick={() => copyToClipboard(match[0])}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                              >
                                Copy
                              </button>
                            </div>
                            <code className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                              {match[0]}
                            </code>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No matches found</p>
                    )}
                  </>
                )}

                {!builderPattern && !builderError && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Start building your pattern to see results</p>
                )}
              </div>
            </div>
          )}

          {/* Related Tools */}
          {relatedTools.length > 0 && (
            <RelatedTools tools={relatedTools} title="Related Tools" />
          )}
        </div>
      </Layout>
    </>
  )
}

