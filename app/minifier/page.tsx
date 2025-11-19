'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
type CodeType = 'css' | 'js' | 'json' | 'html'
type Action = 'minify' | 'beautify'

export default function MinifierPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [type, setType] = useState<CodeType>('css')
  const [action, setAction] = useState<Action>('minify')
  const [autoProcess, setAutoProcess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalProcessed, setTotalProcessed] = useState(0)

  const minifyCSS = useCallback((code: string): string => {
    return code
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove whitespace around special characters
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*:\s*/g, ':')
      .replace(/\s*;\s*/g, ';')
      .replace(/\s*,\s*/g, ',')
      .replace(/\s*>\s*/g, '>')
      .replace(/\s*\+\s*/g, '+')
      .replace(/\s*~\s*/g, '~')
      // Remove whitespace at start and end of rules
      .replace(/\s+/g, ' ')
      // Remove spaces before important
      .replace(/\s+!important/g, '!important')
      // Remove trailing semicolons before closing braces
      .replace(/;}/g, '}')
      // Remove leading/trailing whitespace
      .trim()
  }, [])

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

  const beautifyCSS = useCallback((code: string): string => {
    let result = code
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Add newlines after semicolons
      .replace(/;/g, ';\n')
      // Add newlines after closing braces
      .replace(/}/g, '\n}\n')
      // Add newlines after opening braces
      .replace(/{/g, ' {\n')
      // Indent content inside braces
      .replace(/\n([^}\n]+)\n}/g, (match, content) => {
        return '\n  ' + content.trim() + '\n}'
      })
      // Clean up multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim each line
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .trim()

    return result
  }, [])

  const beautifyJS = useCallback((code: string): string => {
    let result = code
    let indent = 0
    const indentSize = 2

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
        indent = Math.max(0, indent - 1)
      }

      // Add indentation
      formatted.push(' '.repeat(indent * indentSize) + line)

      // Increase indent after opening braces
      if (line.endsWith('{')) {
        indent++
      }
    }

    return formatted.join('\n')
  }, [])

  const minifyJSON = useCallback((code: string): string => {
    try {
      const parsed = JSON.parse(code)
      return JSON.stringify(parsed)
    } catch (e) {
      throw new Error('Invalid JSON')
    }
  }, [])

  const beautifyJSON = useCallback((code: string): string => {
    try {
      const parsed = JSON.parse(code)
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      throw new Error('Invalid JSON')
    }
  }, [])

  const minifyHTML = useCallback((code: string): string => {
    return code
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove whitespace between tags
      .replace(/>\s+</g, '><')
      // Remove leading/trailing whitespace
      .trim()
  }, [])

  const beautifyHTML = useCallback((code: string): string => {
    let result = code
    let indent = 0
    const indentSize = 2
    let inTag = false
    let inString = false
    let stringChar = ''
    const formatted: string[] = []
    let currentLine = ''

    for (let i = 0; i < result.length; i++) {
      const char = result[i]
      const prevChar = result[i - 1]
      const nextChar = result[i + 1]

      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString) {
          inString = true
          stringChar = char
        } else if (char === stringChar) {
          inString = false
          stringChar = ''
        }
        currentLine += char
      } else if (!inString) {
        if (char === '<') {
          if (nextChar === '/') {
            // Closing tag
            if (currentLine.trim()) {
              formatted.push(' '.repeat(indent * indentSize) + currentLine.trim())
              currentLine = ''
            }
            indent = Math.max(0, indent - 1)
            currentLine += char
          } else {
            // Opening tag
            if (currentLine.trim()) {
              formatted.push(' '.repeat(indent * indentSize) + currentLine.trim())
              currentLine = ''
            }
            currentLine += char
            inTag = true
          }
        } else if (char === '>') {
          currentLine += char
          inTag = false
          if (prevChar !== '/' && nextChar && nextChar !== '<') {
            formatted.push(' '.repeat(indent * indentSize) + currentLine.trim())
            currentLine = ''
            indent++
          } else {
            formatted.push(' '.repeat(indent * indentSize) + currentLine.trim())
            currentLine = ''
          }
        } else {
          currentLine += char
        }
      } else {
        currentLine += char
      }
    }

    if (currentLine.trim()) {
      formatted.push(' '.repeat(indent * indentSize) + currentLine.trim())
    }

    return formatted.join('\n')
  }, [])

  const process = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      return
    }

    try {
      let result = ''
      if (action === 'minify') {
        switch (type) {
          case 'css':
            result = minifyCSS(input)
            break
          case 'js':
            result = minifyJS(input)
            break
          case 'json':
            result = minifyJSON(input)
            break
          case 'html':
            result = minifyHTML(input)
            break
        }
      } else {
        switch (type) {
          case 'css':
            result = beautifyCSS(input)
            break
          case 'js':
            result = beautifyJS(input)
            break
          case 'json':
            result = beautifyJSON(input)
            break
          case 'html':
            result = beautifyHTML(input)
            break
        }
      }
      setOutput(result)
      setError(null)
      setTotalProcessed(prev => prev + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error processing code. Please check your syntax.')
      setOutput('')
    }
  }, [input, type, action, minifyCSS, minifyJS, minifyJSON, minifyHTML, beautifyCSS, beautifyJS, beautifyJSON, beautifyHTML])

  useEffect(() => {
    if (autoProcess && input) {
      const timeoutId = setTimeout(() => {
        process()
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [autoProcess, input, type, action, process])

  const copyToClipboard = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
    } catch (err) {
    }
  }

  const exportToFile = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const extensions: Record<CodeType, string> = {
      css: 'css',
      js: 'js',
      json: 'json',
      html: 'html'
    }
    const extension = extensions[type]
    link.download = `${action === 'minify' ? 'minified' : 'beautified'}.${extension}`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  // Keyboard shortcuts
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
      <Layout
        title="⚡ Code Minifier & Beautifier - Minify and Format CSS, JS, JSON, HTML Online"
      description="Minify and beautify CSS, JavaScript, JSON, and HTML code online for free. Reduce file size, improve performance, and format code with proper indentation. Perfect for web development."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Source Code</h2>
              {totalProcessed > 0 && (
                <div className="text-sm text-gray-500">
                  Processed: <span className="font-semibold text-gray-900">{totalProcessed}</span>
                </div>
              )}
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Code Type:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['css', 'js', 'json', 'html'] as CodeType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all uppercase ${
                      type === t
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Action:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAction('minify')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    action === 'minify'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Minify
                </button>
                <button
                  onClick={() => setAction('beautify')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    action === 'beautify'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Beautify
                </button>
              </div>
            </div>

            {/* Input Textarea */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {type.toUpperCase()} Code
                </label>
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-96 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                placeholder={`Enter ${type.toUpperCase()} code...`}
                spellCheck={false}
              />
              {input && (
                <div className="mt-2 text-xs text-gray-500">
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
              <span className="text-sm text-gray-700">Auto-process as you type</span>
            </label>

            {!autoProcess && (
              <button
                onClick={process}
                disabled={!input.trim()}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50"
              >
                {action === 'minify' ? 'Minify' : 'Beautify'} Code
              </button>
            )}
          </div>

          {/* Output */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold">
              {action === 'minify' ? 'Minified' : 'Beautified'} Code
            </h2>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Statistics */}
            {stats && output && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Original Size</p>
                  <p className="font-semibold text-gray-900">
                    {stats.inputSize.toLocaleString()} bytes
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">
                    {action === 'minify' ? 'Minified' : 'Formatted'} Size
                  </p>
                  <p className="font-semibold text-gray-900">
                    {stats.outputSize.toLocaleString()} bytes
                  </p>
                </div>
                {action === 'minify' && stats.reduction > 0 && (
                  <>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Reduction</p>
                      <p className="font-semibold text-gray-900">
                        {stats.reduction}%
                      </p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Lines</p>
                      <p className="font-semibold text-gray-900">
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
                <label className="block text-sm font-semibold text-gray-700">Result</label>
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
                className="w-full h-96 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 resize-none font-mono text-sm"
                placeholder="Result will appear here..."
                spellCheck={false}
              />
              {output && (
                <div className="mt-2 text-xs text-gray-500">
                  {output.length} characters, {output.split('\n').length} lines
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Code Minification?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Code minification is the process of removing unnecessary characters from source code without changing 
                its functionality. This includes removing whitespace, comments, and shortening variable names where 
                possible. Minified code reduces file size, improves load times, and enhances website performance.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free CSS and JavaScript minifier reduces your code size by removing comments, whitespace, and 
                unnecessary characters. We also offer a beautifier to format and indent your code for better readability. 
                Perfect for web developers who want to optimize their websites for production.
              </p>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Our Minifier</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li><strong>Select Code Type:</strong> Choose CSS, JavaScript, JSON, or HTML from the type selector.</li>
                <li><strong>Choose Action:</strong> Select Minify to compress your code, or Beautify to format it with proper indentation.</li>
                <li><strong>Paste Your Code:</strong> Enter or paste your code into the input field.</li>
                <li><strong>Process:</strong> Click the process button or enable auto-process to see results in real-time.</li>
                <li><strong>Review Statistics:</strong> See file size reduction, percentage saved, and line count changes.</li>
                <li><strong>Copy or Export:</strong> Copy the result to clipboard or export as a file for use in your projects.</li>
              </ol>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits of Code Minification</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">⚡ Faster Load Times</h3>
                <p className="text-gray-700 text-sm">
                  Smaller file sizes mean faster downloads. Minified CSS and JavaScript can reduce file size by 
                  30-70%, significantly improving page load times and user experience.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📦 Reduced Bandwidth</h3>
                <p className="text-gray-700 text-sm">
                  Minified code uses less bandwidth, saving costs for both you and your users. Especially important 
                  for mobile users with limited data plans.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🔒 Better Performance</h3>
                <p className="text-gray-700 text-sm">
                  Smaller files parse and execute faster. This improves overall website performance, reduces server 
                  load, and can improve SEO rankings.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">✨ Code Beautification</h3>
                <p className="text-gray-700 text-sm">
                  Our beautifier formats messy code with proper indentation and spacing, making it easier to read, 
                  debug, and maintain.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What does minification do?</h3>
                <p className="text-gray-700 text-sm">
                  Minification removes unnecessary characters (whitespace, comments, line breaks) from your code 
                  without changing its functionality. This reduces file size and improves load times.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Will minification break my code?</h3>
                <p className="text-gray-700 text-sm">
                  No, minification only removes whitespace and comments. It doesn&apos;t change your code&apos;s logic or 
                  functionality. However, always test minified code before deploying to production.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What&apos;s the difference between minify and beautify?</h3>
                <p className="text-gray-700 text-sm">
                  Minify compresses code by removing whitespace and comments. Beautify formats code with proper 
                  indentation and spacing for better readability. Use minify for production, beautify for development.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How much can I reduce file size?</h3>
                <p className="text-gray-700 text-sm">
                  Typically, minification reduces CSS and JavaScript file sizes by 30-70%, depending on the amount 
                  of whitespace and comments in your original code. Our statistics show the exact reduction percentage.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my code stored or transmitted?</h3>
                <p className="text-gray-700 text-sm">
                  No, all processing happens entirely in your browser. We never see, store, or transmit any of your 
                  code. Your privacy and code security are completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
    </>
  )
}
