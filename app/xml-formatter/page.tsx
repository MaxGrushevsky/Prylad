'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
type IndentSize = 2 | 4 | 'tab'
type Action = 'format' | 'minify' | 'validate'

interface ValidationResult {
  valid: boolean
  error?: string
  line?: number
  column?: number
}

export default function XMLFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indentSize, setIndentSize] = useState<IndentSize>(2)
  const [autoFormat, setAutoFormat] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [totalOperations, setTotalOperations] = useState(0)
  const getIndent = useCallback((level: number): string => {
    const indentValue = indentSize === 'tab' ? '\t' : indentSize
    return indentValue.toString().repeat(level)
  }, [indentSize])

  const formatXML = useCallback((xmlString: string, indent: IndentSize): string => {
    try {
      // Remove existing whitespace and newlines
      let formatted = xmlString.replace(/>\s+</g, '><').trim()
      
      // Add newlines and indentation
      let result = ''
      let indentLevel = 0
      let inTag = false
      let inAttribute = false
      let currentTag = ''
      
      for (let i = 0; i < formatted.length; i++) {
        const char = formatted[i]
        const nextChar = formatted[i + 1]
        
        if (char === '<') {
          if (inTag && currentTag.trim()) {
            result += '\n' + getIndent(indentLevel)
          }
          inTag = true
          currentTag = ''
          result += char
        } else if (char === '>') {
          inTag = false
          result += char
          currentTag = currentTag.trim()
          
          // Check if it's a closing tag
          if (currentTag.startsWith('/')) {
            indentLevel = Math.max(0, indentLevel - 1)
          } else if (!currentTag.endsWith('/') && !currentTag.startsWith('?')) {
            // Self-closing tags and processing instructions don't increase indent
            if (nextChar && nextChar !== '<') {
              // Content follows, don't add newline yet
            } else {
              indentLevel++
            }
          }
          currentTag = ''
        } else if (inTag) {
          currentTag += char
          result += char
        } else {
          // Content between tags
          if (char === '\n' || char === '\r') {
            continue
          }
          if (result && result[result.length - 1] === '>') {
            result += '\n' + getIndent(indentLevel)
          }
          result += char
        }
      }
      
      // Clean up multiple newlines
      result = result.replace(/\n\s*\n/g, '\n')
      
      return result
    } catch (e) {
      throw new Error('Failed to format XML')
    }
  }, [getIndent])

  const minifyXML = useCallback((xmlString: string): string => {
    try {
      // Remove all whitespace between tags
      let minified = xmlString.replace(/>\s+</g, '><')
      // Remove leading/trailing whitespace
      minified = minified.trim()
      // Remove newlines and extra spaces
      minified = minified.replace(/\s+/g, ' ')
      // Remove spaces around tags
      minified = minified.replace(/>\s+/g, '>')
      minified = minified.replace(/\s+</g, '<')
      return minified
    } catch (e) {
      throw new Error('Failed to minify XML')
    }
  }, [])

  const validateXML = useCallback((xmlString: string): ValidationResult => {
    try {
      if (!xmlString.trim()) {
        return { valid: false, error: 'XML is empty' }
      }

      // Basic XML structure validation
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror')
      if (parserError) {
        const errorText = parserError.textContent || 'Unknown parsing error'
        // Try to extract line number from error
        const lineMatch = errorText.match(/line (\d+)/i)
        const columnMatch = errorText.match(/column (\d+)/i)
        return {
          valid: false,
          error: errorText,
          line: lineMatch ? parseInt(lineMatch[1]) : undefined,
          column: columnMatch ? parseInt(columnMatch[1]) : undefined
        }
      }

      // Check for well-formed XML
      if (!xmlDoc.documentElement) {
        return { valid: false, error: 'No root element found' }
      }

      return { valid: true }
    } catch (e) {
      return {
        valid: false,
        error: (e as Error).message || 'Invalid XML structure'
      }
    }
  }, [])

  const format = useCallback(() => {
    setError('')
    setIsValid(null)
    if (!input.trim()) {
      setError('Please enter XML to format')
      return
    }
    try {
      const formatted = formatXML(input, indentSize)
      setOutput(formatted)
      setIsValid(true)
      setTotalOperations(prev => prev + 1)
    } catch (e) {
      const errorMsg = (e as Error).message
      setError(`Format error: ${errorMsg}`)
      setOutput('')
      setIsValid(false)
    }
  }, [input, indentSize, formatXML, ])

  const minify = useCallback(() => {
    setError('')
    setIsValid(null)
    if (!input.trim()) {
      setError('Please enter XML to minify')
      return
    }
    try {
      const minified = minifyXML(input)
      setOutput(minified)
      setIsValid(true)
      setTotalOperations(prev => prev + 1)
    } catch (e) {
      const errorMsg = (e as Error).message
      setError(`Minify error: ${errorMsg}`)
      setOutput('')
      setIsValid(false)
    }
  }, [input, minifyXML, ])

  const validate = useCallback(() => {
    setError('')
    if (!input.trim()) {
      setError('Please enter XML to validate')
      setIsValid(null)
      return
    }
    const result = validateXML(input)
    if (result.valid) {
      setIsValid(true)
      setError('')
    } else {
      setIsValid(false)
      const errorMsg = result.line 
        ? `Line ${result.line}${result.column ? `, Column ${result.column}` : ''}: ${result.error}`
        : result.error || 'Invalid XML'
      setError(errorMsg)
    }
    setTotalOperations(prev => prev + 1)
  }, [input, validateXML, ])

  // Auto-format on input change
  useEffect(() => {
    if (autoFormat && input.trim()) {
      const timer = setTimeout(() => {
        format()
      }, 500)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, autoFormat, indentSize])

  // Auto-validate on input change
  useEffect(() => {
    if (input.trim()) {
      const result = validateXML(input)
      setIsValid(result.valid)
      if (!result.valid && input.length > 0) {
        const errorMsg = result.line 
          ? `Line ${result.line}${result.column ? `, Column ${result.column}` : ''}: ${result.error}`
          : result.error || 'Invalid XML'
        setError(errorMsg)
      } else {
        setError('')
      }
    } else {
      setIsValid(null)
      setError('')
    }
  }, [input, validateXML])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
    }
  }

  const exportToFile = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.xml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrlKey: true,
      handler: format
    }
  ])

  return (
    <Layout
      title="📄 XML Formatter"
      description="Format, minify, and validate XML online. Auto-format with proper indentation and real-time validation."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6">
          <div className="space-y-6">
            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Indent Size
                </label>
                <select
                  value={indentSize}
                  onChange={(e) => setIndentSize(e.target.value as IndentSize)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value="tab">Tab</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoFormat}
                    onChange={(e) => setAutoFormat(e.target.checked)}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Auto-format</span>
                </label>
              </div>
            </div>

            {/* Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  XML Input
                </label>
                <div className="flex items-center gap-2">
                  {isValid === true && (
                    <span className="text-xs text-green-600 font-medium">✓ Valid</span>
                  )}
                  {isValid === false && (
                    <span className="text-xs text-red-600 font-medium">✗ Invalid</span>
                  )}
                  <button
                    onClick={() => setInput('')}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='<?xml version="1.0" encoding="UTF-8"?><root><item>Content</item></root>'
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-none"
              />
              {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={format}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Format
                </button>
                <button
                  onClick={minify}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Minify
                </button>
                <button
                  onClick={validate}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Validate
                </button>
              </div>
            </div>

            {/* Output */}
            {output && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Formatted XML
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(output)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Copy
                    </button>
                    <button
                      onClick={exportToFile}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Export
                    </button>
                  </div>
                </div>
                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
                  {output}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {totalOperations > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
            <p className="text-sm text-gray-600">
              Total operations: <span className="font-semibold text-primary-600">{totalOperations}</span>
            </p>
          </div>
        )}
      </div>

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is XML?</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            XML (eXtensible Markup Language) is a markup language designed to store and transport data. 
            It's both human-readable and machine-readable, making it ideal for data exchange between different 
            systems and applications.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            XML uses tags to define elements and attributes to provide additional information. Well-formatted 
            XML is essential for readability, validation, and proper parsing by XML processors.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📡 API Responses</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Format XML responses from REST APIs and web services for better readability and debugging.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📋 Configuration Files</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Format XML configuration files for applications, servers, and development tools.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🔄 Data Exchange</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Format XML documents used for data exchange between different systems and platforms.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📦 RSS Feeds</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Format and validate RSS and Atom feeds for proper syndication and parsing.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Best Practices</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Validation:</strong> Always validate XML before using it in production to catch errors early.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Indentation:</strong> Use consistent indentation (2 or 4 spaces) for better readability.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Minification:</strong> Minify XML for production to reduce file size and improve performance.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Encoding:</strong> Always specify proper encoding (UTF-8) in XML declarations.</span>
            </li>
          </ul>
        </section>
      </div>

      </Layout>
  )
}


