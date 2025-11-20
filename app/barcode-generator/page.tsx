'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import Script from 'next/script'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type BarcodeFormat = 'EAN13' | 'EAN8' | 'CODE128' | 'CODE39' | 'ITF14' | 'MSI' | 'pharmacode' | 'codabar'

interface BarcodeFormatInfo {
  name: string
  description: string
  minLength: number
  maxLength: number
  example: string
  pattern?: RegExp
}

const formats: Record<BarcodeFormat, BarcodeFormatInfo> = {
  EAN13: {
    name: 'EAN-13',
    description: 'European Article Number (13 digits)',
    minLength: 12,
    maxLength: 13,
    example: '5901234123457',
    pattern: /^\d{12,13}$/
  },
  EAN8: {
    name: 'EAN-8',
    description: 'European Article Number (8 digits)',
    minLength: 7,
    maxLength: 8,
    example: '12345670',
    pattern: /^\d{7,8}$/
  },
  CODE128: {
    name: 'Code 128',
    description: 'High-density alphanumeric barcode',
    minLength: 1,
    maxLength: 255,
    example: 'CODE128',
    pattern: /^[\x00-\x7F]+$/
  },
  CODE39: {
    name: 'Code 39',
    description: 'Alphanumeric barcode (0-9, A-Z, space, -, ., $, /, +, %)',
    minLength: 1,
    maxLength: 255,
    example: 'CODE39',
    pattern: /^[0-9A-Z\s\-\.\$\/\+\%]+$/
  },
  ITF14: {
    name: 'ITF-14',
    description: 'Interleaved 2 of 5 (14 digits)',
    minLength: 13,
    maxLength: 14,
    example: '12345678901231',
    pattern: /^\d{13,14}$/
  },
  MSI: {
    name: 'MSI',
    description: 'Modified Plessey (numeric only)',
    minLength: 1,
    maxLength: 255,
    example: '123456',
    pattern: /^\d+$/
  },
  pharmacode: {
    name: 'Pharmacode',
    description: 'Pharmaceutical Binary Code (3-131070)',
    minLength: 1,
    maxLength: 6,
    example: '123',
    pattern: /^[1-9]\d{0,5}$/
  },
  codabar: {
    name: 'Codabar',
    description: 'Self-checking numeric barcode',
    minLength: 1,
    maxLength: 255,
    example: '1234567890',
    pattern: /^[0-9\-\$:\.\/\+\s]+$/
  },
}

export default function BarcodeGeneratorPage() {
  const [format, setFormat] = useState<BarcodeFormat>('EAN13')
  const [value, setValue] = useState('5901234123457')
  const [width, setWidth] = useState(2)
  const [height, setHeight] = useState(100)
  const [displayValue, setDisplayValue] = useState(true)
  const [fontSize, setFontSize] = useState(20)
  const [margin, setMargin] = useState(10)
  const [error, setError] = useState('')
  const [isJsBarcodeLoaded, setIsJsBarcodeLoaded] = useState(false)
  const barcodeRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Check if JsBarcode is already loaded
    if (typeof window !== 'undefined' && (window as any).JsBarcode) {
      setIsJsBarcodeLoaded(true)
      generateBarcode()
    }
  }, [])

  const validateValue = useCallback((val: string, fmt: BarcodeFormat): boolean => {
    const formatInfo = formats[fmt]
    
    if (val.length < formatInfo.minLength || val.length > formatInfo.maxLength) {
      setError(`Value must be between ${formatInfo.minLength} and ${formatInfo.maxLength} characters for ${formatInfo.name}`)
      return false
    }

    if (formatInfo.pattern && !formatInfo.pattern.test(val)) {
      setError(`Invalid characters for ${formatInfo.name}. ${formatInfo.description}`)
      return false
    }

    // Special validation for EAN-13 and EAN-8
    if (fmt === 'EAN13' || fmt === 'EAN8') {
      if (!/^\d+$/.test(val)) {
        setError(`${formatInfo.name} requires only digits`)
        return false
      }
    }

    setError('')
    return true
  }, [])

  const generateBarcode = useCallback(() => {
    if (!isJsBarcodeLoaded || !barcodeRef.current || !value.trim()) {
      return
    }

    if (!validateValue(value, format)) {
      return
    }

    try {
      const JsBarcode = (window as any).JsBarcode
      
      JsBarcode(barcodeRef.current, value, {
        format: format,
        width: width,
        height: height,
        displayValue: displayValue,
        fontSize: fontSize,
        margin: margin,
        background: '#ffffff',
        lineColor: '#000000',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to generate barcode')
    }
  }, [value, format, width, height, displayValue, fontSize, margin, isJsBarcodeLoaded, validateValue])

  useEffect(() => {
    if (isJsBarcodeLoaded && value) {
      const timer = setTimeout(() => {
        generateBarcode()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [value, format, width, height, displayValue, fontSize, margin, isJsBarcodeLoaded, generateBarcode])

  const handleFormatChange = (newFormat: BarcodeFormat) => {
    setFormat(newFormat)
    const formatInfo = formats[newFormat]
    setValue(formatInfo.example)
    setError('')
  }

  const downloadBarcode = useCallback(async (format: 'svg' | 'png') => {
    if (!barcodeRef.current) return

    try {
      if (format === 'svg') {
        const svg = barcodeRef.current
        const svgData = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const svgUrl = URL.createObjectURL(svgBlob)
        const downloadLink = document.createElement('a')
        downloadLink.href = svgUrl
        downloadLink.download = `barcode-${value}-${Date.now()}.svg`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        URL.revokeObjectURL(svgUrl)
      } else {
        // PNG download
        const svg = barcodeRef.current
        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const img = new Image()
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)

        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const downloadLink = document.createElement('a')
              downloadLink.href = url
              downloadLink.download = `barcode-${value}-${Date.now()}.png`
              document.body.appendChild(downloadLink)
              downloadLink.click()
              document.body.removeChild(downloadLink)
              URL.revokeObjectURL(url)
            }
          })
          URL.revokeObjectURL(url)
        }
        img.src = url
      }
    } catch (err) {
      setError('Failed to download barcode')
    }
  }, [value])

  const copyToClipboard = async () => {
    if (!barcodeRef.current) return
    
    try {
      const svg = barcodeRef.current
      const svgData = new XMLSerializer().serializeToString(svg)
      await navigator.clipboard.writeText(svgData)
    } catch (err) {
      setError('Failed to copy to clipboard')
    }
  }

  // SEO data
  const toolPath = '/barcode-generator'
  const toolName = 'Barcode Generator'
  const category = 'generator'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What barcode formats are supported?",
      answer: "The generator supports multiple barcode formats including EAN-13, EAN-8, Code128, Code39, ITF-14, MSI, Pharmacode, and Codabar. Each format has specific requirements for data length and character types."
    },
    {
      question: "How do I generate a barcode?",
      answer: "Enter your data in the input field, select the barcode format (EAN-13, Code128, etc.), customize size and display options, and the barcode is generated automatically. You can then download it as an image."
    },
    {
      question: "What is the difference between EAN-13 and EAN-8?",
      answer: "EAN-13 uses 13 digits and is the standard format for most retail products worldwide. EAN-8 uses 8 digits and is used for smaller products where space is limited. Both are part of the European Article Number system."
    },
    {
      question: "Can I customize the barcode appearance?",
      answer: "Yes! You can customize the width, height, font size, margin, and whether to display the value below the barcode. These options help you create barcodes that fit your design needs."
    },
    {
      question: "What is Code128 used for?",
      answer: "Code128 is a high-density barcode format that can encode all 128 ASCII characters. It's commonly used in shipping, packaging, and inventory management systems due to its versatility and compact size."
    },
    {
      question: "Is the barcode generator free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All barcode generation happens in your browser - we never see or store your data."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Enter Your Data",
      text: "Type or paste the data you want to encode into a barcode. Make sure the data matches the requirements for your selected format (length, character type)."
    },
    {
      name: "Select Barcode Format",
      text: "Choose the appropriate barcode format: EAN-13/EAN-8 for retail products, Code128 for alphanumeric data, Code39 for simple alphanumeric, or other formats based on your needs."
    },
    {
      name: "Customize Appearance",
      text: "Adjust the barcode size (width, height), font size, margin, and choose whether to display the value below the barcode."
    },
    {
      name: "Generate and Preview",
      text: "The barcode is generated automatically and displayed in the preview area. Verify that it looks correct and contains the right data."
    },
    {
      name: "Download Barcode",
      text: "Click 'Download' to save the barcode as a PNG image. Use it in your products, packaging, labels, or any application that requires barcodes."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Generate Barcodes",
      "Learn how to generate barcodes in various formats (EAN, Code128, Code39) using our free online barcode generator tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Barcode Generator",
      "Free online barcode generator. Create barcodes in multiple formats: EAN-13, EAN-8, Code128, Code39, ITF-14, MSI, Pharmacode, Codabar. Customize size and appearance. Download as image.",
      "https://prylad.pro/barcode-generator",
      "UtilityApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Script
        src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"
        onLoad={() => setIsJsBarcodeLoaded(true)}
        strategy="lazyOnload"
      />
      <Layout
        title="📊 Barcode Generator - Create Barcodes Online"
        description="Generate barcodes for free. Create EAN-13, EAN-8, Code128, Code39, ITF-14 and more. Customize format, size, and download as image."
        breadcrumbs={breadcrumbs}
      >
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Main Tool */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Barcode Format:</label>
                <select
                  value={format}
                  onChange={(e) => handleFormatChange(e.target.value as BarcodeFormat)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  {Object.entries(formats).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.name} - {info.description}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {formats[format].description}. Example: {formats[format].example}
                </p>
              </div>

              {/* Value Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Barcode Value
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={`Enter value (${formats[format].minLength}-${formats[format].maxLength} chars)`}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-lg"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {value.length} / {formats[format].maxLength} characters
                  </span>
                  {value && (
                    <button
                      onClick={() => {
                        setValue(formats[format].example)
                        setError('')
                      }}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Use Example
                    </button>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Error</h3>
                      <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Width: {width}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={width}
                    onChange={(e) => setWidth(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Height: {height}px
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="10"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Margin: {margin}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="2"
                    value={margin}
                    onChange={(e) => setMargin(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="display-value"
                    checked={displayValue}
                    onChange={(e) => setDisplayValue(e.target.checked)}
                    className="w-4 h-4 accent-primary-600 rounded"
                  />
                  <label htmlFor="display-value" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    Display Value
                  </label>
                </div>
              </div>

              {/* Barcode Display */}
              {isJsBarcodeLoaded && value && !error && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col items-center justify-center min-h-[200px] bg-white dark:bg-gray-900 rounded-lg">
                    <svg ref={barcodeRef} className="max-w-full" />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                  </div>
                  
                  {/* Download Buttons */}
                  <div className="flex flex-wrap gap-3 mt-4 justify-center">
                    <button
                      onClick={() => downloadBarcode('svg')}
                      className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      📥 Download SVG
                    </button>
                    <button
                      onClick={() => downloadBarcode('png')}
                      className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      📥 Download PNG
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      📋 Copy SVG
                    </button>
                  </div>
                </div>
              )}

              {!isJsBarcodeLoaded && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Loading barcode library...
                </div>
              )}
            </div>
          </div>

          {/* Format Reference */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Barcode Formats Reference</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(formats).map(([key, info]) => (
                <div
                  key={key}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{info.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{info.description}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                    Length: {info.minLength}-{info.maxLength} chars
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-1">
                    Example: {info.example}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Content */}
          <div className="max-w-4xl mx-auto mt-16 space-y-8">
            <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is a Barcode?</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  A barcode is a method of representing data in a visual, machine-readable form. Originally, barcodes 
                  represented data by varying the widths and spacings of parallel lines, and may be referred to as 
                  linear or one-dimensional (1D) barcodes.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Barcodes are widely used in retail, logistics, inventory management, and many other industries. 
                  They enable quick and accurate data entry, reduce human error, and improve efficiency in various 
                  business processes.
                </p>
              </div>
            </section>

            <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use Our Barcode Generator</h2>
              <div className="prose prose-gray max-w-none">
                <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                  <li><strong>Select Format:</strong> Choose the barcode format that suits your needs (EAN-13, Code128, Code39, etc.).</li>
                  <li><strong>Enter Value:</strong> Type the value you want to encode in the barcode. Make sure it matches the format requirements.</li>
                  <li><strong>Customize:</strong> Adjust width, height, font size, margin, and whether to display the value below the barcode.</li>
                  <li><strong>Download:</strong> Click &quot;Download SVG&quot; or &quot;Download PNG&quot; to save the barcode as an image file.</li>
                  <li><strong>Copy:</strong> Use &quot;Copy SVG&quot; to copy the barcode SVG code to your clipboard for use in web projects.</li>
                </ol>
              </div>
            </section>

            <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Barcode Formats Explained</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">EAN-13 / EAN-8</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    European Article Number. EAN-13 uses 13 digits (12 data + 1 check digit), EAN-8 uses 8 digits (7 data + 1 check digit). 
                    Widely used in retail for product identification. The check digit is automatically calculated.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Code 128</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    High-density alphanumeric barcode that can encode all 128 ASCII characters. Very versatile and commonly used 
                    in shipping, packaging, and logistics.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Code 39</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Alphanumeric barcode that can encode uppercase letters (A-Z), digits (0-9), and special characters (-, ., $, /, +, %, space). 
                    Widely used in non-retail applications.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">ITF-14</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Interleaved 2 of 5 barcode used for shipping containers and cartons. Requires 13 or 14 digits. 
                    Commonly used in logistics and warehousing.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🏪 Retail & E-commerce</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Generate product barcodes for inventory management, point-of-sale systems, and online stores. 
                    EAN-13 and EAN-8 are standard for retail products.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📦 Logistics & Shipping</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Create shipping labels, tracking codes, and package identifiers. Code128 and ITF-14 are commonly 
                    used in logistics and warehousing.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📚 Library & Asset Management</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Generate barcodes for books, equipment, and assets. Code39 and Code128 are popular choices for 
                    library and asset management systems.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🏥 Healthcare & Pharmaceuticals</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Create barcodes for medical devices, pharmaceuticals, and patient identification. Pharmacode is 
                    specifically designed for pharmaceutical applications.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the difference between EAN-13 and EAN-8?</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    EAN-13 uses 13 digits and is used for standard products. EAN-8 uses 8 digits and is used for smaller 
                    products where space is limited. Both include a check digit that is automatically calculated.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Which format should I use?</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    <strong>EAN-13/EAN-8:</strong> For retail products. <strong>Code128:</strong> For alphanumeric data in shipping/logistics. 
                    <strong>Code39:</strong> For simple alphanumeric codes. <strong>ITF-14:</strong> For shipping containers. 
                    Choose based on your industry standards and requirements.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I use custom values?</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Yes, but values must match the format requirements (character set, length, pattern). For EAN codes, 
                    you can enter 12 digits (for EAN-13) or 7 digits (for EAN-8) and the check digit will be calculated automatically.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What file formats can I download?</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    You can download barcodes as SVG (scalable vector graphics) or PNG (raster image). SVG is better for 
                    web use and scaling, while PNG is better for printing and general use.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Is my data stored or transmitted?</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    No, all barcode generation happens entirely in your browser. We never see, store, or transmit any of your 
                    barcode values. Your privacy is completely protected.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Generator Tools" />
      )}
      </Layout>
    </>
  )
}

