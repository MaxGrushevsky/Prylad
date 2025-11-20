'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import SEOContent from '@/components/SEOContent'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type IndentSize = 2 | 4 | 'tab'
type Action = 'format' | 'minify' | 'validate'

export default function JSONFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indentSize, setIndentSize] = useState<IndentSize>(2)
  const [sortKeys, setSortKeys] = useState(false)
  const [autoFormat, setAutoFormat] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [totalOperations, setTotalOperations] = useState(0)

  // SEO data
  const toolPath = '/json-formatter'
  const toolName = 'JSON Formatter'
  const category = 'code'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "Is the JSON formatter free to use?",
      answer: "Yes, absolutely! Our JSON formatter is completely free to use. There are no hidden fees, subscriptions, or usage limits. You can format, minify, and validate as much JSON as you need."
    },
    {
      question: "Do you store or have access to my JSON data?",
      answer: "No, absolutely not. All JSON processing happens entirely in your browser. We never see, store, transmit, or have any access to your JSON data. Your privacy is completely protected."
    },
    {
      question: "What is JSON formatting?",
      answer: "JSON formatting (also called JSON beautification or JSON prettification) is the process of adding indentation, line breaks, and proper spacing to JSON data to make it more readable and easier to understand."
    },
    {
      question: "What is JSON minification?",
      answer: "JSON minification is the process of removing all unnecessary whitespace, line breaks, and indentation from JSON data to reduce its file size. This is useful for production environments where smaller file sizes improve performance."
    },
    {
      question: "Can I validate JSON syntax?",
      answer: "Yes! Our tool automatically validates JSON syntax as you type. It will highlight any errors and provide detailed error messages to help you fix issues in your JSON data."
    },
    {
      question: "What file format can I export to?",
      answer: "You can export formatted or minified JSON to a .json text file. The exported file maintains the exact formatting you see in the output area."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Paste or Type JSON",
      text: "Enter your JSON data into the input area. You can paste JSON from any source or type it directly."
    },
    {
      name: "Choose Action",
      text: "Select what you want to do: Format (beautify), Minify (compress), or Validate (check syntax)."
    },
    {
      name: "Customize Settings",
      text: "Adjust indentation size (2 spaces, 4 spaces, or tabs) and optionally enable key sorting for formatted output."
    },
    {
      name: "View Results",
      text: "See the formatted, minified, or validation results in the output area. Any errors will be highlighted."
    },
    {
      name: "Copy or Export",
      text: "Copy the result to your clipboard or export it to a JSON file for use in your projects."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Format and Validate JSON",
      "Learn how to format, minify, and validate JSON data using our free online JSON formatter tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "JSON Formatter",
      "Free online JSON formatter, validator, and minifier. Format, validate, and minify JSON data with customizable settings.",
      "https://prylad.pro/json-formatter",
      "UtilityApplication"
    )
  ]

  const formatJSON = useCallback((jsonString: string, indent: IndentSize, sort: boolean): string => {
    try {
      const parsed = JSON.parse(jsonString)
      const indentValue = indent === 'tab' ? '\t' : indent
      const replacer = sort ? Object.keys(parsed).sort() : undefined
      return JSON.stringify(parsed, replacer, indentValue)
    } catch (e) {
      throw e
    }
  }, [])

  const minifyJSON = useCallback((jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString)
      return JSON.stringify(parsed)
    } catch (e) {
      throw e
    }
  }, [])

  const validateJSON = useCallback((jsonString: string): { valid: boolean; error?: string } => {
    try {
      JSON.parse(jsonString)
      return { valid: true }
    } catch (e) {
      return { valid: false, error: (e as Error).message }
    }
  }, [])

  const format = useCallback(() => {
    setError('')
    setIsValid(null)
    if (!input.trim()) {
      setError('Please enter JSON to format')
      return
    }
    try {
      const formatted = formatJSON(input, indentSize, sortKeys)
      setOutput(formatted)
      setIsValid(true)
      setTotalOperations(prev => prev + 1)
    } catch (e) {
      const errorMsg = (e as Error).message
      setError(`Invalid JSON: ${errorMsg}`)
      setOutput('')
      setIsValid(false)
    }
  }, [input, indentSize, sortKeys, formatJSON])

  const minify = useCallback(() => {
    setError('')
    setIsValid(null)
    if (!input.trim()) {
      setError('Please enter JSON to minify')
      return
    }
    try {
      const minified = minifyJSON(input)
      setOutput(minified)
      setIsValid(true)
      setTotalOperations(prev => prev + 1)
    } catch (e) {
      const errorMsg = (e as Error).message
      setError(`Invalid JSON: ${errorMsg}`)
      setOutput('')
      setIsValid(false)
    }
  }, [input, minifyJSON])

  const validate = useCallback(() => {
    setError('')
    if (!input.trim()) {
      setError('Please enter JSON to validate')
      setIsValid(null)
      return
    }
    const result = validateJSON(input)
    if (result.valid) {
      setIsValid(true)
      setError('')
    } else {
      setIsValid(false)
      setError(`Invalid JSON: ${result.error}`)
    }
    setTotalOperations(prev => prev + 1)
  }, [input, validateJSON])

  // Auto-format on input change
  useEffect(() => {
    if (autoFormat && input.trim()) {
      const timer = setTimeout(() => {
        format()
      }, 500)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, autoFormat, indentSize, sortKeys])

  // Auto-validate on input change
  useEffect(() => {
    if (input.trim()) {
      const result = validateJSON(input)
      setIsValid(result.valid)
      if (!result.valid && input.length > 0) {
        setError(`Invalid JSON: ${result.error}`)
      } else {
        setError('')
      }
    } else {
      setIsValid(null)
      setError('')
    }
  }, [input, validateJSON])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Failed to copy
    }
  }

  const exportToFile = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `formatted-json-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
    setIsValid(null)
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onEnter: () => format(),
    onSave: () => exportToFile(),
    onClear: () => clearAll()
  })

  const getStats = () => {
    if (!output) return null
    try {
      const parsed = JSON.parse(output)
      const countKeys = (obj: any): number => {
        if (typeof obj !== 'object' || obj === null) return 0
        let count = Object.keys(obj).length
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            count += countKeys(obj[key])
          }
        }
        return count
      }
      return {
        size: new Blob([output]).size,
        keys: countKeys(parsed),
        depth: getDepth(parsed)
      }
    } catch {
      return null
    }
  }

  const getDepth = (obj: any, depth = 0): number => {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj) && obj.length === 0) {
      return depth
    }
    if (Array.isArray(obj)) {
      return Math.max(...obj.map(item => getDepth(item, depth + 1)), depth)
    }
    return Math.max(...Object.values(obj).map(value => getDepth(value, depth + 1)), depth)
  }

  const stats = getStats()

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="📋 JSON Formatter & Validator"
        description="Format, minify, and validate JSON online. Free JSON formatter with syntax highlighting, auto-format, key sorting, and export options."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={format}
                className="bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors"
              >
                Format
              </button>
              <button
                onClick={minify}
                className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors"
              >
                Minify
              </button>
              <button
                onClick={validate}
                className="bg-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 transition-colors"
              >
                Validate
              </button>
              <button
                onClick={clearAll}
                className="bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Options */}
            <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-format"
                  checked={autoFormat}
                  onChange={(e) => setAutoFormat(e.target.checked)}
                  className="w-4 h-4 accent-primary-600"
                />
                <label htmlFor="auto-format" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  Auto-format on type
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sort-keys"
                  checked={sortKeys}
                  onChange={(e) => setSortKeys(e.target.checked)}
                  className="w-4 h-4 accent-primary-600"
                />
                <label htmlFor="sort-keys" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  Sort keys alphabetically
                </label>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Indent Size:</label>
                <select
                  value={indentSize}
                  onChange={(e) => setIndentSize(e.target.value as IndentSize)}
                  className="w-full px-3 py-1 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value="tab">Tab</option>
                </select>
              </div>
            </div>

            {/* Validation Status */}
            {isValid !== null && (
              <div className={`p-3 rounded-lg border ${
                isValid 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{isValid ? '✓' : '✗'}</span>
                  <span className="font-semibold">
                    {isValid ? 'Valid JSON' : 'Invalid JSON'}
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Input/Output */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Input JSON:</label>
                  {input && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {input.length} characters
                    </span>
                  )}
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-96 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder='{"key": "value", "array": [1, 2, 3]}'
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Result:</label>
                  <div className="flex gap-2">
                    {output && (
                      <>
                        <button
                          onClick={exportToFile}
                          className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors text-xs flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Export
                        </button>
                        <button
                          onClick={() => copyToClipboard(output)}
                          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                        >
                          Copy
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <textarea
                  value={output}
                  readOnly
                  className="w-full h-96 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 resize-none font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Formatted JSON will appear here..."
                />
              </div>
            </div>

            {/* Statistics */}
            {stats && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">File Size</div>
                  <div className="font-bold text-gray-900 dark:text-gray-100">{stats.size} bytes</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Keys</div>
                  <div className="font-bold text-gray-900 dark:text-gray-100">{stats.keys}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Max Depth</div>
                  <div className="font-bold text-gray-900 dark:text-gray-100">{stats.depth}</div>
                </div>
              </div>
            )}

            {/* Statistics */}
            {totalOperations > 0 && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                Total operations: <span className="font-semibold text-primary-600">{totalOperations}</span>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is JSON?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                JSON (JavaScript Object Notation) is a lightweight data-interchange format that&apos;s easy for humans 
                to read and write, and easy for machines to parse and generate. It&apos;s based on a subset of JavaScript 
                and is commonly used for transmitting data in web applications, APIs, and configuration files.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                JSON is language-independent but uses conventions familiar to programmers of C-family languages. 
                It&apos;s built on two structures: a collection of name/value pairs (objects) and an ordered list of values (arrays). 
                Properly formatted JSON is essential for readability, debugging, and maintaining code quality.
              </p>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🌐 API Development</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Format and validate JSON responses from APIs. Ensure proper structure and readability for 
                  debugging and documentation purposes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">💻 Code Development</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Format JSON configuration files, package.json, tsconfig.json, and other JSON-based configs. 
                  Maintain consistent formatting across projects.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔍 Debugging</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Validate JSON syntax to find errors quickly. Format minified JSON to understand structure 
                  and identify issues in data.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📊 Data Processing</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Format JSON data for analysis, transformation, or storage. Minify JSON to reduce file size 
                  for production environments.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Format & Minify</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Format JSON with customizable indentation (2 spaces, 4 spaces, or tabs) or minify to 
                    reduce file size for production.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Real-time Validation</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Validate JSON syntax in real-time as you type. Get instant feedback on errors with 
                    detailed error messages.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Auto-Format</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Enable auto-formatting to automatically format JSON as you type. Perfect for maintaining 
                    consistent formatting.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔤</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Key Sorting</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Optionally sort object keys alphabetically for consistent output. Useful for comparing 
                    JSON files or maintaining order.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Statistics</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    View file size, total number of keys, and maximum nesting depth. Understand your JSON 
                    structure at a glance.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Privacy First</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    All JSON processing happens locally in your browser. We never see, store, or have access 
                    to your JSON data.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the difference between formatting and minifying?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Formatting adds indentation and line breaks to make JSON readable. Minifying removes all 
                  unnecessary whitespace to reduce file size. Use formatting for development and minifying 
                  for production.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Why is my JSON invalid?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Common JSON errors include: missing quotes around keys, trailing commas, single quotes 
                  instead of double quotes, or unescaped special characters. Our validator will show the 
                  specific error message.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I format very large JSON files?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our tool works best with JSON files under 10MB. For very large files, consider processing 
                  them in chunks or using command-line tools. Browser memory limits may affect performance 
                  with extremely large files.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Do you store my JSON data?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, absolutely not. All JSON processing happens entirely in your browser. We never see, 
                  store, transmit, or have any access to your JSON data. Your privacy is completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Code Tools" />
      )}
    </Layout>
    </>
  )
}

