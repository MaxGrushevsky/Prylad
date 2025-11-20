'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

interface RGB {
  r: number
  g: number
  b: number
}

interface HSL {
  h: number
  s: number
  l: number
}

interface HSV {
  h: number
  s: number
  v: number
}

interface CMYK {
  c: number
  m: number
  y: number
  k: number
}

export default function ColorConverterPage() {
  const [hex, setHex] = useState('#3b82f6')
  const [rgb, setRgb] = useState<RGB>({ r: 59, g: 130, b: 246 })
  const [hsl, setHsl] = useState<HSL>({ h: 217, s: 91, l: 60 })
  const [hsv, setHsv] = useState<HSV>({ h: 217, s: 76, v: 96 })
  const [cmyk, setCmyk] = useState<CMYK>({ c: 76, m: 47, y: 0, k: 4 })

  const hexToRgb = (hex: string): RGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  const rgbToHsl = (r: number, g: number, b: number): HSL => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }

  const rgbToHsv = (r: number, g: number, b: number): HSV => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    let h = 0
    const s = max === 0 ? 0 : d / max
    const v = max

    if (max !== min) {
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100),
    }
  }

  const rgbToCmyk = (r: number, g: number, b: number): CMYK => {
    r /= 255
    g /= 255
    b /= 255
    const k = 1 - Math.max(r, g, b)
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k)
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k)
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k)

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    }
  }

  const hslToRgb = (h: number, s: number, l: number): RGB => {
    s /= 100
    l /= 100
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = l - c / 2
    let r = 0, g = 0, b = 0

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    }
  }

  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    const rgbObj = { r, g, b }
    setRgb(rgbObj)
    
    const hexStr = '#' + [r, g, b].map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join('')
    setHex(hexStr)
    
    const hslObj = rgbToHsl(r, g, b)
    setHsl(hslObj)
    
    const hsvObj = rgbToHsv(r, g, b)
    setHsv(hsvObj)
    
    const cmykObj = rgbToCmyk(r, g, b)
    setCmyk(cmykObj)
  }, [])

  const updateFromHex = useCallback((value: string) => {
    if (!/^#?[0-9A-Fa-f]{6}$/.test(value)) {
      if (value.startsWith('#')) {
        setHex(value)
      }
      return
    }
    
    const cleanHex = value.startsWith('#') ? value : `#${value}`
    setHex(cleanHex)
    const rgbObj = hexToRgb(cleanHex)
    if (rgbObj) {
      updateFromRgb(rgbObj.r, rgbObj.g, rgbObj.b)
    }
  }, [updateFromRgb])

  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    const hslObj = { h, s, l }
    setHsl(hslObj)
    
    const rgbObj = hslToRgb(h, s, l)
    updateFromRgb(rgbObj.r, rgbObj.g, rgbObj.b)
  }, [updateFromRgb])

  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(val => {
      val = val / 255
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const getContrast = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number => {
    const l1 = getLuminance(r1, g1, b1)
    const l2 = getLuminance(r2, g2, b2)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
  }

  const getBrightness = (r: number, g: number, b: number): number => {
    return Math.round((r * 299 + g * 587 + b * 114) / 1000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const copyAll = () => {
    const all = `HEX: ${hex}\nRGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})\nHSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)\nHSV: hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)\nCMYK: cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
    navigator.clipboard.writeText(all)
  }

  const exportToFile = () => {
    const content = `Color Conversion Results\n\nHEX: ${hex}\nRGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})\nHSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)\nHSV: hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)\nCMYK: cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `color-${hex.replace('#', '')}-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Auto-update on mount
  useEffect(() => {
    updateFromHex(hex)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const contrastWithWhite = getContrast(rgb.r, rgb.g, rgb.b, 255, 255, 255)
  const contrastWithBlack = getContrast(rgb.r, rgb.g, rgb.b, 0, 0, 0)
  const brightness = getBrightness(rgb.r, rgb.g, rgb.b)
  const bestTextColor = brightness > 128 ? '#000000' : '#FFFFFF'

  // SEO data
  const toolPath = '/color-converter'
  const toolName = 'Color Converter'
  const category = 'design'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "How do I convert colors between different formats?",
      answer: "Enter your color in any format (HEX, RGB, HSL, HSV, or CMYK) in the input field. The converter automatically detects the format and shows the equivalent color in all other formats in real-time."
    },
    {
      question: "What color formats are supported?",
      answer: "The converter supports HEX (#RRGGBB), RGB (Red, Green, Blue), HSL (Hue, Saturation, Lightness), HSV (Hue, Saturation, Value), and CMYK (Cyan, Magenta, Yellow, Key/Black) color formats."
    },
    {
      question: "What is WCAG contrast ratio?",
      answer: "WCAG (Web Content Accessibility Guidelines) contrast ratio measures the difference in brightness between text and background colors. Higher ratios (4.5:1 for normal text, 3:1 for large text) ensure better readability and accessibility."
    },
    {
      question: "How do I use the color picker?",
      answer: "Click on the color preview box to open the color picker. Select your desired color visually, and all color formats will update automatically. You can also manually enter color values in any format."
    },
    {
      question: "What is color brightness?",
      answer: "Color brightness (luminance) is a measure of how light or dark a color appears. It's calculated using a formula that accounts for how the human eye perceives different color components. Higher brightness values indicate lighter colors."
    },
    {
      question: "Is the color converter free to use?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All color conversions happen in your browser - we never see or store your data."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Enter or Select Color",
      text: "Type a color value in any format (HEX, RGB, HSL, HSV, CMYK) or use the color picker to visually select a color."
    },
    {
      name: "View All Formats",
      text: "The converter automatically shows the equivalent color in all supported formats: HEX, RGB, HSL, HSV, and CMYK."
    },
    {
      name: "Check Color Information",
      text: "View color details including brightness, contrast ratios, and WCAG accessibility compliance for text readability."
    },
    {
      name: "Copy Color Values",
      text: "Click on any color format value to copy it to your clipboard for use in your CSS, design tools, or code."
    },
    {
      name: "Use in Your Projects",
      text: "Use the converted color values in your web design, graphics, or any project that requires specific color formats."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Convert Colors Between Different Formats",
      "Learn how to convert colors between HEX, RGB, HSL, HSV, and CMYK formats using our free online color converter.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Color Converter",
      "Free online color converter. Convert colors between HEX, RGB, HSL, HSV, and CMYK formats. Get color information, brightness, contrast ratios, and WCAG compliance.",
      "https://prylad.pro/color-converter",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🔄 Color Converter"
        description="Convert colors between HEX, RGB, HSL, HSV, and CMYK formats. Free online color converter with color information and accessibility tools."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            {/* Color Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
                Pick a Color
              </label>
              <div className="flex justify-center">
                <label className="relative block cursor-pointer group">
                  <input
                    type="color"
                    value={hex}
                    onChange={(e) => updateFromHex(e.target.value)}
                    className="w-32 h-32 rounded-xl cursor-pointer border-4 border-gray-200 dark:border-gray-700 group-hover:border-primary-400 transition-all opacity-0 absolute bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <div 
                    className="w-32 h-32 rounded-xl border-4 border-gray-200 dark:border-gray-700 group-hover:border-primary-400 transition-all flex items-center justify-center relative overflow-hidden shadow-lg"
                    style={{ backgroundColor: hex }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.8)) drop-shadow(0 0 2px rgba(0,0,0,0.9))' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </label>
              </div>
            </div>

            {/* Color Formats */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* HEX */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">HEX</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hex}
                    onChange={(e) => updateFromHex(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="#000000"
                  />
                  <button
                    onClick={() => copyToClipboard(hex)}
                    className="bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                    title="Copy HEX"
                  >
                    📋
                  </button>
                </div>
              </div>

              {/* RGB */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">RGB</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
                    onChange={(e) => {
                      const match = e.target.value.match(/\d+/g)
                      if (match && match.length === 3) {
                        updateFromRgb(
                          Math.max(0, Math.min(255, parseInt(match[0]) || 0)),
                          Math.max(0, Math.min(255, parseInt(match[1]) || 0)),
                          Math.max(0, Math.min(255, parseInt(match[2]) || 0))
                        )
                      }
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="rgb(0, 0, 0)"
                  />
                  <button
                    onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
                    className="bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                    title="Copy RGB"
                  >
                    📋
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">R</label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.r}
                      onChange={(e) => updateFromRgb(Number(e.target.value), rgb.g, rgb.b)}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">G</label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.g}
                      onChange={(e) => updateFromRgb(rgb.r, Number(e.target.value), rgb.b)}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">B</label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.b}
                      onChange={(e) => updateFromRgb(rgb.r, rgb.g, Number(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* HSL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">HSL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}
                    onChange={(e) => {
                      const match = e.target.value.match(/(\d+)/g)
                      if (match && match.length === 3) {
                        updateFromHsl(
                          Math.max(0, Math.min(360, parseInt(match[0]) || 0)),
                          Math.max(0, Math.min(100, parseInt(match[1]) || 0)),
                          Math.max(0, Math.min(100, parseInt(match[2]) || 0))
                        )
                      }
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="hsl(0, 0%, 0%)"
                  />
                  <button
                    onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
                    className="bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                    title="Copy HSL"
                  >
                    📋
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">H</label>
                    <input
                      type="number"
                      min="0"
                      max="360"
                      value={hsl.h}
                      onChange={(e) => updateFromHsl(Number(e.target.value), hsl.s, hsl.l)}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">S</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={hsl.s}
                      onChange={(e) => updateFromHsl(hsl.h, Number(e.target.value), hsl.l)}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">L</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={hsl.l}
                      onChange={(e) => updateFromHsl(hsl.h, hsl.s, Number(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* HSV */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">HSV</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`}
                    readOnly
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 font-mono text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={() => copyToClipboard(`hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`)}
                    className="bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                    title="Copy HSV"
                  >
                    📋
                  </button>
                </div>
              </div>

              {/* CMYK */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">CMYK</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`}
                    readOnly
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 font-mono text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={() => copyToClipboard(`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`)}
                    className="bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                    title="Copy CMYK"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>

            {/* Preview and Info */}
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              {/* Preview */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color Preview</label>
                <div className="space-y-3">
                  <div
                    className="w-full h-32 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg relative group bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    style={{ backgroundColor: hex }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className="h-16 rounded-lg border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      style={{ backgroundColor: hex, color: bestTextColor }}
                    >
                      <span className="font-semibold">Text Sample</span>
                    </div>
                    <div
                      className="h-16 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-white dark:bg-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      style={{ color: hex }}
                    >
                      <span className="font-semibold">On White</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Information */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color Information</label>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Brightness:</span>
                    <span className="font-semibold">{brightness}/255</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Contrast (White):</span>
                    <span className={`font-semibold ${
                      contrastWithWhite >= 4.5 ? 'text-green-600' :
                      contrastWithWhite >= 3 ? 'text-yellow-600' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {contrastWithWhite.toFixed(2)}:1
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Contrast (Black):</span>
                    <span className={`font-semibold ${
                      contrastWithBlack >= 4.5 ? 'text-green-600' :
                      contrastWithBlack >= 3 ? 'text-yellow-600' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {contrastWithBlack.toFixed(2)}:1
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Best Text Color:</span>
                    <span className="font-semibold" style={{ color: bestTextColor }}>
                      {bestTextColor === '#FFFFFF' ? 'White' : 'Black'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>WCAG AA:</strong> Contrast ratio ≥ 4.5:1 for normal text
                      <br />
                      <strong>WCAG AAA:</strong> Contrast ratio ≥ 7:1 for normal text
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <button
                onClick={copyAll}
                className="flex-1 bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                Copy All Formats
              </button>
              <button
                onClick={exportToFile}
                className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Why Use a Color Converter?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Colors can be represented in multiple formats, each with its own advantages and use cases. Whether you&apos;re 
                working with web design (HEX, RGB, HSL), print design (CMYK), or image processing (HSV), you often need 
                to convert between formats. Manually converting colors is time-consuming and error-prone, especially when 
                working with complex color values.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our free color converter instantly converts colors between HEX, RGB, HSL, HSV, and CMYK formats. Simply 
                pick a color or enter a value in any format, and get instant conversions to all other formats. We also 
                provide color information like brightness and contrast ratios for accessibility compliance.
              </p>
            </div>
          </section>

          {/* Color Formats */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Color Formats Explained</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">HEX (#RRGGBB)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Hexadecimal format uses 6-digit codes prefixed with #. Each pair represents red, green, and blue values 
                  from 00 to FF (0-255 in decimal).
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400"><strong>Used in:</strong> Web development, CSS, HTML</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">RGB (Red, Green, Blue)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  RGB uses three values (0-255) for each color channel. This is the additive color model used by screens 
                  and digital displays.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400"><strong>Used in:</strong> Web design, digital graphics, CSS</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">HSL (Hue, Saturation, Lightness)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  HSL represents colors using hue (0-360°), saturation (0-100%), and lightness (0-100%). This format is 
                  intuitive for adjusting color properties.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400"><strong>Used in:</strong> CSS, design tools, color manipulation</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">HSV (Hue, Saturation, Value)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Similar to HSL but uses &quot;value&quot; instead of &quot;lightness&quot;. HSV is commonly used in image editing software 
                  and color pickers.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400"><strong>Used in:</strong> Image editing, color pickers, graphics software</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">CMYK (Cyan, Magenta, Yellow, Key)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  CMYK is the subtractive color model used in printing. The &quot;K&quot; stands for key (black). Values are 
                  percentages (0-100%).
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400"><strong>Used in:</strong> Print design, professional printing, publishing</p>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🌐 Web Development</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert between HEX, RGB, and HSL formats commonly used in CSS. Quickly switch formats when working 
                  with different CSS properties or frameworks.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎨 Design Workflow</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert colors between formats when moving between design tools, web development, and print design. 
                  Ensure color accuracy across different media.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">♿ Accessibility</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Check contrast ratios and brightness to ensure your colors meet WCAG accessibility guidelines. 
                  Determine the best text color for readability.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🖨️ Print Design</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert web colors (RGB/HEX) to CMYK for print projects. Understand how colors will appear when 
                  printed versus on screen.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Multiple Formats</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Convert between HEX, RGB, HSL, HSV, and CMYK formats. Enter a value in any format and get instant 
                    conversions to all others.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Visual Color Picker</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Use the large color picker to visually select colors. See all format conversions update instantly 
                    as you pick different colors.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Color Information</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Get brightness, contrast ratios, and accessibility information. Know if your color combinations 
                    meet WCAG guidelines.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⌨️</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Flexible Input</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Enter colors in HEX, RGB, or HSL format. Adjust individual RGB or HSL values with number inputs 
                    for precise control.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📥</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Export Options</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Copy individual formats or all formats at once. Export color information to a text file for 
                    documentation or reference.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Privacy First</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    All color conversion happens locally in your browser. We never see, store, or have access to 
                    any colors you convert.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the difference between RGB and CMYK?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  RGB is an additive color model used for screens (red, green, blue light combine to create colors). 
                  CMYK is a subtractive model used for printing (cyan, magenta, yellow, black inks combine). RGB has a 
                  larger color gamut than CMYK, so some RGB colors can&apos;t be accurately printed.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Why do I see different colors in print vs screen?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Screens use RGB (additive, light-based) while printers use CMYK (subtractive, ink-based). The color 
                  gamuts differ, so some screen colors can&apos;t be accurately reproduced in print. Always convert to CMYK 
                  and test print samples for important projects.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What is contrast ratio and why does it matter?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Contrast ratio measures the difference in brightness between foreground and background colors. WCAG 
                  guidelines require a minimum 4.5:1 ratio for normal text and 3:1 for large text to ensure readability 
                  for people with visual impairments.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I edit HSL values directly?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes! You can enter HSL values in the text field or adjust individual H, S, L values using the number 
                  inputs. Changes update all other formats instantly.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Do you store the converted colors?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, absolutely not. All color conversion happens entirely in your browser. We never see, store, 
                  transmit, or have any access to the colors you convert. Your privacy is completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Design Tools" />
      )}
    </Layout>
    </>
  )
}

