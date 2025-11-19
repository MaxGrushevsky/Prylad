'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'

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
          highlightedParts.push('<mark class="bg-yellow-300 text-gray-900 px-1 rounded">' + result.match + '</mark>')
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

  return (
    <Layout
      title="🔎 Regex Tester - Test Regular Expressions Online"
      description="Test and debug regular expressions online for free. Real-time matching, flag options, group capture, and syntax highlighting. Perfect for developers and programmers."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Regex Pattern</h2>
              {totalTests > 0 && (
                <div className="text-sm text-gray-500">
                  Tests: <span className="font-semibold text-gray-900">{totalTests}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Regular Expression</label>
                {pattern && (
                  <button
                    onClick={copyPattern}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Copy
                  </button>
                )}
              </div>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                placeholder="/pattern/flags"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Flags:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['g', 'i', 'm', 's', 'u', 'y'] as RegexFlag[]).map((flag) => (
                  <button
                    key={flag}
                    onClick={() => toggleFlag(flag)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      flags.has(flag)
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={getFlagDescription(flag)}
                  >
                    {flag}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Active: {Array.from(flags).sort().join('') || 'none'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Quick Examples:</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {regexExamples.map((example) => (
                  <button
                    key={example.name}
                    onClick={() => loadExample(example)}
                    className="px-3 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-xs transition-colors"
                    title={example.description}
                  >
                    <div className="font-semibold text-gray-900">{example.name}</div>
                    <div className="text-gray-500 font-mono text-xs truncate">{example.pattern}</div>
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
              <span className="text-sm text-gray-700">Auto-test as you type</span>
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

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold">Test Text & Results</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Test Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-48 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                placeholder="Enter text to test against..."
                spellCheck={false}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-semibold mb-1">Error:</p>
                <p className="text-sm text-red-600 font-mono">{error}</p>
              </div>
            )}

            {matches.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Matches found: <span className="text-primary-600">{matches.length}</span>
                  </h3>
                  <button
                    onClick={exportResults}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Export
                  </button>
                </div>

                <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                  <div 
                    className="font-mono text-sm whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ __html: highlightedText || text }}
                  />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {matches.map((match, i) => (
                    <div key={i} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-semibold text-blue-900">Match {i + 1}</span>
                        <span className="text-xs text-blue-600">Index: {match.index}</span>
                      </div>
                      <div className="font-mono text-sm text-blue-900 mb-1">
                        &quot;{match.match}&quot;
                      </div>
                      {match.groups.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-blue-700 mb-1">Groups:</p>
                          <div className="flex flex-wrap gap-1">
                            {match.groups.map((group, gi) => (
                              <span key={gi} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
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
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <p className="text-sm text-yellow-700">No matches found</p>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is a Regular Expression?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                A regular expression (regex) is a sequence of characters that defines a search pattern. It&apos;s used 
                for pattern matching within strings, text processing, and data validation. Regular expressions are 
                powerful tools for developers, allowing complex text searches and replacements with concise syntax.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free regex tester lets you test and debug regular expressions in real-time. Enter your pattern, 
                choose flags (global, case-insensitive, multiline, etc.), and see matches highlighted in your test text. 
                Perfect for learning regex, debugging patterns, and validating expressions before using them in your code.
              </p>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What regex syntax is supported?</h3>
                <p className="text-gray-700 text-sm">
                  Our tester supports JavaScript/ECMAScript regex syntax, which is compatible with most modern programming 
                  languages. This includes character classes, quantifiers, anchors, groups, lookaheads, and more.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I use capturing groups?</h3>
                <p className="text-gray-700 text-sm">
                  Use parentheses () to create capturing groups. Matched groups are displayed in the results for each match.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my pattern or text stored?</h3>
                <p className="text-gray-700 text-sm">
                  No, all regex testing happens entirely in your browser. We never see, store, or transmit any of your 
                  patterns or test text. Your privacy is completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}
