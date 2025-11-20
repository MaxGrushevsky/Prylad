'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type ConversionMode = 'text-to-binary' | 'binary-to-text'
type BinaryFormat = 'spaced' | 'no-spaces' | '8-bit-groups'

export default function TextToBinaryPage() {
  const [mode, setMode] = useState<ConversionMode>('text-to-binary')
  const [text, setText] = useState('')
  const [binary, setBinary] = useState('')
  const [format, setFormat] = useState<BinaryFormat>('spaced')
  const [autoConvert, setAutoConvert] = useState(true)
  const [error, setError] = useState('')
  const [totalOperations, setTotalOperations] = useState(0)

  const textToBinary = useCallback((input: string, fmt: BinaryFormat): string => {
    if (!input) return ''
    
    try {
      const binaryArray: string[] = []
      
      for (let i = 0; i < input.length; i++) {
        const charCode = input.charCodeAt(i)
        let binaryChar = charCode.toString(2)
        
        // Pad to 8 bits
        while (binaryChar.length < 8) {
          binaryChar = '0' + binaryChar
        }
        
        binaryArray.push(binaryChar)
      }
      
      switch (fmt) {
        case 'spaced':
          return binaryArray.join(' ')
        case '8-bit-groups':
          return binaryArray.join(' ')
        case 'no-spaces':
          return binaryArray.join('')
        default:
          return binaryArray.join(' ')
      }
    } catch (e) {
      throw new Error('Failed to convert text to binary')
    }
  }, [])

  const binaryToText = useCallback((input: string): string => {
    if (!input.trim()) return ''
    
    try {
      // Remove all whitespace and non-binary characters
      const cleaned = input.replace(/[^01]/g, '')
      
      if (cleaned.length === 0) {
        throw new Error('No valid binary digits found')
      }
      
      // Check if length is multiple of 8
      if (cleaned.length % 8 !== 0) {
        throw new Error(`Binary string length (${cleaned.length}) is not a multiple of 8`)
      }
      
      const textArray: string[] = []
      
      // Process 8 bits at a time
      for (let i = 0; i < cleaned.length; i += 8) {
        const binaryByte = cleaned.substring(i, i + 8)
        const charCode = parseInt(binaryByte, 2)
        
        // Validate character code (0-1114111 for valid Unicode)
        if (charCode > 1114111) {
          throw new Error(`Invalid character code: ${charCode}`)
        }
        
        textArray.push(String.fromCharCode(charCode))
      }
      
      return textArray.join('')
    } catch (e) {
      throw new Error((e as Error).message || 'Failed to convert binary to text')
    }
  }, [])

  const convertTextToBinary = useCallback(() => {
    setError('')
    if (text) {
      try {
        const result = textToBinary(text, format)
        setBinary(result)
        setTotalOperations(prev => prev + 1)
      } catch (e) {
        setError((e as Error).message || 'Conversion failed')
      }
    } else {
      setBinary('')
    }
  }, [text, format, textToBinary])

  const convertBinaryToText = useCallback(() => {
    setError('')
    if (binary.trim()) {
      try {
        const result = binaryToText(binary)
        setText(result)
        setTotalOperations(prev => prev + 1)
      } catch (e) {
        setError((e as Error).message || 'Conversion failed')
      }
    } else {
      setText('')
    }
  }, [binary, binaryToText])

  // Auto-convert on text change
  useEffect(() => {
    if (autoConvert && mode === 'text-to-binary' && text) {
      const timer = setTimeout(() => {
        convertTextToBinary()
      }, 300)
      return () => clearTimeout(timer)
    } else if (autoConvert && mode === 'text-to-binary' && !text) {
      setBinary('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoConvert, mode, format])

  // Auto-convert on binary change
  useEffect(() => {
    if (autoConvert && mode === 'binary-to-text' && binary.trim()) {
      const timer = setTimeout(() => {
        convertBinaryToText()
      }, 300)
      return () => clearTimeout(timer)
    } else if (autoConvert && mode === 'binary-to-text' && !binary.trim()) {
      setText('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [binary, autoConvert, mode])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Silent fail
    }
  }

  const clearAll = () => {
    setText('')
    setBinary('')
    setError('')
  }

  const loadExample = (example: 'hello' | 'numbers' | 'unicode') => {
    setError('')
    if (example === 'hello') {
      setText('Hello World!')
      setMode('text-to-binary')
    } else if (example === 'numbers') {
      setText('12345')
      setMode('text-to-binary')
    } else if (example === 'unicode') {
      setText('Hello 世界 🌍')
      setMode('text-to-binary')
    }
  }

  useKeyboardShortcuts({
    onEnter: mode === 'text-to-binary' ? convertTextToBinary : convertBinaryToText,
    onClear: clearAll
  })

  const getStats = () => {
    if (mode === 'text-to-binary' && text) {
      return {
        inputLength: text.length,
        outputLength: binary.length,
        ratio: binary.length > 0 ? (binary.length / text.length).toFixed(2) : '0'
      }
    } else if (mode === 'binary-to-text' && binary.trim()) {
      const cleaned = binary.replace(/[^01]/g, '')
      return {
        inputLength: cleaned.length,
        outputLength: text.length,
        bytes: cleaned.length / 8
      }
    }
    return null
  }

  const stats = getStats()

  // SEO data
  const toolPath = '/text-to-binary'
  const toolName = 'Text to Binary Converter'
  const category = 'converter'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "How does text to binary conversion work?",
      answer: "Text to binary conversion works by converting each character to its ASCII or Unicode value, then representing that value as an 8-bit binary number. For example, 'H' (ASCII 72) becomes '01001000' in binary."
    },
    {
      question: "What is the difference between ASCII and Unicode in binary conversion?",
      answer: "ASCII uses 7-8 bits and represents 128-256 characters (English letters, digits, symbols). Unicode supports over 1 million characters from all languages and uses variable-length encoding (UTF-8 uses 1-4 bytes per character)."
    },
    {
      question: "Can I convert binary back to text?",
      answer: "Yes! Our converter supports bidirectional conversion. Simply switch to 'Binary → Text' mode and paste your binary code. The binary string must be a multiple of 8 bits (one byte per character)."
    },
    {
      question: "What binary format should I use?",
      answer: "Choose 'Spaced' for readability (each byte separated), 'No Spaces' for compact representation, or '8-bit Groups' for organized display. The format doesn't affect the actual binary data, only its presentation."
    },
    {
      question: "Does the converter support Unicode characters and emojis?",
      answer: "Yes! Our converter supports Unicode characters including emojis and characters from various languages. Each character is converted to its Unicode value and represented in binary."
    },
    {
      question: "Is the text to binary converter free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All conversions happen in your browser - we never see or store your data."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Select Conversion Mode",
      text: "Choose 'Text → Binary' to convert text to binary code, or 'Binary → Text' to convert binary back to text."
    },
    {
      name: "Choose Format (Text to Binary)",
      text: "Select your preferred binary format: Spaced (readable), No Spaces (compact), or 8-bit Groups (organized)."
    },
    {
      name: "Enter Your Text or Binary",
      text: "Paste or type your text in the input area. For binary input, ensure the length is a multiple of 8 bits."
    },
    {
      name: "View Results",
      text: "The conversion happens automatically in real-time. View the binary output or text result in the output area."
    },
    {
      name: "Copy and Use",
      text: "Click 'Copy' to copy the converted result to your clipboard for use in your projects or documentation."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Convert Text to Binary and Binary to Text",
      "Learn how to convert text to binary code and binary back to text using our free online converter tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Text to Binary Converter",
      "Free online text to binary and binary to text converter. Support for ASCII, Unicode, multiple formatting options, real-time conversion.",
      "https://prylad.pro/text-to-binary",
      "UtilityApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="💻 Text to Binary / Binary to Text Converter"
        description="Convert text to binary code and binary to text online for free. Support for ASCII, Unicode characters. Multiple formatting options. Real-time conversion. No registration required."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Conversion Mode:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMode('text-to-binary')
                    setError('')
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'text-to-binary'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Text → Binary
                </button>
                <button
                  onClick={() => {
                    setMode('binary-to-text')
                    setError('')
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'binary-to-text'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Binary → Text
                </button>
              </div>
            </div>

            {/* Format Selection (for text-to-binary) */}
            {mode === 'text-to-binary' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Binary Format:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setFormat('spaced')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                      format === 'spaced'
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Spaced
                  </button>
                  <button
                    onClick={() => setFormat('no-spaces')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                      format === 'no-spaces'
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    No Spaces
                  </button>
                  <button
                    onClick={() => setFormat('8-bit-groups')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                      format === '8-bit-groups'
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    8-bit Groups
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {format === 'spaced' && 'Each byte separated by space (01001000 01100101)'}
                  {format === 'no-spaces' && 'Continuous binary string (0100100001100101)'}
                  {format === '8-bit-groups' && '8-bit groups with spaces (01001000 01100101)'}
                </p>
              </div>
            )}

            {/* Auto Convert Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoConvert"
                checked={autoConvert}
                onChange={(e) => setAutoConvert(e.target.checked)}
                className="w-4 h-4 accent-primary-600"
              />
              <label htmlFor="autoConvert" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                Auto-convert (real-time)
              </label>
            </div>

            {/* Quick Examples */}
            {mode === 'text-to-binary' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quick Examples:</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => loadExample('hello')}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                  >
                    Hello World!
                  </button>
                  <button
                    onClick={() => loadExample('numbers')}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                  >
                    Numbers (12345)
                  </button>
                  <button
                    onClick={() => loadExample('unicode')}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                  >
                    Unicode (Hello 世界 🌍)
                  </button>
                </div>
              </div>
            )}

            {/* Text Input */}
            {mode === 'text-to-binary' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Text Input
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(text)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      disabled={!text}
                    >
                      Copy
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to convert to binary..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none font-mono text-sm"
                />
                {stats && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Characters: {stats.inputLength}
                  </p>
                )}
              </div>
            )}

            {/* Binary Input */}
            {mode === 'binary-to-text' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Binary Input
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(binary)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      disabled={!binary.trim()}
                    >
                      Copy
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <textarea
                  value={binary}
                  onChange={(e) => setBinary(e.target.value)}
                  placeholder="Enter binary code (e.g., 01001000 01100101 01101100 01101100 01101111)..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none font-mono text-sm"
                />
                {stats && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Binary digits: {stats.inputLength} ({stats.bytes} bytes)
                  </p>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Manual Convert Button */}
            {!autoConvert && (
              <div className="flex justify-center">
                <button
                  onClick={mode === 'text-to-binary' ? convertTextToBinary : convertBinaryToText}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  {mode === 'text-to-binary' ? 'Convert to Binary' : 'Convert to Text'}
                </button>
              </div>
            )}

            {/* Result */}
            {mode === 'text-to-binary' && binary && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Binary Output
                  </label>
                  <button
                    onClick={() => copyToClipboard(binary)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Copy Binary
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <code className="text-sm font-mono break-all text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {binary}
                  </code>
                </div>
                {stats && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Binary length: {stats.outputLength} characters (ratio: {stats.ratio}x)
                  </p>
                )}
              </div>
            )}

            {/* Text Result */}
            {mode === 'binary-to-text' && text && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Text Output
                  </label>
                  <button
                    onClick={() => copyToClipboard(text)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Copy Text
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <code className="text-sm font-mono break-all text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {text}
                  </code>
                </div>
                {stats && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Output length: {stats.outputLength} characters
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {totalOperations > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total conversions: <span className="font-semibold text-primary-600">{totalOperations}</span>
            </p>
          </div>
        )}
      </div>

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is Binary Code?</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Binary code is a system of representing text, computer processor instructions, or any other data using a two-symbol system. 
            The two symbols are typically &quot;0&quot; and &quot;1&quot; from the binary number system. Each character in text is represented 
            by a unique sequence of 8 bits (1 byte).
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            For example, the letter &quot;A&quot; is represented as <code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">01000001</code> in binary, 
            and the letter &quot;B&quot; is <code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">01000010</code>. This binary representation 
            allows computers to store and process text data.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How Text to Binary Conversion Works</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">1. Character Encoding</h3>
              <p className="text-sm mb-2">Each character in the text is converted to its ASCII or Unicode value:</p>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto"><code>{`'H' → 72 (decimal) → 01001000 (binary)
'e' → 101 (decimal) → 01100101 (binary)
'l' → 108 (decimal) → 01101100 (binary)
'o' → 111 (decimal) → 01101111 (binary)`}</code></pre>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">2. Binary Representation</h3>
              <p className="text-sm">Each character is represented as an 8-bit binary number. The binary string for &quot;Hello&quot; would be:</p>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto mt-2"><code>01001000 01100101 01101100 01101100 01101111</code></pre>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">3. Formatting Options</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Spaced:</strong> Each byte separated by space for readability</li>
                <li><strong>No Spaces:</strong> Continuous binary string</li>
                <li><strong>8-bit Groups:</strong> Grouped in 8-bit chunks</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Computer Science Education:</strong> Learning how computers represent and process text data.
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Data Encoding:</strong> Converting text to binary for storage or transmission in binary formats.
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Debugging:</strong> Analyzing binary representations of text data in debugging scenarios.
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Cryptography:</strong> Understanding binary representation is fundamental to many cryptographic algorithms.
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Network Protocols:</strong> Some network protocols require binary encoding of text data.
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">ASCII vs Unicode</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">ASCII (American Standard Code for Information Interchange)</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Uses 7 bits (128 characters)</li>
                <li>Represents English letters, digits, and common symbols</li>
                <li>Extended ASCII uses 8 bits (256 characters)</li>
                <li>Limited to Latin alphabet</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Unicode</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Supports over 1 million characters</li>
                <li>Includes characters from all languages</li>
                <li>UTF-8 encoding uses variable-length encoding (1-4 bytes)</li>
                <li>Backward compatible with ASCII</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            <strong>Note:</strong> This converter uses UTF-16 encoding (JavaScript&apos;s native encoding), where most characters 
            are represented as a single 16-bit value, but we display them as 8-bit bytes for compatibility.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Tips for Using Binary Converter</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Valid Binary Input:</strong> When converting binary to text, ensure the binary string length is a multiple of 8 (one byte per character).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Whitespace:</strong> Spaces and other whitespace characters in binary input are automatically removed during conversion.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Unicode Support:</strong> The converter supports Unicode characters, including emojis and characters from various languages.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Format Selection:</strong> Choose the binary format that best suits your needs - spaced for readability, no spaces for compact representation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Real-time Conversion:</strong> Enable auto-convert for instant conversion as you type, or disable it for manual control.</span>
            </li>
          </ul>
        </section>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Converter Tools" />
      )}
    </Layout>
    </>
  )
}

