'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type Action = 'format' | 'minify'
type IndentSize = 2 | 4 | 'tab'

export default function JSFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [action, setAction] = useState<Action>('format')
  const [indentSize, setIndentSize] = useState<IndentSize>(2)
  const [autoProcess, setAutoProcess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalProcessed, setTotalProcessed] = useState(0)

  // SEO data
  const toolPath = '/js-formatter'
  const toolName = 'JavaScript Formatter'
  const category = 'code'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is JavaScript formatting?",
      answer: "JavaScript formatting (also called JS beautification) is the process of adding proper indentation, line breaks, and spacing to JavaScript code to make it more readable and easier to maintain. It helps developers understand and debug code more effectively."
    },
    {
      question: "What is JavaScript minification?",
      answer: "JavaScript minification is the process of removing all unnecessary whitespace, comments, and line breaks from JavaScript code to reduce file size. Minified JS improves page load times and reduces bandwidth usage, making it essential for production websites."
    },
    {
      question: "Does formatting affect JavaScript functionality?",
      answer: "No, formatting only changes the appearance of JavaScript code, not its functionality. Formatted and minified JavaScript produce identical results when executed. The only difference is file size and readability."
    },
    {
      question: "Can I format JavaScript with custom indentation?",
      answer: "Yes! Our tool allows you to choose between 2 spaces, 4 spaces, or tabs for indentation. This lets you match your project's coding style and preferences."
    },
    {
      question: "Is the JavaScript formatter free to use?",
      answer: "Yes, absolutely! Our JavaScript formatter is completely free to use. There are no hidden fees, subscriptions, or usage limits. You can format and minify as much JavaScript as you need."
    },
    {
      question: "Do you store my JavaScript code?",
      answer: "No, absolutely not. All JavaScript processing happens entirely in your browser. We never see, store, transmit, or have any access to your JavaScript code. Your privacy is completely protected."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Paste Your JavaScript",
      text: "Enter your JavaScript code into the input area. You can paste JS from any source or type it directly."
    },
    {
      name: "Choose Action",
      text: "Select Format to beautify your JavaScript with proper indentation, or Minify to compress it for production."
    },
    {
      name: "Customize Indentation (Format Mode)",
      text: "If formatting, choose your preferred indentation: 2 spaces, 4 spaces, or tabs."
    },
    {
      name: "Enable Auto-Process (Optional)",
      text: "Turn on auto-process to automatically format or minify JavaScript as you type for real-time processing."
    },
    {
      name: "Copy or Export",
      text: "Copy the formatted or minified JavaScript to your clipboard or export it to a file for use in your projects."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Format and Minify JavaScript",
      "Learn how to format and minify JavaScript code using our free online JavaScript formatter and minifier tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "JavaScript Formatter",
      "Free online JavaScript formatter and minifier. Format JavaScript with proper indentation or minify it for production with customizable settings.",
      "https://prylad.pro/js-formatter",
      "UtilityApplication"
    )
  ]

  const getIndent = useCallback((): string => {
    switch (indentSize) {
      case 2:
        return '  '
      case 4:
        return '    '
      case 'tab':
        return '\t'
      default:
        return '  '
    }
  }, [indentSize])

  const minifyJS = useCallback((code: string): string => {
    let result = code
      // Remove single-line comments (but preserve URLs)
      .replace(/\/\/(?![\/\s])(?![^\s]*https?:\/\/).*$/gm, '')
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove whitespace around operators
      .replace(/\s*([=+\-*\/%<>!&|?:,;{}()\[\]])\s*/g, '$1')
      // Remove multiple spaces
      .replace(/\s+/g, ' ')
      // Remove spaces around semicolons
      .replace(/\s*;\s*/g, ';')
      // Remove leading/trailing whitespace
      .trim()

    // Preserve string literals
    const strings: string[] = []
    result = result.replace(/(['"`])(?:(?=(\\?))\2.)*?\1/g, (match) => {
      strings.push(match)
      return `__STRING_${strings.length - 1}__`
    })

    // Remove whitespace
    result = result.replace(/\s+/g, ' ')

    // Restore strings
    strings.forEach((str, i) => {
      result = result.replace(`__STRING_${i}__`, str)
    })

    return result
  }, [])

  const formatJS = useCallback((code: string): string => {
    const indent = getIndent()
    let result = code
    let indentLevel = 0

    // Normalize line breaks
    result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

    // Add newlines after semicolons (but not in for loops)
    result = result.replace(/;(?![^()]*\))/g, ';\n')

    // Add newlines after opening braces
    result = result.replace(/{/g, '{\n')

    // Add newlines before closing braces
    result = result.replace(/}/g, '\n}')

    // Split into lines and process
    const lines = result.split('\n')
    const formatted: string[] = []

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim()

      if (!line) {
        if (formatted.length > 0 && formatted[formatted.length - 1] !== '') {
          formatted.push('')
        }
        continue
      }

      // Decrease indent before closing braces
      if (line.startsWith('}')) {
        indentLevel = Math.max(0, indentLevel - 1)
      }

      // Add indentation
      formatted.push(indent.repeat(indentLevel) + line)

      // Increase indent after opening braces
      if (line.endsWith('{')) {
        indentLevel++
      }
    }

    return formatted.join('\n')
  }, [getIndent])

  const process = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      return
    }

    try {
      let result = ''
      if (action === 'minify') {
        result = minifyJS(input)
      } else {
        result = formatJS(input)
      }
      setOutput(result)
      setError(null)
      setTotalProcessed(prev => prev + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error processing JavaScript. Please check your syntax.')
      setOutput('')
    }
  }, [input, action, minifyJS, formatJS])

  useEffect(() => {
    if (autoProcess && input) {
      const timeoutId = setTimeout(() => {
        process()
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [autoProcess, input, action, indentSize, process])

  const copyToClipboard = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
    } catch (err) {
      // Failed to copy
    }
  }

  const exportToFile = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `${action === 'minify' ? 'minified' : 'formatted'}.js`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  useKeyboardShortcuts({
    onEnter: () => process(),
    onSave: () => exportToFile(),
    onClear: () => clearAll()
  })

  const getStats = () => {
    if (!input) return null
    const inputSize = new Blob([input]).size
    const outputSize = output ? new Blob([output]).size : 0
    const reduction = outputSize > 0 ? ((inputSize - outputSize) / inputSize * 100).toFixed(1) : 0
    const inputLines = input.split('\n').length
    const outputLines = output ? output.split('\n').length : 0

    return {
      inputSize,
      outputSize,
      reduction: parseFloat(reduction.toString()),
      inputLines,
      outputLines,
    }
  }

  const stats = getStats()

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="💻 JavaScript Formatter & Minifier - Format and Minify JS Online"
        description="Format and minify JavaScript code online for free. Beautify JS with proper indentation or compress it for production. Auto-format, customize indentation, and export to file."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">JavaScript Code</h2>
              {totalProcessed > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Processed: <span className="font-semibold text-gray-900 dark:text-gray-100">{totalProcessed}</span>
                </div>
              )}
            </div>

            {/* Action Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Action:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAction('format')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    action === 'format'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Format
                </button>
                <button
                  onClick={() => setAction('minify')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    action === 'minify'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Minify
                </button>
              </div>
            </div>

            {/* Indent Size (only for format) */}
            {action === 'format' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Indent Size:</label>
                <select
                  value={indentSize}
                  onChange={(e) => setIndentSize(e.target.value as IndentSize)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value="tab">Tab</option>
                </select>
              </div>
            )}

            {/* Input Textarea */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  JavaScript Code
                </label>
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-96 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Enter JavaScript code..."
                spellCheck={false}
              />
              {input && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {input.length} characters, {input.split('\n').length} lines
                </div>
              )}
            </div>

            {/* Auto Process */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoProcess}
                onChange={(e) => setAutoProcess(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-process as you type</span>
            </label>

            {!autoProcess && (
              <button
                onClick={process}
                disabled={!input.trim()}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50"
              >
                {action === 'format' ? 'Format' : 'Minify'} JavaScript
              </button>
            )}
          </div>

          {/* Output */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {action === 'format' ? 'Formatted' : 'Minified'} JavaScript
            </h2>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Statistics */}
            {stats && output && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Original Size</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats.inputSize.toLocaleString()} bytes
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {action === 'minify' ? 'Minified' : 'Formatted'} Size
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats.outputSize.toLocaleString()} bytes
                  </p>
                </div>
                {action === 'minify' && stats.reduction > 0 && (
                  <>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Reduction</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {stats.reduction}%
                      </p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Lines</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {stats.inputLines} → {stats.outputLines}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Output Textarea */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Result</label>
                {output && (
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Copy
                    </button>
                    <button
                      onClick={exportToFile}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Export
                    </button>
                  </div>
                )}
              </div>
              <textarea
                value={output}
                readOnly
                className="w-full h-96 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 resize-none font-mono text-sm text-gray-900 dark:text-gray-100"
                placeholder="Result will appear here..."
                spellCheck={false}
              />
              {output && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {output.length} characters, {output.split('\n').length} lines
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is JavaScript Formatting?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                JavaScript formatting is the process of organizing and structuring JavaScript code with proper indentation, 
                spacing, and line breaks to improve readability and maintainability. Well-formatted JavaScript is easier 
                to read, debug, and modify.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                JavaScript minification removes all unnecessary whitespace, comments, and formatting to reduce file size 
                for production use. This improves website load times and performance significantly.
              </p>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use Our JavaScript Formatter</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li><strong>Choose Action:</strong> Select Format to beautify your JavaScript with proper indentation, or Minify to compress it for production.</li>
                <li><strong>Set Indentation:</strong> If formatting, choose your preferred indent size (2 spaces, 4 spaces, or tabs).</li>
                <li><strong>Paste Your Code:</strong> Enter or paste your JavaScript code into the input field.</li>
                <li><strong>Process:</strong> Click the process button or enable auto-process to see results in real-time.</li>
                <li><strong>Review Statistics:</strong> See file size reduction, percentage saved, and line count changes.</li>
                <li><strong>Copy or Export:</strong> Copy the result to clipboard or export as a JS file for use in your projects.</li>
              </ol>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Benefits of JavaScript Formatting & Minification</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">⚡ Faster Load Times</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Minified JavaScript can reduce file size by 30-70%, significantly improving page load times and user experience.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📦 Reduced Bandwidth</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Smaller JS files use less bandwidth, saving costs for both you and your users, especially important for mobile users.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">✨ Better Readability</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Formatted JavaScript with proper indentation makes it easier to read, debug, and maintain, especially in team environments.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔒 Better Performance</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Smaller files parse and execute faster, improving overall website performance and potentially improving SEO rankings.
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

