'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type NumberBase = 2 | 8 | 10 | 16

interface BaseInfo {
  value: NumberBase
  name: string
  label: string
  prefix: string
  description: string
  pattern: RegExp
}

const BASE_INFO: Record<NumberBase, BaseInfo> = {
  2: {
    value: 2,
    name: 'Binary',
    label: 'Binary (Base 2)',
    prefix: '0b',
    description: 'Uses digits 0-1',
    pattern: /^[01\s]+$/
  },
  8: {
    value: 8,
    name: 'Octal',
    label: 'Octal (Base 8)',
    prefix: '0o',
    description: 'Uses digits 0-7',
    pattern: /^[0-7\s]+$/
  },
  10: {
    value: 10,
    name: 'Decimal',
    label: 'Decimal (Base 10)',
    prefix: '',
    description: 'Uses digits 0-9',
    pattern: /^[0-9\s]+$/
  },
  16: {
    value: 16,
    name: 'Hexadecimal',
    label: 'Hexadecimal (Base 16)',
    prefix: '0x',
    description: 'Uses digits 0-9, A-F',
    pattern: /^[0-9A-Fa-f\s]+$/
  }
}

export default function NumberBaseConverterPage() {
  const [fromBase, setFromBase] = useState<NumberBase>(10)
  const [toBase, setToBase] = useState<NumberBase>(16)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [autoConvert, setAutoConvert] = useState(true)
  const [error, setError] = useState('')
  const [totalOperations, setTotalOperations] = useState(0)

  const validateInput = useCallback((value: string, base: NumberBase): boolean => {
    if (!value.trim()) return true
    
    const cleaned = value.trim().replace(/\s/g, '')
    const baseInfo = BASE_INFO[base]
    
    if (!baseInfo.pattern.test(cleaned)) {
      return false
    }
    
    return true
  }, [])

  const convertBase = useCallback((value: string, from: NumberBase, to: NumberBase): string => {
    if (!value.trim()) return ''

    try {
      // Remove whitespace and prefix if present
      let cleaned = value.trim().replace(/\s/g, '')
      
      // Remove common prefixes
      if (cleaned.startsWith('0x') || cleaned.startsWith('0X')) {
        cleaned = cleaned.substring(2)
      } else if (cleaned.startsWith('0b') || cleaned.startsWith('0B')) {
        cleaned = cleaned.substring(2)
      } else if (cleaned.startsWith('0o') || cleaned.startsWith('0O')) {
        cleaned = cleaned.substring(2)
      }

      if (!cleaned) {
        throw new Error('Empty input after removing prefix')
      }

      // Validate input format
      if (!validateInput(cleaned, from)) {
        throw new Error(`Invalid ${BASE_INFO[from].name} number format`)
      }

      // Convert to decimal first
      const decimal = parseInt(cleaned, from)
      
      if (isNaN(decimal)) {
        throw new Error(`Invalid ${BASE_INFO[from].name} number`)
      }

      // Handle negative numbers
      if (decimal < 0) {
        throw new Error('Negative numbers are not supported')
      }

      // Convert from decimal to target base
      if (to === 10) {
        return decimal.toString()
      } else {
        const result = decimal.toString(to).toUpperCase()
        return result
      }
    } catch (e) {
      throw new Error((e as Error).message || 'Conversion failed')
    }
  }, [validateInput])

  const handleConvert = useCallback(() => {
    setError('')
    if (input.trim()) {
      try {
        const result = convertBase(input, fromBase, toBase)
        setOutput(result)
        setTotalOperations(prev => prev + 1)
      } catch (e) {
        setError((e as Error).message || 'Conversion failed')
        setOutput('')
      }
    } else {
      setOutput('')
    }
  }, [input, fromBase, toBase, convertBase])

  // Auto-convert on input change
  useEffect(() => {
    if (autoConvert && input.trim()) {
      const timer = setTimeout(() => {
        handleConvert()
      }, 300)
      return () => clearTimeout(timer)
    } else if (autoConvert && !input.trim()) {
      setOutput('')
      setError('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, fromBase, toBase, autoConvert])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Silent fail
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  const swapBases = () => {
    const temp = fromBase
    setFromBase(toBase)
    setToBase(temp)
    const tempInput = input
    setInput(output)
    setOutput(tempInput)
  }

  const loadExample = (example: 'small' | 'medium' | 'large' | 'hex') => {
    setError('')
    if (example === 'small') {
      setInput('42')
      setFromBase(10)
      setToBase(16)
    } else if (example === 'medium') {
      setInput('255')
      setFromBase(10)
      setToBase(2)
    } else if (example === 'large') {
      setInput('1024')
      setFromBase(10)
      setToBase(16)
    } else if (example === 'hex') {
      setInput('FF')
      setFromBase(16)
      setToBase(10)
    }
  }

  useKeyboardShortcuts({
    onEnter: handleConvert,
    onClear: clearAll
  })

  const commonConversions = [
    { decimal: 0, binary: '0', octal: '0', hex: '0' },
    { decimal: 1, binary: '1', octal: '1', hex: '1' },
    { decimal: 2, binary: '10', octal: '2', hex: '2' },
    { decimal: 8, binary: '1000', octal: '10', hex: '8' },
    { decimal: 10, binary: '1010', octal: '12', hex: 'A' },
    { decimal: 16, binary: '10000', octal: '20', hex: '10' },
    { decimal: 255, binary: '11111111', octal: '377', hex: 'FF' },
    { decimal: 256, binary: '100000000', octal: '400', hex: '100' },
    { decimal: 1024, binary: '10000000000', octal: '2000', hex: '400' },
  ]

  // SEO data
  const toolPath = '/number-base-converter'
  const toolName = 'Number Base Converter'
  const category = 'converter'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is a number base converter?",
      answer: "A number base converter is a tool that converts numbers between different number systems (bases), such as binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16). Each base uses a different set of digits and place values."
    },
    {
      question: "What are the common number bases?",
      answer: "The most common number bases are: Binary (base 2, uses 0-1), Octal (base 8, uses 0-7), Decimal (base 10, uses 0-9), and Hexadecimal (base 16, uses 0-9 and A-F)."
    },
    {
      question: "How do I convert between number bases?",
      answer: "Enter your number in the input field, select the source base (binary, octal, decimal, or hexadecimal), and the converter will automatically show the equivalent in all other bases. The conversion happens in real-time."
    },
    {
      question: "What is hexadecimal used for?",
      answer: "Hexadecimal (base 16) is commonly used in computing and programming because it's a compact way to represent binary data. Each hexadecimal digit represents 4 bits, making it easy to work with binary data."
    },
    {
      question: "Can I convert negative numbers or decimals?",
      answer: "This converter supports positive integers. For negative numbers and decimals, you would need to handle the sign and fractional parts separately, which is more complex."
    },
    {
      question: "Is the number base converter free to use?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All conversions happen in your browser - we never see or store your data."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Enter Your Number",
      text: "Type or paste the number you want to convert in the input field. The number should be valid for the selected source base."
    },
    {
      name: "Select Source Base",
      text: "Choose the number system (base) of your input: Binary (2), Octal (8), Decimal (10), or Hexadecimal (16)."
    },
    {
      name: "View Conversions",
      text: "The converter automatically shows the equivalent number in all other bases (binary, octal, decimal, hexadecimal) in real-time."
    },
    {
      name: "Copy Results",
      text: "Click on any converted value to copy it to your clipboard, or use the copy buttons for each base."
    },
    {
      name: "Use in Your Projects",
      text: "Use the converted values in your programming, computer science, or mathematics projects."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Convert Numbers Between Different Bases",
      "Learn how to convert numbers between binary, octal, decimal, and hexadecimal number systems using our free online converter.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Number Base Converter",
      "Free online number base converter. Convert numbers between binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16). Real-time conversion.",
      "https://prylad.pro/number-base-converter",
      "UtilityApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🔢 Number Base Converter"
        description="Convert numbers between different number systems: binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16). Free online number base converter with real-time conversion."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* Base Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  From Base
                </label>
                <select
                  value={fromBase}
                  onChange={(e) => {
                    setFromBase(Number(e.target.value) as NumberBase)
                    setError('')
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  {Object.values(BASE_INFO).map((base) => (
                    <option key={base.value} value={base.value}>
                      {base.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {BASE_INFO[fromBase].description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  To Base
                </label>
                <select
                  value={toBase}
                  onChange={(e) => {
                    setToBase(Number(e.target.value) as NumberBase)
                    setError('')
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  {Object.values(BASE_INFO).map((base) => (
                    <option key={base.value} value={base.value}>
                      {base.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {BASE_INFO[toBase].description}
                </p>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={swapBases}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
                title="Swap input and output bases"
              >
                ⇄ Swap Bases
              </button>
            </div>

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
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quick Examples:</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => loadExample('small')}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                >
                  42 (Dec → Hex)
                </button>
                <button
                  onClick={() => loadExample('medium')}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                >
                  255 (Dec → Bin)
                </button>
                <button
                  onClick={() => loadExample('large')}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                >
                  1024 (Dec → Hex)
                </button>
                <button
                  onClick={() => loadExample('hex')}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                >
                  FF (Hex → Dec)
                </button>
              </div>
            </div>

            {/* Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Input ({BASE_INFO[fromBase].name})
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(input)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    disabled={!input}
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
              <div className="relative">
                {BASE_INFO[fromBase].prefix && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-mono text-sm">
                    {BASE_INFO[fromBase].prefix}
                  </span>
                )}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    const value = e.target.value
                    // Auto-uppercase for hex
                    const processedValue = fromBase === 16 ? value.toUpperCase() : value
                    setInput(processedValue)
                    setError('')
                  }}
                  placeholder={`Enter ${BASE_INFO[fromBase].name} number...`}
                  className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-lg font-mono ${BASE_INFO[fromBase].prefix ? 'pl-10' : ''}`}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {BASE_INFO[fromBase].description}. Prefix {BASE_INFO[fromBase].prefix || 'none'} is optional.
              </p>
            </div>

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
                  onClick={handleConvert}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Convert
                </button>
              </div>
            )}

            {/* Output */}
            {output && !error && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Output ({BASE_INFO[toBase].name})
                  </label>
                  <button
                    onClick={() => copyToClipboard(output)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Copy Output
                  </button>
                </div>
                <div className="relative">
                  {BASE_INFO[toBase].prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-mono text-sm">
                      {BASE_INFO[toBase].prefix}
                    </span>
                  )}
                  <div className={`bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${BASE_INFO[toBase].prefix ? 'pl-10' : ''}`}>
                    <code className="text-2xl font-mono text-gray-800 dark:text-gray-200">
                      {output}
                    </code>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {BASE_INFO[toBase].description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Common Conversions Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Common Number Conversions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-gray-100">Decimal</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-gray-100">Binary</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-gray-100">Octal</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-gray-100">Hexadecimal</th>
                </tr>
              </thead>
              <tbody>
                {commonConversions.map((conv, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                    onClick={() => {
                      setInput(conv.decimal.toString())
                      setFromBase(10)
                      setToBase(16)
                      setError('')
                    }}
                  >
                    <td className="py-2 px-4 font-mono text-gray-900 dark:text-gray-100">{conv.decimal}</td>
                    <td className="py-2 px-4 font-mono text-gray-700 dark:text-gray-300">{conv.binary}</td>
                    <td className="py-2 px-4 font-mono text-gray-700 dark:text-gray-300">{conv.octal}</td>
                    <td className="py-2 px-4 font-mono text-gray-700 dark:text-gray-300">{conv.hex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is a Number Base?</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            A number base (also called radix) is the number of unique digits, including zero, used to represent numbers in a positional numeral system. 
            The most common number base is 10 (decimal), which we use in everyday life. However, computers and programming languages often use 
            different bases like binary (base 2), octal (base 8), and hexadecimal (base 16).
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Each position in a number represents a power of the base. For example, in decimal (base 10), the number 123 represents 
            (1 × 10²) + (2 × 10¹) + (3 × 10⁰) = 100 + 20 + 3 = 123.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Number Systems Explained</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Binary (Base 2)</h3>
              <p className="text-sm mb-2">Uses only two digits: 0 and 1. This is the fundamental number system used by computers.</p>
              <p className="text-sm"><strong>Example:</strong> <code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">1010</code> in binary = 10 in decimal</p>
              <p className="text-sm"><strong>Prefix:</strong> <code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">0b</code> or <code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">0B</code></p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Octal (Base 8)</h3>
              <p className="text-sm mb-2">Uses digits 0 through 7. Less common but still used in some Unix file permissions.</p>
              <p className="text-sm"><strong>Example:</strong> <code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">755</code> in octal = 493 in decimal</p>
              <p className="text-sm"><strong>Prefix:</strong> <code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">0o</code> or <code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">0O</code></p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Decimal (Base 10)</h3>
              <p className="text-sm mb-2">Uses digits 0 through 9. This is the standard number system we use in daily life.</p>
              <p className="text-sm"><strong>Example:</strong> <code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">42</code> in decimal = 42</p>
              <p className="text-sm"><strong>Prefix:</strong> None</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Hexadecimal (Base 16)</h3>
              <p className="text-sm mb-2">Uses digits 0-9 and letters A-F (or a-f). Very common in programming and web development for colors and memory addresses.</p>
              <p className="text-sm"><strong>Example:</strong> <code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">FF</code> in hexadecimal = 255 in decimal</p>
              <p className="text-sm"><strong>Prefix:</strong> <code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">0x</code> or <code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">0X</code></p>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Programming:</strong> Converting between number bases is essential in programming, especially when working with bitwise operations, memory addresses, or color codes.
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Web Development:</strong> Hexadecimal is commonly used for CSS color codes (e.g., #FF5733 for colors).
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Computer Science:</strong> Understanding binary is fundamental to understanding how computers work at the lowest level.
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">File Permissions:</strong> Unix/Linux file permissions are often represented in octal (e.g., 755, 644).
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Debugging:</strong> When debugging programs, you may need to convert between bases to understand memory dumps or error codes.
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Networking:</strong> IP addresses and network configurations sometimes use different number bases.
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Conversion Examples</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Decimal to Binary</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">To convert 42 from decimal to binary:</p>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto"><code>{`42 ÷ 2 = 21 remainder 0
21 ÷ 2 = 10 remainder 1
10 ÷ 2 = 5 remainder 0
5 ÷ 2 = 2 remainder 1
2 ÷ 2 = 1 remainder 0
1 ÷ 2 = 0 remainder 1

Reading remainders from bottom to top: 101010
So 42 (decimal) = 101010 (binary)`}</code></pre>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Binary to Hexadecimal</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">To convert 101010 from binary to hexadecimal:</p>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto"><code>{`Group binary digits into groups of 4 from right:
101010 → 0010 1010

Convert each group:
0010 = 2 (decimal) = 2 (hex)
1010 = 10 (decimal) = A (hex)

So 101010 (binary) = 2A (hexadecimal)`}</code></pre>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Hexadecimal to Decimal</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">To convert FF from hexadecimal to decimal:</p>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto"><code>{`F = 15 (decimal)
FF = (15 × 16¹) + (15 × 16⁰)
   = (15 × 16) + (15 × 1)
   = 240 + 15
   = 255

So FF (hexadecimal) = 255 (decimal)`}</code></pre>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Tips for Using Number Base Converter</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Prefixes:</strong> You can include prefixes (0x, 0b, 0o) in your input, or omit them. The converter will automatically detect and handle them.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Case Sensitivity:</strong> Hexadecimal letters (A-F) are case-insensitive. The converter will automatically uppercase the output.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Whitespace:</strong> Spaces in your input will be automatically removed during conversion.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Validation:</strong> The converter validates input according to the selected base to ensure accurate conversions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Real-time:</strong> Enable auto-convert for instant conversion as you type, or disable it for manual control.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Swap:</strong> Use the swap button to quickly exchange the input and output bases.</span>
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

