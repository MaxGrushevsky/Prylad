'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type RegexFlag = 'g' | 'i' | 'm' | 's' | 'u' | 'y'

interface MatchResult {
  match: string
  index: number
  groups: string[]
  fullMatch: string
}

const regexExamples = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', description: 'Match email addresses' },
  { name: 'URL', pattern: 'https?://[^\\s]+', description: 'Match HTTP/HTTPS URLs' },
  { name: 'Phone (US)', pattern: '\\+?1?[-.]?\\s?\\(?([0-9]{3})\\)?[-.]?\\s?([0-9]{3})[-.]?\\s?([0-9]{4})', description: 'Match US phone numbers' },
  { name: 'IP Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', description: 'Match IPv4 addresses' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', description: 'Match dates in YYYY-MM-DD format' },
  { name: 'Hex Color', pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b', description: 'Match hex color codes' },
  { name: 'Credit Card', pattern: '\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b', description: 'Match credit card numbers' },
  { name: 'Strong Password', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', description: 'Match strong passwords' },
]

const getFlagDescription = (flag: RegexFlag): string => {
  const descriptions: Record<RegexFlag, string> = {
    g: 'Global - find all matches',
    i: 'Case-insensitive',
    m: 'Multiline - ^ and $ match line breaks',
    s: 'Dotall - . matches newlines',
    u: 'Unicode - treat pattern as Unicode',
    y: 'Sticky - match only at lastIndex'
  }
  return descriptions[flag]
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('')
  const [text, setText] = useState('Hello world! Email: test@example.com and another: user@domain.org')
  const [flags, setFlags] = useState<Set<RegexFlag>>(new Set<RegexFlag>(['g']))
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [autoTest, setAutoTest] = useState(true)
  const [highlightedText, setHighlightedText] = useState<string>('')
  const [totalTests, setTotalTests] = useState(0)

  const toggleFlag = (flag: RegexFlag) => {
    setFlags(prev => {
      const newFlags = new Set(prev)
      if (newFlags.has(flag)) {
        newFlags.delete(flag)
      } else {
        newFlags.add(flag)
      }
      return newFlags
    })
  }

  const testRegex = useCallback(() => {
    if (!pattern.trim()) {
      setMatches([])
      setError(null)
      setHighlightedText(text)
      return
    }

    try {
      setError(null)
      const flagsString = Array.from(flags).sort().join('')
      const regex = new RegExp(pattern, flagsString)
      
      const results: MatchResult[] = []
      let highlighted = text

      if (flags.has('g')) {
        let match
        const regexGlobal = new RegExp(pattern, flagsString)
        while ((match = regexGlobal.exec(text)) !== null) {
          if (match.index === regexGlobal.lastIndex) {
            regexGlobal.lastIndex++
          }
          
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            fullMatch: match[0]
          })
        }
      } else {
        const match = regex.exec(text)
        if (match) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            fullMatch: match[0]
          })
        }
      }

      if (results.length > 0) {
        const highlightedParts: string[] = []
        let lastIndex = 0

        results.forEach((result) => {
          if (result.index > lastIndex) {
            highlightedParts.push(text.substring(lastIndex, result.index))
          }
          highlightedParts.push('<mark class="bg-yellow-300 text-gray-900 dark:text-gray-100 px-1 rounded">' + result.match + '</mark>')
          lastIndex = result.index + result.match.length
        })
        
        if (lastIndex < text.length) {
          highlightedParts.push(text.substring(lastIndex))
        }
        highlighted = highlightedParts.join('')
      } else {
        highlighted = text
      }

      setMatches(results)
      setHighlightedText(highlighted)
      setTotalTests(prev => prev + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid regular expression')
      setMatches([])
      setHighlightedText(text)
    }
  }, [pattern, text, flags])

  useEffect(() => {
    if (autoTest) {
      const timeoutId = setTimeout(() => {
        testRegex()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [autoTest, pattern, text, flags, testRegex])

  const loadExample = (example: typeof regexExamples[0]) => {
    setPattern(example.pattern)
    setFlags(new Set<RegexFlag>(['g']))
  }

  const copyPattern = () => {
    navigator.clipboard.writeText(pattern)
  }

  const exportResults = () => {
    if (matches.length === 0) return
    
    const results = matches.map((m, i) => {
      const groupsText = m.groups.length > 0 ? '\n  Groups: ' + m.groups.join(', ') : ''
      return 'Match ' + (i + 1) + ': "' + m.match + '" at index ' + m.index + groupsText
    }).join('\n\n')
    
    const blob = new Blob([results], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'regex-results-' + Date.now() + '.txt'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  // SEO data
  const toolPath = '/regex-tester'
  const toolName = 'Regex Tester'
  const category = 'code'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "How do I test a regular expression?",
      answer: "Enter your regex pattern in the pattern input field, paste or type your test text, select flags (global, case-insensitive, multiline, etc.), and the tool automatically shows matches in real-time with highlighting."
    },
    {
      question: "What regex flags are supported?",
      answer: "The tester supports standard JavaScript regex flags: g (global - find all matches), i (case-insensitive), m (multiline), s (dotall), u (unicode), and y (sticky). You can combine multiple flags."
    },
    {
      question: "Can I see captured groups?",
      answer: "Yes! The tester displays all captured groups for each match, showing group index, match text, and position. This helps you understand how your regex pattern captures data."
    },
    {
      question: "What are regex examples?",
      answer: "The tool includes common regex examples like email validation, URL matching, phone numbers, IP addresses, dates, hex colors, and more. Click on any example to load it and see how it works."
    },
    {
      question: "How do I debug regex errors?",
      answer: "If your regex has syntax errors, the tester displays error messages explaining what's wrong. Common issues include unclosed brackets, invalid escape sequences, or incorrect quantifiers."
    },
    {
      question: "Is the regex tester free to use?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All regex testing happens in your browser - we never see or store your patterns or test data."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Enter Regex Pattern",
      text: "Type your regular expression pattern in the pattern input field. You can use common regex syntax including character classes, quantifiers, anchors, and groups."
    },
    {
      name: "Enter Test Text",
      text: "Paste or type the text you want to test against your regex pattern. The tool will highlight matches in real-time as you type."
    },
    {
      name: "Select Flags",
      text: "Choose regex flags that affect matching behavior: global (find all matches), case-insensitive, multiline, and others. Multiple flags can be combined."
    },
    {
      name: "View Results",
      text: "See all matches highlighted in the test text, view captured groups, match positions, and detailed match information. Errors are displayed if the pattern is invalid."
    },
    {
      name: "Use Examples",
      text: "Click on regex examples (email, URL, phone, etc.) to load common patterns and learn how they work. Modify them to suit your needs."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Test Regular Expressions",
      "Learn how to test and debug regular expressions using our free online regex tester tool with real-time matching and syntax highlighting.",
      howToSteps,
      "PT3M"
    ),
    generateSoftwareApplicationSchema(
      "Regex Tester",
      "Free online regex tester. Test and debug regular expressions with real-time matching, flag options, group capture, syntax highlighting, and common regex examples.",
      "https://prylad.pro/regex-tester",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🔎 Regex Tester - Test Regular Expressions"
        description="Test and debug regular expressions online for free. Real-time matching, flag options, group capture, and syntax highlighting. Perfect for developers and programmers."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Regex Pattern</h2>
              {totalTests > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Tests: <span className="font-semibold text-gray-900 dark:text-gray-100">{totalTests}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Regular Expression</label>
                {pattern && (
                  <button
                    onClick={copyPattern}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Copy
                  </button>
                )}
              </div>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="/pattern/flags"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Flags:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['g', 'i', 'm', 's', 'u', 'y'] as RegexFlag[]).map((flag) => (
                  <button
                    key={flag}
                    onClick={() => toggleFlag(flag)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      flags.has(flag)
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title={getFlagDescription(flag)}
                  >
                    {flag}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Active: {Array.from(flags).sort().join('') || 'none'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Examples:</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {regexExamples.map((example) => (
                  <button
                    key={example.name}
                    onClick={() => loadExample(example)}
                    className="px-3 py-2 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs transition-colors"
                    title={example.description}
                  >
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{example.name}</div>
                    <div className="text-gray-500 dark:text-gray-400 font-mono text-xs truncate">{example.pattern}</div>
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoTest}
                onChange={(e) => setAutoTest(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-test as you type</span>
            </label>

            {!autoTest && (
              <button
                onClick={testRegex}
                disabled={!pattern.trim()}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50"
              >
                Test Regex
              </button>
            )}
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Test Text & Results</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Test Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-48 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Enter text to test against..."
                spellCheck={false}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400 font-semibold mb-1">Error:</p>
                <p className="text-sm text-red-600 dark:text-red-400 font-mono">{error}</p>
              </div>
            )}

            {matches.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Matches found: <span className="text-primary-600">{matches.length}</span>
                  </h3>
                  <button
                    onClick={exportResults}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Export
                  </button>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                  <div 
                    className="font-mono text-sm whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ __html: highlightedText || text }}
                  />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {matches.map((match, i) => (
                    <div key={i} className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">Match {i + 1}</span>
                        <span className="text-xs text-blue-600 dark:text-blue-400">Index: {match.index}</span>
                      </div>
                      <div className="font-mono text-sm text-blue-900 dark:text-blue-300 mb-1">
                        &quot;{match.match}&quot;
                      </div>
                      {match.groups.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Groups:</p>
                          <div className="flex flex-wrap gap-1">
                            {match.groups.map((group, gi) => (
                              <span key={gi} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs font-mono">
                                {gi + 1}: &quot;{group}&quot;
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!error && matches.length === 0 && pattern && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">No matches found</p>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is a Regular Expression?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                A regular expression (regex) is a sequence of characters that defines a search pattern. It&apos;s used 
                for pattern matching within strings, text processing, and data validation. Regular expressions are 
                powerful tools for developers, allowing complex text searches and replacements with concise syntax.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our free regex tester lets you test and debug regular expressions in real-time. Enter your pattern, 
                choose flags (global, case-insensitive, multiline, etc.), and see matches highlighted in your test text. 
                Perfect for learning regex, debugging patterns, and validating expressions before using them in your code.
              </p>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What regex syntax is supported?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our tester supports JavaScript/ECMAScript regex syntax, which is compatible with most modern programming 
                  languages. This includes character classes, quantifiers, anchors, groups, lookaheads, and more.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How do I use capturing groups?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use parentheses () to create capturing groups. Matched groups are displayed in the results for each match.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Is my pattern or text stored?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, all regex testing happens entirely in your browser. We never see, store, or transmit any of your 
                  patterns or test text. Your privacy is completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Developer Tools" />
      )}
    </Layout>
    </>
  )
}
