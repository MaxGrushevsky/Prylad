'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type EntityMode = 'encode' | 'decode'
type ToolMode = 'entity' | 'format'
type FormatAction = 'format' | 'minify'
type IndentSize = 2 | 4 | 'tab'

// Common HTML entities
const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
  '©': '&copy;',
  '®': '&reg;',
  '€': '&euro;',
  '£': '&pound;',
  '¥': '&yen;',
  '¢': '&cent;',
  '§': '&sect;',
  '°': '&deg;',
  '±': '&plusmn;',
  '×': '&times;',
  '÷': '&divide;',
  '½': '&frac12;',
  '¼': '&frac14;',
  '¾': '&frac34;',
  '→': '&rarr;',
  '←': '&larr;',
  '↑': '&uarr;',
  '↓': '&darr;',
  '↔': '&harr;',
  '∞': '&infin;',
  '≠': '&ne;',
  '≤': '&le;',
  '≥': '&ge;',
  '≈': '&asymp;',
  '∑': '&sum;',
  '∏': '&prod;',
  '√': '&radic;',
  'α': '&alpha;',
  'β': '&beta;',
  'γ': '&gamma;',
  'π': '&pi;',
  'Ω': '&Omega;',
  '™': '&trade;',
  '…': '&hellip;',
  '–': '&ndash;',
  '—': '&mdash;',
  '«': '&laquo;',
  '»': '&raquo;',
  '„': '&bdquo;',
  '‚': '&sbquo;',
  '‹': '&lsaquo;',
  '›': '&rsaquo;',
  '¡': '&iexcl;',
  '¿': '&iquest;',
  '•': '&bull;',
  '·': '&middot;',
}

// Named entities for decoding
const namedEntities: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&#x27;': "'",
  '&#x2F;': '/',
  '&#x60;': '`',
  '&#x3D;': '=',
  '&copy;': '©',
  '&reg;': '®',
  '&euro;': '€',
  '&pound;': '£',
  '&yen;': '¥',
  '&cent;': '¢',
  '&sect;': '§',
  '&deg;': '°',
  '&plusmn;': '±',
  '&times;': '×',
  '&divide;': '÷',
  '&frac12;': '½',
  '&frac14;': '¼',
  '&frac34;': '¾',
  '&rarr;': '→',
  '&larr;': '←',
  '&uarr;': '↑',
  '&darr;': '↓',
  '&harr;': '↔',
  '&infin;': '∞',
  '&ne;': '≠',
  '&le;': '≤',
  '&ge;': '≥',
  '&asymp;': '≈',
  '&sum;': '∑',
  '&prod;': '∏',
  '&radic;': '√',
  '&alpha;': 'α',
  '&beta;': 'β',
  '&gamma;': 'γ',
  '&pi;': 'π',
  '&Omega;': 'Ω',
  '&trade;': '™',
  '&hellip;': '…',
  '&ndash;': '–',
  '&mdash;': '—',
  '&laquo;': '«',
  '&raquo;': '»',
  '&bdquo;': '„',
  '&sbquo;': '‚',
  '&lsaquo;': '‹',
  '&rsaquo;': '›',
  '&iexcl;': '¡',
  '&iquest;': '¿',
  '&bull;': '•',
  '&middot;': '·',
}

const examples = {
  encode: [
    { name: 'HTML Tags', input: '<div>Hello</div>', output: '&lt;div&gt;Hello&lt;/div&gt;' },
    { name: 'Script Tag', input: '<script>alert("XSS")</script>', output: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;' },
    { name: 'Quotes', input: 'He said "Hello"', output: 'He said &quot;Hello&quot;' },
    { name: 'Ampersand', input: 'Tom & Jerry', output: 'Tom &amp; Jerry' },
    { name: 'Special Characters', input: '© 2024 Company™', output: '&copy; 2024 Company&trade;' },
  ],
  decode: [
    { name: 'HTML Tags', input: '&lt;div&gt;Hello&lt;/div&gt;', output: '<div>Hello</div>' },
    { name: 'Quotes', input: 'He said &quot;Hello&quot;', output: 'He said "Hello"' },
    { name: 'Ampersand', input: 'Tom &amp; Jerry', output: 'Tom & Jerry' },
    { name: 'Special Characters', input: '&copy; 2024 Company&trade;', output: '© 2024 Company™' },
    { name: 'Numeric Entities', input: '&#65;&#66;&#67;', output: 'ABC' },
  ],
}

export default function HtmlEntityEncoderPage() {
  const [toolMode, setToolMode] = useState<ToolMode>('entity')
  const [entityMode, setEntityMode] = useState<EntityMode>('encode')
  const [formatAction, setFormatAction] = useState<FormatAction>('format')
  const [indentSize, setIndentSize] = useState<IndentSize>(2)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [autoConvert, setAutoConvert] = useState(true)
  const [totalConversions, setTotalConversions] = useState(0)

  // SEO data
  const toolPath = '/html-entity-encoder'
  const toolName = 'HTML Entity Encoder'
  const category = 'code'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What are HTML entities?",
      answer: "HTML entities are special codes used to represent characters that have special meaning in HTML or characters that can't be easily typed. For example, &lt; represents <, &gt; represents >, and &amp; represents &."
    },
    {
      question: "Why do I need to encode HTML entities?",
      answer: "HTML entities are essential for displaying special characters correctly in HTML. They prevent browsers from interpreting characters like < and > as HTML tags, and they allow you to display characters that aren't on your keyboard."
    },
    {
      question: "What's the difference between named and numeric entities?",
      answer: "Named entities use text codes like &amp; for &, while numeric entities use numbers like &#38;. Both produce the same result, but named entities are more readable while numeric entities work for any character."
    },
    {
      question: "Can I format HTML code with this tool?",
      answer: "Yes! In addition to encoding/decoding HTML entities, our tool can format HTML code with proper indentation or minify it by removing unnecessary whitespace and comments."
    },
    {
      question: "Is the HTML entity encoder free to use?",
      answer: "Yes, absolutely! Our HTML entity encoder is completely free to use. There are no hidden fees, subscriptions, or usage limits. You can encode, decode, and format as much HTML as you need."
    },
    {
      question: "Do you store my HTML code?",
      answer: "No, absolutely not. All HTML processing happens entirely in your browser. We never see, store, transmit, or have any access to your HTML code. Your privacy is completely protected."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Choose Tool Mode",
      text: "Select Entity Encoder/Decoder to encode/decode HTML entities, or HTML Formatter to format/minify HTML code."
    },
    {
      name: "Select Action",
      text: "For entities, choose Encode to convert special characters to entities, or Decode to convert entities back to characters. For formatting, choose Format or Minify."
    },
    {
      name: "Enter Your HTML",
      text: "Paste or type your HTML code into the input area."
    },
    {
      name: "Customize Settings",
      text: "For formatting, choose indentation size (2 spaces, 4 spaces, or tabs). Enable auto-convert for real-time processing."
    },
    {
      name: "Copy or Use",
      text: "Copy the encoded, decoded, or formatted HTML to your clipboard for use in your projects."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Encode and Decode HTML Entities",
      "Learn how to encode and decode HTML entities, and format HTML code using our free online HTML tools.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "HTML Entity Encoder",
      "Free online HTML entity encoder, decoder, and formatter. Encode/decode HTML entities and format/minify HTML code with customizable settings.",
      "https://prylad.pro/html-entity-encoder",
      "UtilityApplication"
    )
  ]

  const encodeHtml = useCallback((text: string): string => {
    return text.split('').map((char) => {
      // First check if it's a common HTML entity
      if (htmlEntities[char]) {
        return htmlEntities[char]
      }
      // Check if it's a special character that needs encoding
      const code = char.charCodeAt(0)
      if (code < 32 || code > 126) {
        // Non-ASCII characters - encode as numeric entity
        return `&#${code};`
      }
      // Regular ASCII character - keep as is
      return char
    }).join('')
  }, [])

  const decodeHtml = useCallback((text: string): string => {
    // First decode named entities
    let decoded = text
    for (const [entity, char] of Object.entries(namedEntities)) {
      decoded = decoded.replace(new RegExp(entity, 'g'), char)
    }
    
    // Then decode numeric entities (decimal)
    decoded = decoded.replace(/&#(\d+);/g, (match, num) => {
      return String.fromCharCode(parseInt(num, 10))
    })
    
    // Then decode numeric entities (hexadecimal)
    decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16))
    })
    
    return decoded
  }, [])

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

  const minifyHTML = useCallback((code: string): string => {
    return code
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove whitespace between tags
      .replace(/>\s+</g, '><')
      // Remove leading/trailing whitespace
      .trim()
  }, [])

  const formatHTML = useCallback((code: string): string => {
    const indent = getIndent()
    let result = code
    let indentLevel = 0
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
              formatted.push(indent.repeat(indentLevel) + currentLine.trim())
              currentLine = ''
            }
            indentLevel = Math.max(0, indentLevel - 1)
            currentLine += char
          } else {
            // Opening tag
            if (currentLine.trim()) {
              formatted.push(indent.repeat(indentLevel) + currentLine.trim())
              currentLine = ''
            }
            currentLine += char
            inTag = true
          }
        } else if (char === '>') {
          currentLine += char
          inTag = false
          if (prevChar !== '/' && nextChar && nextChar !== '<') {
            formatted.push(indent.repeat(indentLevel) + currentLine.trim())
            currentLine = ''
            indentLevel++
          } else {
            formatted.push(indent.repeat(indentLevel) + currentLine.trim())
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
      formatted.push(indent.repeat(indentLevel) + currentLine.trim())
    }

    return formatted.join('\n')
  }, [getIndent])

  const handleConvert = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      let result = ''
      if (toolMode === 'entity') {
        result = entityMode === 'encode' ? encodeHtml(input) : decodeHtml(input)
      } else {
        result = formatAction === 'minify' ? minifyHTML(input) : formatHTML(input)
      }
      setOutput(result)
      setTotalConversions(prev => prev + 1)
    } catch (error) {
      setOutput('Error: Invalid input')
    }
  }, [input, toolMode, entityMode, formatAction, encodeHtml, decodeHtml, minifyHTML, formatHTML])

  useEffect(() => {
    if (autoConvert) {
      handleConvert()
    }
  }, [input, toolMode, entityMode, formatAction, indentSize, autoConvert, handleConvert])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Failed to copy
    }
  }

  const applyExample = (example: typeof examples.encode[0]) => {
    setInput(example.input)
    if (!autoConvert) {
      setOutput(example.output)
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
  }

  const exportToFile = () => {
    if (!output) return
    const blob = new Blob([output], { type: toolMode === 'entity' ? 'text/plain' : 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = toolMode === 'entity' 
      ? `html-entities-${entityMode === 'encode' ? 'encoded' : 'decoded'}.txt`
      : `${formatAction === 'minify' ? 'minified' : 'formatted'}.html`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  useKeyboardShortcuts({
    onEnter: () => handleConvert(),
    onSave: () => exportToFile(),
    onClear: () => clearAll()
  })

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🔤 HTML Tools - Entity Encoder/Decoder & Formatter"
        description="Encode and decode HTML entities, format and minify HTML code. Convert special characters to HTML entities, beautify HTML with proper indentation, or compress it for production."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Main Tool */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            {/* Tool Mode Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tool Mode:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setToolMode('entity')
                    setOutput('')
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    toolMode === 'entity'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  🔤 HTML Entities
                </button>
                <button
                  onClick={() => {
                    setToolMode('format')
                    setOutput('')
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    toolMode === 'format'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  📝 Format/Minify
                </button>
              </div>
            </div>

            {/* Entity Mode Selection */}
            {toolMode === 'entity' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Conversion Mode:</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEntityMode('encode')
                      setOutput('')
                    }}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                      entityMode === 'encode'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    🔒 Encode (Text → HTML Entities)
                  </button>
                  <button
                    onClick={() => {
                      setEntityMode('decode')
                      setOutput('')
                    }}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                      entityMode === 'decode'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    🔓 Decode (HTML Entities → Text)
                  </button>
                </div>
              </div>
            )}

            {/* Format Action Selection */}
            {toolMode === 'format' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Action:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setFormatAction('format')
                        setOutput('')
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        formatAction === 'format'
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Format
                    </button>
                    <button
                      onClick={() => {
                        setFormatAction('minify')
                        setOutput('')
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        formatAction === 'minify'
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Minify
                    </button>
                  </div>
                </div>
                {formatAction === 'format' && (
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
              </div>
            )}

            {/* Auto Convert Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto-convert"
                checked={autoConvert}
                onChange={(e) => setAutoConvert(e.target.checked)}
                className="w-4 h-4 accent-primary-600 rounded"
              />
              <label htmlFor="auto-convert" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                Auto-convert on input change
              </label>
            </div>

            {/* Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {toolMode === 'entity' 
                    ? (entityMode === 'encode' ? 'Text to Encode' : 'HTML Entities to Decode')
                    : 'HTML Code'}
                </label>
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={toolMode === 'entity'
                  ? (entityMode === 'encode' 
                    ? 'Enter text with HTML tags or special characters...' 
                    : 'Enter HTML entities (e.g., &lt;div&gt;Hello&lt;/div&gt;)...')
                  : 'Enter HTML code...'}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm min-h-[150px] resize-y"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {input.length} characters
                </span>
                {input && (
                  <button
                    onClick={() => copyToClipboard(input)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Copy Input
                  </button>
                )}
              </div>
            </div>

            {/* Convert Button */}
            {!autoConvert && (
              <button
                onClick={handleConvert}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
              >
                {toolMode === 'entity' 
                  ? (entityMode === 'encode' ? 'Encode' : 'Decode')
                  : (formatAction === 'format' ? 'Format' : 'Minify')}
              </button>
            )}

            {/* Output */}
            {output && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {toolMode === 'entity'
                      ? (entityMode === 'encode' ? 'Encoded HTML Entities' : 'Decoded Text')
                      : (formatAction === 'format' ? 'Formatted HTML' : 'Minified HTML')}
                  </label>
                  <div className="flex items-center gap-3">
                    {totalConversions > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Operations: {totalConversions}
                      </span>
                    )}
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
                <div className="relative">
                  <textarea
                    value={output}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-primary-200 dark:border-primary-800 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-gray-900 dark:text-gray-100 font-mono text-sm min-h-[150px] resize-y"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => copyToClipboard(output)}
                      className="px-3 py-1.5 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 transition-colors shadow-md"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {output.length} characters
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Ratio: {input.length > 0 ? ((output.length / input.length) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            )}

            {/* Examples - only for entity mode */}
            {toolMode === 'entity' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Quick Examples:
                </label>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {examples[entityMode].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => applyExample(example)}
                      className="px-3 py-2 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {example.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate">
                        {example.input}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Common Entities Reference */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common HTML Entities Reference</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">Special Characters</h3>
              <div className="space-y-1 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">&lt;</span>
                  <span className="text-gray-500 dark:text-gray-400">&amp;lt;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">&gt;</span>
                  <span className="text-gray-500 dark:text-gray-400">&amp;gt;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">&amp;</span>
                  <span className="text-gray-500 dark:text-gray-400">&amp;amp;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">&quot;</span>
                  <span className="text-gray-500 dark:text-gray-400">&amp;quot;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">&#39;</span>
                  <span className="text-gray-500 dark:text-gray-400">&amp;#39;</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">Symbols</h3>
              <div className="space-y-1 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">©</span>
                  <span className="text-gray-500 dark:text-gray-400">&amp;copy;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">®</span>
                  <span className="text-gray-500 dark:text-gray-400">&amp;reg;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">™</span>
                  <span className="text-gray-500 dark:text-gray-400">&amp;trade;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">€</span>
                  <span className="text-gray-500 dark:text-gray-400">&amp;euro;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">£</span>
                  <span className="text-gray-500 dark:text-gray-400">&amp;pound;</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">Arrows</h3>
              <div className="space-y-1 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">→</span>
                  <span className="text-gray-500 dark:text-gray-400">&amp;rarr;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">←</span>
                  <span className="text-gray-500 dark:text-gray-400">&amp;larr;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">↑</span>
                  <span className="text-gray-500 dark:text-gray-400">&amp;uarr;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">↓</span>
                  <span className="text-gray-500 dark:text-gray-400">&amp;darr;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">↔</span>
                  <span className="text-gray-500 dark:text-gray-400">&amp;harr;</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What are HTML Entities?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                HTML entities are special codes used to represent characters that have special meaning in HTML or 
                characters that cannot be easily typed on a keyboard. They allow you to display characters like 
                &lt;, &gt;, &amp;, quotes, and special symbols safely in HTML documents.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                HTML entities start with an ampersand (&amp;) and end with a semicolon (;). They can be either 
                named entities (like &amp;lt; for &lt;) or numeric entities (like &amp;#60; for &lt; or &amp;#x3C; 
                in hexadecimal).
              </p>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use Our HTML Entity Encoder/Decoder</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li><strong>Choose Mode:</strong> Select &quot;Encode&quot; to convert text to HTML entities, or &quot;Decode&quot; to convert HTML entities back to text.</li>
                <li><strong>Enter Your Text:</strong> Paste or type your text in the input field. For encoding, enter HTML code or text with special characters. For decoding, enter HTML entities.</li>
                <li><strong>View Results:</strong> The converted text will appear in the output field automatically (if auto-convert is enabled) or click the convert button.</li>
                <li><strong>Copy Results:</strong> Click the copy button to copy the converted text to your clipboard for use in your projects.</li>
                <li><strong>Use Examples:</strong> Click on any example to quickly test the tool with common use cases.</li>
              </ol>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔒 XSS Protection</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Encode user input before displaying it in HTML to prevent Cross-Site Scripting (XSS) attacks. 
                  This is essential for web security when displaying user-generated content.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">💻 Display HTML Code</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  When you need to show HTML code as text on a webpage (like in tutorials or documentation), 
                  encode the HTML tags so they display as text instead of being rendered.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📝 JSON/JavaScript</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Encode HTML when embedding it in JSON or JavaScript strings to prevent syntax errors and 
                  ensure proper escaping of special characters.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎨 Special Characters</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use HTML entities to display special characters, symbols, and Unicode characters that 
                  might not render correctly in all browsers or contexts.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Understanding HTML Entity Types</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Named Entities</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Named entities use a name to represent the character:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-sm ml-4">
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&amp;lt;</code> for &lt;</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&amp;gt;</code> for &gt;</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&amp;amp;</code> for &amp;</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&amp;copy;</code> for ©</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Numeric Entities (Decimal)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Numeric entities use the character&apos;s Unicode code point in decimal:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-sm ml-4">
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&amp;#60;</code> for &lt;</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&amp;#62;</code> for &gt;</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&amp;#169;</code> for ©</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Numeric Entities (Hexadecimal)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Hexadecimal entities use the character&apos;s Unicode code point in hex:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-sm ml-4">
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&amp;#x3C;</code> for &lt;</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&amp;#x3E;</code> for &gt;</li>
                  <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">&amp;#xA9;</code> for ©</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What characters should I encode?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  The most important characters to encode are: &lt;, &gt;, &amp;, &quot;, and &#39;. These have special 
                  meaning in HTML and can break your page or create security vulnerabilities if not properly encoded.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">When should I use HTML entities?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use HTML entities when: displaying user input in HTML (for security), showing HTML code as text, 
                  embedding HTML in JSON/JavaScript, or displaying special characters that might not render correctly.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the difference between encoding and escaping?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  HTML encoding and HTML escaping are essentially the same thing. Both refer to converting special 
                  characters to HTML entities. The terms are often used interchangeably.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Do I need to encode all special characters?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, only encode characters that have special meaning in HTML (&lt;, &gt;, &amp;) or characters that 
                  need to be displayed but might cause issues. Regular text and most punctuation don&apos;t need encoding.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Is my data stored or transmitted?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, all encoding and decoding happens entirely in your browser. We never see, store, or transmit any 
                  of your text. Your privacy is completely protected.
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

