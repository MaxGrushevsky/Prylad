'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type TemperatureUnit = 'celsius' | 'fahrenheit' | 'kelvin'

interface TemperatureValues {
  celsius: number | null
  fahrenheit: number | null
  kelvin: number | null
}

const examples = [
  { name: 'Freezing Point', celsius: 0, fahrenheit: 32, kelvin: 273.15 },
  { name: 'Room Temperature', celsius: 20, fahrenheit: 68, kelvin: 293.15 },
  { name: 'Body Temperature', celsius: 37, fahrenheit: 98.6, kelvin: 310.15 },
  { name: 'Boiling Point', celsius: 100, fahrenheit: 212, kelvin: 373.15 },
  { name: 'Absolute Zero', celsius: -273.15, fahrenheit: -459.67, kelvin: 0 },
]

export default function TemperatureConverterPage() {
  const [values, setValues] = useState<TemperatureValues>({
    celsius: null,
    fahrenheit: null,
    kelvin: null,
  })
  const [lastEdited, setLastEdited] = useState<TemperatureUnit | null>(null)
  const [autoConvert, setAutoConvert] = useState(true)
  const [totalConversions, setTotalConversions] = useState(0)

  // SEO data
  const toolPath = '/temperature-converter'
  const toolName = 'Temperature Converter'
  const category = 'converters'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "How do I convert Celsius to Fahrenheit?",
      answer: "To convert Celsius to Fahrenheit, use the formula: F = (C × 9/5) + 32. For example, 0°C equals 32°F, and 100°C equals 212°F. Our tool automatically performs this conversion when you enter a Celsius value."
    },
    {
      question: "How do I convert Fahrenheit to Celsius?",
      answer: "To convert Fahrenheit to Celsius, use the formula: C = (F - 32) × 5/9. For example, 32°F equals 0°C, and 212°F equals 100°C. Our tool automatically performs this conversion when you enter a Fahrenheit value."
    },
    {
      question: "What is Kelvin and how is it different?",
      answer: "Kelvin is the SI base unit for temperature, starting from absolute zero (-273.15°C). Unlike Celsius and Fahrenheit, Kelvin has no negative values. To convert Celsius to Kelvin, add 273.15. Kelvin is commonly used in scientific calculations."
    },
    {
      question: "What is absolute zero?",
      answer: "Absolute zero is the lowest possible temperature, at -273.15°C, -459.67°F, or 0K. At this temperature, all molecular motion stops. It's a theoretical limit that cannot be reached in practice."
    },
    {
      question: "Is the temperature converter free to use?",
      answer: "Yes, absolutely! Our temperature converter is completely free to use. There are no hidden fees, subscriptions, or usage limits. You can convert temperatures as much as you need."
    },
    {
      question: "Do you store my temperature conversions?",
      answer: "No, absolutely not. All temperature conversions happen entirely in your browser. We never see, store, transmit, or have any access to your data. Your privacy is completely protected."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Enter Temperature",
      text: "Type a temperature value in any of the three input fields: Celsius, Fahrenheit, or Kelvin."
    },
    {
      name: "Automatic Conversion",
      text: "The tool automatically converts your input to the other two temperature scales in real-time."
    },
    {
      name: "Use Examples (Optional)",
      text: "Click on example temperatures like 'Freezing Point' or 'Boiling Point' to see common temperature conversions."
    },
    {
      name: "View All Scales",
      text: "See the equivalent temperature in all three scales (Celsius, Fahrenheit, Kelvin) simultaneously."
    },
    {
      name: "Copy Results",
      text: "Copy any of the converted values to your clipboard for use in your projects or calculations."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Convert Temperature Between Celsius, Fahrenheit, and Kelvin",
      "Learn how to convert temperatures between Celsius, Fahrenheit, and Kelvin using our free online temperature converter tool.",
      howToSteps,
      "PT1M"
    ),
    generateSoftwareApplicationSchema(
      "Temperature Converter",
      "Free online temperature converter. Convert between Celsius, Fahrenheit, and Kelvin with instant real-time conversion.",
      "https://prylad.pro/temperature-converter",
      "UtilityApplication"
    )
  ]

  const convertTemperature = useCallback((
    value: number,
    from: TemperatureUnit
  ): TemperatureValues => {
    let celsius: number
    let fahrenheit: number
    let kelvin: number

    // Convert to Celsius first
    switch (from) {
      case 'celsius':
        celsius = value
        break
      case 'fahrenheit':
        celsius = (value - 32) * (5 / 9)
        break
      case 'kelvin':
        celsius = value - 273.15
        break
    }

    // Convert from Celsius to other units
    fahrenheit = (celsius * 9 / 5) + 32
    kelvin = celsius + 273.15

    return {
      celsius: Math.round(celsius * 100) / 100,
      fahrenheit: Math.round(fahrenheit * 100) / 100,
      kelvin: Math.round(kelvin * 100) / 100,
    }
  }, [])

  const handleInputChange = useCallback((
    value: string,
    unit: TemperatureUnit
  ) => {
    const numValue = value === '' ? null : parseFloat(value)
    
    if (value === '') {
      setValues({ celsius: null, fahrenheit: null, kelvin: null })
      setLastEdited(null)
      return
    }

    if (isNaN(numValue!)) {
      return
    }

    setLastEdited(unit)
    
    if (autoConvert) {
      const converted = convertTemperature(numValue!, unit)
      setValues(converted)
      setTotalConversions(prev => prev + 1)
    } else {
      setValues(prev => ({ ...prev, [unit]: numValue }))
    }
  }, [autoConvert, convertTemperature])

  const applyExample = (example: typeof examples[0]) => {
    setValues({
      celsius: example.celsius,
      fahrenheit: example.fahrenheit,
      kelvin: example.kelvin,
    })
    setLastEdited(null)
    setTotalConversions(prev => prev + 1)
  }

  const clearAll = () => {
    setValues({ celsius: null, fahrenheit: null, kelvin: null })
    setLastEdited(null)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Failed to copy
    }
  }

  return (
    <Layout
      title="🌡️ Temperature Converter - Celsius, Fahrenheit, Kelvin"
      description="Convert temperature between Celsius, Fahrenheit, and Kelvin. Free online temperature converter with instant results."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Main Tool */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            {/* Auto Convert Toggle */}
            <div className="flex items-center justify-between">
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
              <button
                onClick={clearAll}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear All
              </button>
            </div>

            {/* Temperature Inputs */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Celsius */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <label className="block text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Celsius (°C)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={values.celsius ?? ''}
                    onChange={(e) => handleInputChange(e.target.value, 'celsius')}
                    placeholder="0"
                    className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-lg"
                  />
                  {values.celsius !== null && (
                    <button
                      onClick={() => copyToClipboard(values.celsius!.toString())}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Copy
                    </button>
                  )}
                </div>
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  {values.celsius !== null && (
                    <span>{values.celsius}°C</span>
                  )}
                </div>
              </div>

              {/* Fahrenheit */}
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                <label className="block text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                  Fahrenheit (°F)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={values.fahrenheit ?? ''}
                    onChange={(e) => handleInputChange(e.target.value, 'fahrenheit')}
                    placeholder="32"
                    className="w-full px-4 py-3 border-2 border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-lg"
                  />
                  {values.fahrenheit !== null && (
                    <button
                      onClick={() => copyToClipboard(values.fahrenheit!.toString())}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Copy
                    </button>
                  )}
                </div>
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                  {values.fahrenheit !== null && (
                    <span>{values.fahrenheit}°F</span>
                  )}
                </div>
              </div>

              {/* Kelvin */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <label className="block text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Kelvin (K)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={values.kelvin ?? ''}
                    onChange={(e) => handleInputChange(e.target.value, 'kelvin')}
                    placeholder="273.15"
                    className="w-full px-4 py-3 border-2 border-purple-300 dark:border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-lg"
                  />
                  {values.kelvin !== null && (
                    <button
                      onClick={() => copyToClipboard(values.kelvin!.toString())}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      Copy
                    </button>
                  )}
                </div>
                <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                  {values.kelvin !== null && (
                    <span>{values.kelvin} K</span>
                  )}
                </div>
              </div>
            </div>

            {/* Convert Button */}
            {!autoConvert && (values.celsius !== null || values.fahrenheit !== null || values.kelvin !== null) && (
              <button
                onClick={() => {
                  if (lastEdited) {
                    const value = values[lastEdited]
                    if (value !== null) {
                      const converted = convertTemperature(value, lastEdited)
                      setValues(converted)
                      setTotalConversions(prev => prev + 1)
                    }
                  }
                }}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
              >
                Convert
              </button>
            )}

            {/* Statistics */}
            {totalConversions > 0 && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Conversions: {totalConversions}
              </div>
            )}

            {/* Examples */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Quick Examples:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => applyExample(example)}
                    className="px-3 py-2 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {example.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {example.celsius}°C
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reference Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Temperature Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-gray-700 dark:text-gray-300">Description</th>
                  <th className="text-right py-2 px-3 text-gray-700 dark:text-gray-300">Celsius</th>
                  <th className="text-right py-2 px-3 text-gray-700 dark:text-gray-300">Fahrenheit</th>
                  <th className="text-right py-2 px-3 text-gray-700 dark:text-gray-300">Kelvin</th>
                </tr>
              </thead>
              <tbody>
                {examples.map((example, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-3 text-gray-900 dark:text-gray-100">{example.name}</td>
                    <td className="py-2 px-3 text-right font-mono text-gray-700 dark:text-gray-300">{example.celsius}°C</td>
                    <td className="py-2 px-3 text-right font-mono text-gray-700 dark:text-gray-300">{example.fahrenheit}°F</td>
                    <td className="py-2 px-3 text-right font-mono text-gray-700 dark:text-gray-300">{example.kelvin} K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Temperature Conversion Formulas</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Celsius to Fahrenheit</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  °F = (°C × 9/5) + 32
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  Example: 25°C = (25 × 9/5) + 32 = 77°F
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Fahrenheit to Celsius</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  °C = (°F - 32) × 5/9
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  Example: 77°F = (77 - 32) × 5/9 = 25°C
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Celsius to Kelvin</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  K = °C + 273.15
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  Example: 25°C = 25 + 273.15 = 298.15 K
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Kelvin to Celsius</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-mono bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  °C = K - 273.15
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  Example: 298.15 K = 298.15 - 273.15 = 25°C
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use Our Temperature Converter</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li><strong>Enter Temperature:</strong> Type a temperature value in any of the three fields (Celsius, Fahrenheit, or Kelvin).</li>
                <li><strong>Auto-Conversion:</strong> With auto-convert enabled, the other two fields will update automatically as you type.</li>
                <li><strong>Manual Conversion:</strong> Disable auto-convert and click the &quot;Convert&quot; button to convert manually.</li>
                <li><strong>Use Examples:</strong> Click on any example to quickly fill in common temperature values.</li>
                <li><strong>Copy Results:</strong> Click the copy button next to any temperature value to copy it to your clipboard.</li>
              </ol>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Temperature Scales Explained</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Celsius (°C)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  The Celsius scale is used in most of the world. Water freezes at 0°C and boils at 100°C at standard atmospheric pressure. 
                  Named after Swedish astronomer Anders Celsius.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Fahrenheit (°F)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  The Fahrenheit scale is primarily used in the United States. Water freezes at 32°F and boils at 212°F at standard atmospheric pressure. 
                  Named after German physicist Daniel Gabriel Fahrenheit.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Kelvin (K)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  The Kelvin scale is the SI base unit for temperature and is used in scientific applications. Absolute zero (0 K) is the lowest possible temperature. 
                  Water freezes at 273.15 K and boils at 373.15 K. Named after Scottish physicist William Thomson, 1st Baron Kelvin.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🌡️ Weather</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert weather temperatures between Celsius (used internationally) and Fahrenheit (used in the US). 
                  Essential for understanding weather forecasts when traveling.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">👨‍🍳 Cooking</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert oven temperatures between Celsius and Fahrenheit when following recipes from different countries. 
                  Critical for baking and cooking accuracy.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔬 Science & Education</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert temperatures for scientific calculations, experiments, and educational purposes. 
                  Kelvin is essential for physics and chemistry calculations.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🏭 Engineering</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert temperatures for engineering applications, manufacturing processes, and technical specifications. 
                  Important for international collaboration.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What is absolute zero?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Absolute zero is 0 Kelvin (-273.15°C or -459.67°F), the theoretical lowest possible temperature where 
                  all molecular motion stops. It&apos;s impossible to reach absolute zero, but scientists have come very close.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Why is Kelvin used in science?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Kelvin is an absolute temperature scale starting from absolute zero, making it ideal for scientific calculations. 
                  It doesn&apos;t have negative values and is directly proportional to the energy of particles.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the difference between Celsius and Fahrenheit?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  The main difference is the freezing and boiling points of water: 0°C/100°C vs 32°F/212°F. 
                  Celsius uses a 100-degree scale between these points, while Fahrenheit uses a 180-degree scale. 
                  Celsius is more intuitive for scientific use, while Fahrenheit provides finer granularity for weather.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How accurate are the conversions?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our converter uses precise formulas and rounds results to 2 decimal places for readability. 
                  The calculations are mathematically accurate and suitable for most practical purposes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Is my data stored or transmitted?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, all conversions happen entirely in your browser. We never see, store, or transmit any of your temperature values. 
                  Your privacy is completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Converter Tools" />
      )}
    </Layout>
  )
}

