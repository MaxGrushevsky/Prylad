'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type UnitCategory = 'length' | 'weight' | 'volume' | 'area' | 'time'

interface Unit {
  name: string
  symbol: string
  toBase: number // Conversion factor to base unit
}

const units: Record<UnitCategory, Unit[]> = {
  length: [
    { name: 'Meter', symbol: 'm', toBase: 1 },
    { name: 'Kilometer', symbol: 'km', toBase: 1000 },
    { name: 'Centimeter', symbol: 'cm', toBase: 0.01 },
    { name: 'Millimeter', symbol: 'mm', toBase: 0.001 },
    { name: 'Mile', symbol: 'mi', toBase: 1609.344 },
    { name: 'Yard', symbol: 'yd', toBase: 0.9144 },
    { name: 'Foot', symbol: 'ft', toBase: 0.3048 },
    { name: 'Inch', symbol: 'in', toBase: 0.0254 },
    { name: 'Nautical Mile', symbol: 'nmi', toBase: 1852 },
  ],
  weight: [
    { name: 'Kilogram', symbol: 'kg', toBase: 1 },
    { name: 'Gram', symbol: 'g', toBase: 0.001 },
    { name: 'Milligram', symbol: 'mg', toBase: 0.000001 },
    { name: 'Metric Ton', symbol: 't', toBase: 1000 },
    { name: 'Pound', symbol: 'lb', toBase: 0.453592 },
    { name: 'Ounce', symbol: 'oz', toBase: 0.0283495 },
    { name: 'Stone', symbol: 'st', toBase: 6.35029 },
    { name: 'US Ton', symbol: 'US ton', toBase: 907.185 },
  ],
  volume: [
    { name: 'Liter', symbol: 'L', toBase: 1 },
    { name: 'Milliliter', symbol: 'mL', toBase: 0.001 },
    { name: 'Cubic Meter', symbol: 'm³', toBase: 1000 },
    { name: 'Gallon (US)', symbol: 'gal (US)', toBase: 3.78541 },
    { name: 'Quart (US)', symbol: 'qt (US)', toBase: 0.946353 },
    { name: 'Pint (US)', symbol: 'pt (US)', toBase: 0.473176 },
    { name: 'Cup (US)', symbol: 'cup (US)', toBase: 0.236588 },
    { name: 'Fluid Ounce (US)', symbol: 'fl oz (US)', toBase: 0.0295735 },
    { name: 'Gallon (UK)', symbol: 'gal (UK)', toBase: 4.54609 },
  ],
  area: [
    { name: 'Square Meter', symbol: 'm²', toBase: 1 },
    { name: 'Square Kilometer', symbol: 'km²', toBase: 1000000 },
    { name: 'Square Centimeter', symbol: 'cm²', toBase: 0.0001 },
    { name: 'Hectare', symbol: 'ha', toBase: 10000 },
    { name: 'Acre', symbol: 'ac', toBase: 4046.86 },
    { name: 'Square Mile', symbol: 'mi²', toBase: 2589988 },
    { name: 'Square Yard', symbol: 'yd²', toBase: 0.836127 },
    { name: 'Square Foot', symbol: 'ft²', toBase: 0.092903 },
    { name: 'Square Inch', symbol: 'in²', toBase: 0.00064516 },
  ],
  time: [
    { name: 'Second', symbol: 's', toBase: 1 },
    { name: 'Minute', symbol: 'min', toBase: 60 },
    { name: 'Hour', symbol: 'h', toBase: 3600 },
    { name: 'Day', symbol: 'd', toBase: 86400 },
    { name: 'Week', symbol: 'wk', toBase: 604800 },
    { name: 'Month', symbol: 'mo', toBase: 2629746 }, // Average month
    { name: 'Year', symbol: 'yr', toBase: 31556952 }, // Average year
  ],
}

const categoryExamples: Record<UnitCategory, { value: number; from: string; to: string }[]> = {
  length: [
    { value: 1, from: 'Meter', to: 'Foot' },
    { value: 100, from: 'Kilometer', to: 'Mile' },
    { value: 5, from: 'Foot', to: 'Meter' },
  ],
  weight: [
    { value: 1, from: 'Kilogram', to: 'Pound' },
    { value: 100, from: 'Gram', to: 'Ounce' },
    { value: 10, from: 'Pound', to: 'Kilogram' },
  ],
  volume: [
    { value: 1, from: 'Liter', to: 'Gallon (US)' },
    { value: 5, from: 'Gallon (US)', to: 'Liter' },
    { value: 500, from: 'Milliliter', to: 'Cup (US)' },
  ],
  area: [
    { value: 1, from: 'Square Meter', to: 'Square Foot' },
    { value: 1, from: 'Acre', to: 'Hectare' },
    { value: 100, from: 'Square Foot', to: 'Square Meter' },
  ],
  time: [
    { value: 1, from: 'Hour', to: 'Minute' },
    { value: 1, from: 'Day', to: 'Hour' },
    { value: 60, from: 'Second', to: 'Minute' },
  ],
}

export default function UnitConverterPage() {
  const [category, setCategory] = useState<UnitCategory>('length')
  const [fromUnit, setFromUnit] = useState('Meter')
  const [toUnit, setToUnit] = useState('Foot')
  const [fromValue, setFromValue] = useState('1')
  const [toValue, setToValue] = useState('')
  const [autoConvert, setAutoConvert] = useState(true)
  const [totalConversions, setTotalConversions] = useState(0)

  // SEO data
  const toolPath = '/unit-converter'
  const toolName = 'Unit Converter'
  const seoCategory = 'converters'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, seoCategory)
  const relatedTools = getRelatedTools(toolPath, seoCategory, 6)

  // FAQ data
  const faqs = [
    {
      question: "What units can I convert?",
      answer: "Our unit converter supports five categories: Length (meters, feet, miles, etc.), Weight (kilograms, pounds, ounces, etc.), Volume (liters, gallons, cups, etc.), Area (square meters, acres, square feet, etc.), and Time (seconds, minutes, hours, etc.)."
    },
    {
      question: "How accurate are the conversions?",
      answer: "Our conversions use standard conversion factors and are accurate to the precision displayed. For most practical purposes, the conversions are exact. Scientific calculations may require additional precision."
    },
    {
      question: "Can I convert between metric and imperial units?",
      answer: "Yes! Our converter supports both metric (SI) and imperial units. You can easily convert between systems, for example, from meters to feet, or from kilograms to pounds."
    },
    {
      question: "What is the difference between metric and imperial units?",
      answer: "Metric units (SI) are based on powers of 10 and are used worldwide. Imperial units (used in the US and UK) have different conversion factors. For example, 1 meter = 3.28084 feet, and 1 kilogram = 2.20462 pounds."
    },
    {
      question: "Is the unit converter free to use?",
      answer: "Yes, absolutely! Our unit converter is completely free to use. There are no hidden fees, subscriptions, or usage limits. You can convert units as much as you need."
    },
    {
      question: "Do you store my conversion data?",
      answer: "No, absolutely not. All unit conversions happen entirely in your browser. We never see, store, transmit, or have any access to your conversion data. Your privacy is completely protected."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Select Category",
      text: "Choose the unit category: Length, Weight, Volume, Area, or Time."
    },
    {
      name: "Choose From and To Units",
      text: "Select the unit you want to convert from and the unit you want to convert to from the dropdown menus."
    },
    {
      name: "Enter Value",
      text: "Type the value you want to convert in the 'From' input field."
    },
    {
      name: "View Result",
      text: "The converted value will automatically appear in the 'To' field. Enable auto-convert for real-time conversion as you type."
    },
    {
      name: "Copy Result",
      text: "Copy the converted value to your clipboard for use in your calculations or projects."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Convert Units of Measurement",
      "Learn how to convert between different units of length, weight, volume, area, and time using our free online unit converter tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Unit Converter",
      "Free online unit converter. Convert between units of length, weight, volume, area, and time with support for metric and imperial systems.",
      "https://prylad.pro/unit-converter",
      "UtilityApplication"
    )
  ]

  const convert = useCallback((value: number, from: string, to: string, cat: UnitCategory): number => {
    const categoryUnits = units[cat]
    const fromUnitData = categoryUnits.find(u => u.name === from)
    const toUnitData = categoryUnits.find(u => u.name === to)

    if (!fromUnitData || !toUnitData) return 0

    // Convert to base unit, then to target unit
    const baseValue = value * fromUnitData.toBase
    const result = baseValue / toUnitData.toBase

    return result
  }, [])

  const handleConvert = useCallback(() => {
    const numValue = parseFloat(fromValue)
    if (isNaN(numValue)) {
      setToValue('')
      return
    }

    const result = convert(numValue, fromUnit, toUnit, category)
    setToValue(result.toFixed(6).replace(/\.?0+$/, ''))
    setTotalConversions(prev => prev + 1)
  }, [fromValue, fromUnit, toUnit, category, convert])

  useEffect(() => {
    if (autoConvert && fromValue) {
      const timer = setTimeout(() => {
        handleConvert()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [fromValue, fromUnit, toUnit, category, autoConvert, handleConvert])

  const swapUnits = () => {
    const temp = fromUnit
    setFromUnit(toUnit)
    setToUnit(temp)
  }

  const applyExample = (example: typeof categoryExamples.length[0]) => {
    setFromUnit(example.from)
    setToUnit(example.to)
    setFromValue(example.value.toString())
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Failed to copy
    }
  }

  const categoryUnits = units[category]

  return (
    <Layout
      title="📏 Unit Converter - Length, Weight, Volume, Area, Time"
      description="Convert units of length, weight, volume, area, and time. Free online unit converter with support for metric and imperial units."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Main Tool */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Category:</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {(['length', 'weight', 'volume', 'area', 'time'] as UnitCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat)
                      const catUnits = units[cat]
                      setFromUnit(catUnits[0].name)
                      setToUnit(catUnits[1]?.name || catUnits[0].name)
                      setFromValue('1')
                      setToValue('')
                    }}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                      category === cat
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat === 'length' && '📏 Length'}
                    {cat === 'weight' && '⚖️ Weight'}
                    {cat === 'volume' && '💧 Volume'}
                    {cat === 'area' && '📐 Area'}
                    {cat === 'time' && '⏰ Time'}
                  </button>
                ))}
              </div>
            </div>

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

            {/* Conversion Inputs */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* From */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">From</label>
                <select
                  value={fromUnit}
                  onChange={(e) => {
                    setFromUnit(e.target.value)
                    setToValue('')
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  {categoryUnits.map((unit) => (
                    <option key={unit.name} value={unit.name}>
                      {unit.name} ({unit.symbol})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                  placeholder="Enter value"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-lg"
                />
              </div>

              {/* Swap Button */}
              <div className="flex items-end justify-center md:order-3">
                <button
                  onClick={swapUnits}
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  title="Swap units"
                >
                  ⇄
                </button>
              </div>

              {/* To */}
              <div className="space-y-2 md:order-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">To</label>
                <select
                  value={toUnit}
                  onChange={(e) => {
                    setToUnit(e.target.value)
                    setToValue('')
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  {categoryUnits.map((unit) => (
                    <option key={unit.name} value={unit.name}>
                      {unit.name} ({unit.symbol})
                    </option>
                  ))}
                </select>
                <div className="relative">
                  <input
                    type="text"
                    value={toValue}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-primary-200 dark:border-primary-800 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-gray-900 dark:text-gray-100 font-mono text-lg"
                  />
                  {toValue && (
                    <button
                      onClick={() => copyToClipboard(toValue)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Copy
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Convert Button */}
            {!autoConvert && (
              <button
                onClick={handleConvert}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {categoryExamples[category].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => applyExample(example)}
                    className="px-3 py-2 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {example.value} {example.from} → {example.to}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Unit Reference */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Available Units - {category.charAt(0).toUpperCase() + category.slice(1)}
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {categoryUnits.map((unit) => (
              <div
                key={unit.name}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="font-semibold text-gray-900 dark:text-gray-100">{unit.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">{unit.symbol}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is a Unit Converter?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                A unit converter is a tool that converts measurements from one unit to another within the same category. 
                It&apos;s essential for converting between metric and imperial systems, or between different units within the same system.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our unit converter supports five main categories: length, weight, volume, area, and time. 
                Each category includes both metric (SI) and imperial units, making it easy to convert between different measurement systems.
              </p>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use Our Unit Converter</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li><strong>Select Category:</strong> Choose the category of units you want to convert (length, weight, volume, area, or time).</li>
                <li><strong>Choose Units:</strong> Select the source unit (From) and target unit (To) from the dropdown menus.</li>
                <li><strong>Enter Value:</strong> Type the value you want to convert in the &quot;From&quot; field.</li>
                <li><strong>View Result:</strong> The converted value will appear automatically in the &quot;To&quot; field (if auto-convert is enabled).</li>
                <li><strong>Swap Units:</strong> Click the swap button (⇄) to quickly exchange the source and target units.</li>
                <li><strong>Copy Result:</strong> Click the copy button to copy the converted value to your clipboard.</li>
              </ol>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Supported Categories</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📏 Length</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert between meters, kilometers, centimeters, millimeters, miles, yards, feet, inches, and nautical miles. 
                  Essential for distance measurements, construction, and travel.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">⚖️ Weight</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert between kilograms, grams, milligrams, metric tons, pounds, ounces, stones, and US tons. 
                  Useful for cooking, shipping, and scientific measurements.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">💧 Volume</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert between liters, milliliters, cubic meters, US gallons, quarts, pints, cups, fluid ounces, and UK gallons. 
                  Perfect for cooking, chemistry, and liquid measurements.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📐 Area</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert between square meters, square kilometers, square centimeters, hectares, acres, square miles, 
                  square yards, square feet, and square inches. Essential for real estate, construction, and land measurements.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">⏰ Time</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert between seconds, minutes, hours, days, weeks, months, and years. 
                  Useful for scheduling, project planning, and time calculations.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🌍 International Travel</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert distances, weights, and temperatures when traveling between countries that use different measurement systems. 
                  Essential for understanding road signs, weather, and local measurements.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">👨‍🍳 Cooking & Baking</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert recipe measurements between metric and imperial units. Convert cups to milliliters, 
                  pounds to grams, and ounces to grams for accurate cooking.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🏗️ Construction & Engineering</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert measurements for construction projects, engineering calculations, and technical specifications. 
                  Essential for working with international standards and documentation.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📚 Education & Learning</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Learn unit conversions, practice calculations, and understand the relationship between different measurement systems. 
                  Great for students and educators.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the difference between metric and imperial units?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Metric units (SI) are based on powers of 10 and are used internationally. Imperial units (used primarily in the US and UK) 
                  have historical origins and use different conversion factors. Our converter handles both systems seamlessly.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How accurate are the conversions?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our converter uses precise conversion factors and displays results with up to 6 decimal places (trailing zeros are removed). 
                  The accuracy is suitable for most practical purposes, including scientific and engineering applications.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I convert between different categories?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, you can only convert within the same category (e.g., length to length, weight to weight). 
                  Each category has its own set of compatible units. Switch categories using the category buttons at the top.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the base unit for each category?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Length: meter, Weight: kilogram, Volume: liter, Area: square meter, Time: second. 
                  All conversions are calculated through these base units for accuracy.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Is my data stored or transmitted?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, all conversions happen entirely in your browser. We never see, store, or transmit any of your values. 
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

