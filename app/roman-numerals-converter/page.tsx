'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type ConversionMode = 'number-to-roman' | 'roman-to-number'

interface RomanNumeral {
  value: number
  numeral: string
}

const ROMAN_NUMERALS: RomanNumeral[] = [
  { value: 1000, numeral: 'M' },
  { value: 900, numeral: 'CM' },
  { value: 500, numeral: 'D' },
  { value: 400, numeral: 'CD' },
  { value: 100, numeral: 'C' },
  { value: 90, numeral: 'XC' },
  { value: 50, numeral: 'L' },
  { value: 40, numeral: 'XL' },
  { value: 10, numeral: 'X' },
  { value: 9, numeral: 'IX' },
  { value: 5, numeral: 'V' },
  { value: 4, numeral: 'IV' },
  { value: 1, numeral: 'I' },
]

export default function RomanNumeralsConverterPage() {
  const [mode, setMode] = useState<ConversionMode>('number-to-roman')
  const [number, setNumber] = useState('')
  const [roman, setRoman] = useState('')
  const [autoConvert, setAutoConvert] = useState(true)
  const [error, setError] = useState('')
  const [totalOperations, setTotalOperations] = useState(0)

  const numberToRoman = useCallback((num: number): string => {
    if (num === 0) return ''
    if (num < 0) throw new Error('Roman numerals cannot represent negative numbers')
    if (num > 3999) throw new Error('Roman numerals cannot represent numbers greater than 3999')
    if (!Number.isInteger(num)) throw new Error('Roman numerals can only represent integers')

    let result = ''
    let remaining = num

    for (const { value, numeral } of ROMAN_NUMERALS) {
      const count = Math.floor(remaining / value)
      if (count > 0) {
        result += numeral.repeat(count)
        remaining -= value * count
      }
    }

    return result
  }, [])

  const romanToNumber = useCallback((romanStr: string): number => {
    if (!romanStr.trim()) return 0

    const cleaned = romanStr.trim().toUpperCase()
    
    // Validate Roman numeral format
    if (!/^[IVXLCDM]+$/.test(cleaned)) {
      throw new Error('Invalid Roman numeral characters. Only I, V, X, L, C, D, M are allowed.')
    }

    // Check for invalid patterns
    const invalidPatterns = [
      /IIII/,  // 4 I's in a row
      /VV/,    // 2 V's
      /XXXX/,  // 4 X's
      /LL/,    // 2 L's
      /CCCC/,  // 4 C's
      /DD/,    // 2 D's
      /MMMM/,  // 4 M's (though technically 4000+ is possible, we limit to 3999)
    ]

    for (const pattern of invalidPatterns) {
      if (pattern.test(cleaned)) {
        throw new Error('Invalid Roman numeral pattern detected')
      }
    }

    let result = 0
    let i = 0

    while (i < cleaned.length) {
      // Check for two-character numerals first (subtractive notation)
      if (i < cleaned.length - 1) {
        const twoChar = cleaned.substring(i, i + 2)
        const twoCharValue = ROMAN_NUMERALS.find(r => r.numeral === twoChar)
        
        if (twoCharValue) {
          result += twoCharValue.value
          i += 2
          continue
        }
      }

      // Single character numeral
      const oneChar = cleaned[i]
      const oneCharValue = ROMAN_NUMERALS.find(r => r.numeral === oneChar)
      
      if (oneCharValue) {
        result += oneCharValue.value
        i += 1
      } else {
        throw new Error(`Invalid character: ${oneChar}`)
      }
    }

    // Validate the result by converting back
    const validation = numberToRoman(result)
    if (validation !== cleaned) {
      throw new Error('Invalid Roman numeral format')
    }

    return result
  }, [numberToRoman])

  const convertNumberToRoman = useCallback(() => {
    setError('')
    if (number.trim()) {
      try {
        const num = parseInt(number.trim(), 10)
        if (isNaN(num)) {
          throw new Error('Please enter a valid number')
        }
        const result = numberToRoman(num)
        setRoman(result)
        setTotalOperations(prev => prev + 1)
      } catch (e) {
        setError((e as Error).message || 'Conversion failed')
        setRoman('')
      }
    } else {
      setRoman('')
    }
  }, [number, numberToRoman])

  const convertRomanToNumber = useCallback(() => {
    setError('')
    if (roman.trim()) {
      try {
        const result = romanToNumber(roman)
        setNumber(result.toString())
        setTotalOperations(prev => prev + 1)
      } catch (e) {
        setError((e as Error).message || 'Conversion failed')
        setNumber('')
      }
    } else {
      setNumber('')
    }
  }, [roman, romanToNumber])

  // Auto-convert on number change
  useEffect(() => {
    if (autoConvert && mode === 'number-to-roman' && number.trim()) {
      const timer = setTimeout(() => {
        convertNumberToRoman()
      }, 300)
      return () => clearTimeout(timer)
    } else if (autoConvert && mode === 'number-to-roman' && !number.trim()) {
      setRoman('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number, autoConvert, mode])

  // Auto-convert on roman change
  useEffect(() => {
    if (autoConvert && mode === 'roman-to-number' && roman.trim()) {
      const timer = setTimeout(() => {
        convertRomanToNumber()
      }, 300)
      return () => clearTimeout(timer)
    } else if (autoConvert && mode === 'roman-to-number' && !roman.trim()) {
      setNumber('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roman, autoConvert, mode])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Silent fail
    }
  }

  const clearAll = () => {
    setNumber('')
    setRoman('')
    setError('')
  }

  const loadExample = (example: 'common' | 'year' | 'large') => {
    setError('')
    if (example === 'common') {
      setNumber('42')
      setMode('number-to-roman')
    } else if (example === 'year') {
      setNumber('2024')
      setMode('number-to-roman')
    } else if (example === 'large') {
      setNumber('1999')
      setMode('number-to-roman')
    }
  }

  useKeyboardShortcuts({
    onEnter: mode === 'number-to-roman' ? convertNumberToRoman : convertRomanToNumber,
    onClear: clearAll
  })

  const commonExamples = [
    { number: 1, roman: 'I' },
    { number: 4, roman: 'IV' },
    { number: 5, roman: 'V' },
    { number: 9, roman: 'IX' },
    { number: 10, roman: 'X' },
    { number: 40, roman: 'XL' },
    { number: 50, roman: 'L' },
    { number: 90, roman: 'XC' },
    { number: 100, roman: 'C' },
    { number: 400, roman: 'CD' },
    { number: 500, roman: 'D' },
    { number: 900, roman: 'CM' },
    { number: 1000, roman: 'M' },
    { number: 1984, roman: 'MCMLXXXIV' },
    { number: 2024, roman: 'MMXXIV' },
  ]

  // SEO data
  const toolPath = '/roman-numerals-converter'
  const toolName = 'Roman Numerals Converter'
  const category = 'converter'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "How do I convert a number to Roman numerals?",
      answer: "Enter any number from 1 to 3999 in the input field. The converter will automatically convert it to the correct Roman numeral representation. For example, 2024 becomes MMXXIV."
    },
    {
      question: "What is the maximum number I can convert to Roman numerals?",
      answer: "The standard Roman numeral system supports numbers from 1 to 3999. Numbers greater than 3999 require special notation (using a bar over numerals), which is not commonly used."
    },
    {
      question: "How do I convert Roman numerals back to numbers?",
      answer: "Switch to 'Roman → Number' mode and enter valid Roman numerals (I, V, X, L, C, D, M). The converter will automatically convert them to their Arabic number equivalent."
    },
    {
      question: "What are the basic Roman numeral symbols?",
      answer: "The basic symbols are: I (1), V (5), X (10), L (50), C (100), D (500), and M (1000). Combinations and subtractive notation (like IV for 4, IX for 9) are also used."
    },
    {
      question: "Can Roman numerals represent zero or negative numbers?",
      answer: "No, the Roman numeral system has no symbol for zero and cannot represent negative numbers. The converter will show an error if you try to convert zero or negative numbers."
    },
    {
      question: "Is the Roman numerals converter free to use?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All conversions happen in your browser - we never see or store your data."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Select Conversion Mode",
      text: "Choose 'Number → Roman' to convert Arabic numbers to Roman numerals, or 'Roman → Number' to convert Roman numerals to numbers."
    },
    {
      name: "Enter Your Number or Roman Numeral",
      text: "Type or paste your number (1-3999) or Roman numeral in the input field. The conversion happens automatically in real-time."
    },
    {
      name: "View Results",
      text: "See the converted result displayed immediately. For number to Roman conversion, you'll see the Roman numeral. For Roman to number, you'll see the Arabic number."
    },
    {
      name: "Check Validation",
      text: "The converter validates your input and shows errors if the number is out of range (must be 1-3999) or if the Roman numeral is invalid."
    },
    {
      name: "Copy and Use",
      text: "Click 'Copy' to copy the converted result to your clipboard for use in documents, projects, or educational purposes."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Convert Numbers to Roman Numerals and Vice Versa",
      "Learn how to convert Arabic numbers to Roman numerals and Roman numerals back to numbers using our free online converter.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Roman Numerals Converter",
      "Free online Roman numerals converter. Convert numbers 1-3999 to Roman numerals and Roman numerals to numbers. Real-time conversion with validation.",
      "https://prylad.pro/roman-numerals-converter",
      "UtilityApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🔢 Roman Numerals Converter"
        description="Convert Arabic numbers to Roman numerals and Roman numerals to numbers online for free. Support for numbers 1-3999. Real-time conversion. No registration required."
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
                    setMode('number-to-roman')
                    setError('')
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'number-to-roman'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Number → Roman
                </button>
                <button
                  onClick={() => {
                    setMode('roman-to-number')
                    setError('')
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'roman-to-number'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Roman → Number
                </button>
              </div>
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
            {mode === 'number-to-roman' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quick Examples:</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => loadExample('common')}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                  >
                    42
                  </button>
                  <button
                    onClick={() => loadExample('year')}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                  >
                    2024
                  </button>
                  <button
                    onClick={() => loadExample('large')}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                  >
                    1999
                  </button>
                </div>
              </div>
            )}

            {/* Number Input */}
            {mode === 'number-to-roman' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Arabic Number (1-3999)
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(number)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      disabled={!number}
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
                <input
                  type="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Enter a number (e.g., 42, 2024, 1999)..."
                  min="1"
                  max="3999"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-lg font-mono"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter a number between 1 and 3999
                </p>
              </div>
            )}

            {/* Roman Input */}
            {mode === 'roman-to-number' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Roman Numeral
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(roman)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      disabled={!roman.trim()}
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
                <input
                  type="text"
                  value={roman}
                  onChange={(e) => setRoman(e.target.value.toUpperCase())}
                  placeholder="Enter Roman numeral (e.g., IV, XLII, MMXXIV)..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-lg font-mono uppercase"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Use letters: I, V, X, L, C, D, M (case-insensitive)
                </p>
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
                  onClick={mode === 'number-to-roman' ? convertNumberToRoman : convertRomanToNumber}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  {mode === 'number-to-roman' ? 'Convert to Roman' : 'Convert to Number'}
                </button>
              </div>
            )}

            {/* Result */}
            {mode === 'number-to-roman' && roman && !error && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Roman Numeral
                  </label>
                  <button
                    onClick={() => copyToClipboard(roman)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Copy Roman
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <code className="text-2xl font-mono text-gray-800 dark:text-gray-200">
                    {roman}
                  </code>
                </div>
              </div>
            )}

            {/* Number Result */}
            {mode === 'roman-to-number' && number && !error && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Arabic Number
                  </label>
                  <button
                    onClick={() => copyToClipboard(number)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Copy Number
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <code className="text-2xl font-mono text-gray-800 dark:text-gray-200">
                    {number}
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Common Examples Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Common Roman Numerals</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {commonExamples.map((example) => (
              <div
                key={example.number}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  setNumber(example.number.toString())
                  setMode('number-to-roman')
                  setError('')
                }}
              >
                <div className="text-sm text-gray-600 dark:text-gray-400">{example.number}</div>
                <div className="text-lg font-mono text-gray-900 dark:text-gray-100 mt-1">{example.roman}</div>
              </div>
            ))}
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What are Roman Numerals?</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Roman numerals are a numeral system that originated in ancient Rome and remained the usual way of writing numbers 
            throughout Europe well into the Late Middle Ages. They use combinations of letters from the Latin alphabet to represent values.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Unlike Arabic numerals (1, 2, 3...), Roman numerals use letters: <strong>I</strong>, <strong>V</strong>, <strong>X</strong>, 
            <strong>L</strong>, <strong>C</strong>, <strong>D</strong>, and <strong>M</strong>. Each letter has a specific value, and numbers 
            are formed by combining these letters according to specific rules.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Roman Numeral Symbols</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic Symbols</h3>
              <ul className="space-y-1">
                <li><code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">I</code> = 1</li>
                <li><code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">V</code> = 5</li>
                <li><code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">X</code> = 10</li>
                <li><code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">L</code> = 50</li>
                <li><code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">C</code> = 100</li>
                <li><code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">D</code> = 500</li>
                <li><code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">M</code> = 1000</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Subtractive Notation</h3>
              <ul className="space-y-1">
                <li><code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">IV</code> = 4 (5 - 1)</li>
                <li><code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">IX</code> = 9 (10 - 1)</li>
                <li><code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">XL</code> = 40 (50 - 10)</li>
                <li><code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">XC</code> = 90 (100 - 10)</li>
                <li><code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">CD</code> = 400 (500 - 100)</li>
                <li><code className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded">CM</code> = 900 (1000 - 100)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Rules for Roman Numerals</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">1.</span>
              <span className="text-sm"><strong>Repetition:</strong> A letter can be repeated up to 3 times. For example, III = 3, XXX = 30, CCC = 300.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">2.</span>
              <span className="text-sm"><strong>Subtraction:</strong> When a smaller letter appears before a larger letter, subtract the smaller from the larger. IV = 4, IX = 9, XL = 40.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">3.</span>
              <span className="text-sm"><strong>Addition:</strong> When a smaller letter appears after a larger letter, add them together. VI = 6, XI = 11, LX = 60.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">4.</span>
              <span className="text-sm"><strong>Order:</strong> Letters are written from largest to smallest value, except when using subtractive notation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">5.</span>
              <span className="text-sm"><strong>Limitations:</strong> Traditional Roman numerals only go up to 3999 (MMMCMXCIX). Higher numbers require special notation.</span>
            </li>
          </ul>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Years:</strong> Roman numerals are often used to represent years, especially in copyright notices (e.g., © MMXXIV for 2024).
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Monuments and Buildings:</strong> Many historical buildings and monuments display dates in Roman numerals.
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Book Chapters:</strong> Some books use Roman numerals for chapter numbers, especially in academic and classical literature.
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Clock Faces:</strong> Traditional clock faces often use Roman numerals for the hours.
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Movie Credits:</strong> Production years in movie credits are sometimes displayed in Roman numerals.
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Numbering Systems:</strong> Used in outlines, lists, and hierarchical numbering systems.
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Examples</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Simple Numbers</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>1 = I</div>
                <div>5 = V</div>
                <div>10 = X</div>
                <div>50 = L</div>
                <div>100 = C</div>
                <div>500 = D</div>
                <div>1000 = M</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Subtractive Notation</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>4 = IV</div>
                <div>9 = IX</div>
                <div>40 = XL</div>
                <div>90 = XC</div>
                <div>400 = CD</div>
                <div>900 = CM</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Complex Numbers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>42 = XLII</div>
                <div>1984 = MCMLXXXIV</div>
                <div>2024 = MMXXIV</div>
                <div>3999 = MMMCMXCIX</div>
              </div>
            </div>
          </div>
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

