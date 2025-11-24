'use client'

import { useState, useCallback, useMemo } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

interface ContrastResult {
  ratio: number
  aaNormal: boolean
  aaLarge: boolean
  aaaNormal: boolean
  aaaLarge: boolean
  level: 'fail' | 'aa-large' | 'aa' | 'aaa-large' | 'aaa'
}

type ColorFormat = 'hex' | 'rgb' | 'hsl'
type ColorBlindnessType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia'
type UIElement = 'text' | 'button' | 'link' | 'border' | 'icon'

interface RGB {
  r: number
  g: number
  b: number
  a?: number
}

interface HSL {
  h: number
  s: number
  l: number
  a?: number
}

export default function ContrastCheckerPage() {
  const [foreground, setForeground] = useState('#000000')
  const [background, setBackground] = useState('#ffffff')
  const [fgFormat, setFgFormat] = useState<ColorFormat>('hex')
  const [bgFormat, setBgFormat] = useState<ColorFormat>('hex')
  const [colorBlindness, setColorBlindness] = useState<ColorBlindnessType>('normal')
  const [uiElement, setUIElement] = useState<UIElement>('text')
  const [copied, setCopied] = useState<string | null>(null)

  // Parse color from various formats
  const parseColor = useCallback((color: string, format: ColorFormat): RGB | null => {
    if (format === 'hex') {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color)
      if (result) {
        return {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      }
    } else if (format === 'rgb') {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i)
      if (match) {
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3]),
          a: match[4] ? parseFloat(match[4]) : undefined
        }
      }
    } else if (format === 'hsl') {
      const match = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/i)
      if (match) {
        const h = parseInt(match[1]) / 360
        const s = parseInt(match[2]) / 100
        const l = parseInt(match[3]) / 100
        const a = match[4] ? parseFloat(match[4]) : undefined
        
        const hslToRgb = (h: number, s: number, l: number): RGB => {
          let r, g, b
          if (s === 0) {
            r = g = b = l
          } else {
            const hue2rgb = (p: number, q: number, t: number) => {
              if (t < 0) t += 1
              if (t > 1) t -= 1
              if (t < 1/6) return p + (q - p) * 6 * t
              if (t < 1/2) return q
              if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
              return p
            }
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s
            const p = 2 * l - q
            r = hue2rgb(p, q, h + 1/3)
            g = hue2rgb(p, q, h)
            b = hue2rgb(p, q, h - 1/3)
          }
          return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
            a
          }
        }
        return hslToRgb(h, s, l)
      }
    }
    return null
  }, [])

  // Convert RGB to HEX
  const rgbToHex = useCallback((rgb: RGB): string => {
    const toHex = (n: number) => {
      const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
  }, [])

  // Convert RGB to RGB string
  const rgbToRgbString = useCallback((rgb: RGB): string => {
    if (rgb.a !== undefined) {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`
    }
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  }, [])

  // Convert RGB to HSL
  const rgbToHsl = useCallback((rgb: RGB): HSL => {
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255
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
      a: rgb.a
    }
  }, [])

  // Convert HSL to string
  const hslToString = useCallback((hsl: HSL): string => {
    if (hsl.a !== undefined) {
      return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${hsl.a})`
    }
    return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
  }, [])

  // Apply color blindness filter
  const applyColorBlindness = useCallback((rgb: RGB, type: ColorBlindnessType): RGB => {
    if (type === 'normal') return rgb

    const matrix = {
      protanopia: [
        0.567, 0.433, 0, 0, 0,
        0.558, 0.442, 0, 0, 0,
        0, 0.242, 0.758, 0, 0,
        0, 0, 0, 1, 0
      ],
      deuteranopia: [
        0.625, 0.375, 0, 0, 0,
        0.7, 0.3, 0, 0, 0,
        0, 0.3, 0.7, 0, 0,
        0, 0, 0, 1, 0
      ],
      tritanopia: [
        0.95, 0.05, 0, 0, 0,
        0, 0.433, 0.567, 0, 0,
        0, 0.475, 0.525, 0, 0,
        0, 0, 0, 1, 0
      ]
    }[type]

    const r = Math.min(255, Math.max(0, rgb.r * matrix[0] + rgb.g * matrix[1] + rgb.b * matrix[2]))
    const g = Math.min(255, Math.max(0, rgb.r * matrix[5] + rgb.g * matrix[6] + rgb.b * matrix[7]))
    const b = Math.min(255, Math.max(0, rgb.r * matrix[10] + rgb.g * matrix[11] + rgb.b * matrix[12]))

    return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a: rgb.a }
  }, [])

  // Get current colors in RGB
  const fgRgb = useMemo(() => {
    const rgb = parseColor(foreground, fgFormat)
    return rgb ? applyColorBlindness(rgb, colorBlindness) : null
  }, [foreground, fgFormat, colorBlindness, parseColor, applyColorBlindness])

  const bgRgb = useMemo(() => {
    const rgb = parseColor(background, bgFormat)
    return rgb ? applyColorBlindness(rgb, colorBlindness) : null
  }, [background, bgFormat, colorBlindness, parseColor, applyColorBlindness])

  // Get display colors (for preview)
  const fgDisplay = useMemo(() => {
    if (!fgRgb) return foreground
    if (fgFormat === 'hex') return rgbToHex(fgRgb)
    if (fgFormat === 'rgb') return rgbToRgbString(fgRgb)
    return hslToString(rgbToHsl(fgRgb))
  }, [fgRgb, fgFormat, rgbToHex, rgbToRgbString, rgbToHsl, hslToString, foreground])

  const bgDisplay = useMemo(() => {
    if (!bgRgb) return background
    if (bgFormat === 'hex') return rgbToHex(bgRgb)
    if (bgFormat === 'rgb') return rgbToRgbString(bgRgb)
    return hslToString(rgbToHsl(bgRgb))
  }, [bgRgb, bgFormat, rgbToHex, rgbToRgbString, rgbToHsl, hslToString, background])

  const getLuminance = useCallback((r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(val => {
      val = val / 255
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }, [])

  const getContrastRatio = useCallback((color1: RGB, color2: RGB): number => {
    const lum1 = getLuminance(color1.r, color1.g, color1.b)
    const lum2 = getLuminance(color2.r, color2.g, color2.b)
    const lighter = Math.max(lum1, lum2)
    const darker = Math.min(lum1, lum2)
    return (lighter + 0.05) / (darker + 0.05)
  }, [getLuminance])

  // Get required contrast ratio for UI element
  const getRequiredRatio = useCallback((element: UIElement): { normal: number; large: number } => {
    switch (element) {
      case 'button':
      case 'link':
        return { normal: 4.5, large: 3 } // Same as text
      case 'border':
        return { normal: 3, large: 3 } // Lower requirement for borders
      case 'icon':
        return { normal: 3, large: 3 } // Lower requirement for icons
      default:
        return { normal: 4.5, large: 3 } // Text
    }
  }, [])

  const contrastResult = useMemo((): ContrastResult | null => {
    if (!fgRgb || !bgRgb) return null

    const ratio = getContrastRatio(fgRgb, bgRgb)
    const required = getRequiredRatio(uiElement)
    
    // WCAG standards
    const aaNormal = ratio >= required.normal
    const aaLarge = ratio >= required.large
    const aaaNormal = ratio >= 7
    const aaaLarge = ratio >= 4.5

    let level: ContrastResult['level'] = 'fail'
    if (ratio >= 7) level = 'aaa'
    else if (ratio >= 4.5) level = 'aaa-large'
    else if (ratio >= required.normal) level = 'aa'
    else if (ratio >= required.large) level = 'aa-large'
    else level = 'fail'

    return {
      ratio,
      aaNormal,
      aaLarge,
      aaaNormal,
      aaaLarge,
      level
    }
  }, [fgRgb, bgRgb, getContrastRatio, getRequiredRatio, uiElement])

  // Convert HSL to RGB directly (for suggestions)
  const hslToRgbDirect = useCallback((h: number, s: number, l: number): RGB => {
    h = h / 360
    s = s / 100
    l = l / 100
    
    let r, g, b
    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    }
  }, [])

  // Generate color suggestions to improve contrast
  const getColorSuggestions = useMemo(() => {
    if (!fgRgb || !bgRgb || !contrastResult) return null

    const suggestions: Array<{ color: string; ratio: number; format: ColorFormat; isForeground: boolean }> = []
    const targetRatio = 4.5

    if (contrastResult.ratio < targetRatio) {
      // Try adjusting lightness
      const fgHsl = rgbToHsl(fgRgb)
      const bgHsl = rgbToHsl(bgRgb)

      // Make foreground darker or lighter
      for (const adjustment of [-30, -20, -10, 10, 20, 30]) {
        const newL = Math.max(0, Math.min(100, fgHsl.l + adjustment))
        const newRgb = hslToRgbDirect(fgHsl.h, fgHsl.s, newL)
        const newRatio = getContrastRatio(newRgb, bgRgb)
        if (newRatio >= targetRatio && newRatio > contrastResult.ratio) {
          const newHsl: HSL = { ...fgHsl, l: newL }
          suggestions.push({
            color: hslToString(newHsl),
            ratio: newRatio,
            format: 'hsl',
            isForeground: true
          })
        }
      }

      // Try adjusting background
      for (const adjustment of [-30, -20, -10, 10, 20, 30]) {
        const newL = Math.max(0, Math.min(100, bgHsl.l + adjustment))
        const newRgb = hslToRgbDirect(bgHsl.h, bgHsl.s, newL)
        const newRatio = getContrastRatio(fgRgb, newRgb)
        if (newRatio >= targetRatio && newRatio > contrastResult.ratio) {
          const newHsl: HSL = { ...bgHsl, l: newL }
          suggestions.push({
            color: hslToString(newHsl),
            ratio: newRatio,
            format: 'hsl',
            isForeground: false
          })
        }
      }
    }

    // Sort by ratio (highest first) and return top 4
    return suggestions
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 4)
  }, [fgRgb, bgRgb, contrastResult, rgbToHsl, hslToString, hslToRgbDirect, getContrastRatio])

  const getLevelColor = (level: ContrastResult['level']) => {
    switch (level) {
      case 'aaa':
        return 'text-green-600 dark:text-green-400'
      case 'aaa-large':
        return 'text-green-600 dark:text-green-400'
      case 'aa':
        return 'text-blue-600 dark:text-blue-400'
      case 'aa-large':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'fail':
        return 'text-red-600 dark:text-red-400'
    }
  }

  const getLevelBg = (level: ContrastResult['level']) => {
    switch (level) {
      case 'aaa':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'aaa-large':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'aa':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'aa-large':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'fail':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      // Silent fail
    }
  }

  // Update foreground when format changes
  const handleFgFormatChange = useCallback((format: ColorFormat) => {
    if (!fgRgb) return
    setFgFormat(format)
    if (format === 'hex') {
      setForeground(rgbToHex(fgRgb))
    } else if (format === 'rgb') {
      setForeground(rgbToRgbString(fgRgb))
    } else {
      setForeground(hslToString(rgbToHsl(fgRgb)))
    }
  }, [fgRgb, rgbToHex, rgbToRgbString, rgbToHsl, hslToString])

  // Update background when format changes
  const handleBgFormatChange = useCallback((format: ColorFormat) => {
    if (!bgRgb) return
    setBgFormat(format)
    if (format === 'hex') {
      setBackground(rgbToHex(bgRgb))
    } else if (format === 'rgb') {
      setBackground(rgbToRgbString(bgRgb))
    } else {
      setBackground(hslToString(rgbToHsl(bgRgb)))
    }
  }, [bgRgb, rgbToHex, rgbToRgbString, rgbToHsl, hslToString])

  // SEO data
  const toolPath = '/contrast-checker'
  const toolName = 'Contrast Checker'
  const category = 'design'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is WCAG contrast ratio?",
      answer: "WCAG (Web Content Accessibility Guidelines) contrast ratio measures the difference in brightness between text and background colors. It's expressed as a ratio (e.g., 4.5:1) where higher ratios indicate better contrast and readability."
    },
    {
      question: "What are the WCAG contrast requirements?",
      answer: "WCAG Level AA requires: 4.5:1 for normal text (under 18pt or 14pt bold), 3:1 for large text (18pt+ or 14pt+ bold). WCAG Level AAA requires: 7:1 for normal text, 4.5:1 for large text."
    },
    {
      question: "How do I check color contrast?",
      answer: "Select your foreground (text) color and background color using the color pickers. You can input colors in HEX, RGB, or HSL format. The tool automatically calculates the contrast ratio and shows WCAG compliance status (AA, AAA, or fail)."
    },
    {
      question: "Why is color contrast important?",
      answer: "Good color contrast ensures text is readable for all users, including those with visual impairments, color blindness, or viewing screens in bright sunlight. It's also required for web accessibility compliance."
    },
    {
      question: "Can I test for color blindness?",
      answer: "Yes! The tool includes color blindness simulation (Protanopia, Deuteranopia, Tritanopia) to see how your color combinations appear to users with color vision deficiencies."
    },
    {
      question: "What color formats are supported?",
      answer: "The tool supports HEX (#RRGGBB), RGB (rgb(r, g, b)), RGBA (rgba(r, g, b, a)), HSL (hsl(h, s%, l%)), and HSLA (hsla(h, s%, l%, a)) formats for maximum flexibility."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Select Color Format",
      text: "Choose your preferred color format: HEX, RGB/RGBA, or HSL/HSLA. This allows you to work with colors in your preferred format."
    },
    {
      name: "Select Text Color",
      text: "Choose your foreground (text) color using the color picker or enter a color code. This is the color of the text you want to check."
    },
    {
      name: "Select Background Color",
      text: "Choose your background color using the color picker or enter a color code. This is the color behind the text."
    },
    {
      name: "Choose UI Element Type",
      text: "Select the type of UI element you're testing: text, button, link, border, or icon. Different elements have different contrast requirements."
    },
    {
      name: "Test Color Blindness",
      text: "Use the color blindness simulator to see how your colors appear to users with Protanopia, Deuteranopia, or Tritanopia."
    },
    {
      name: "View Results & Suggestions",
      text: "See the calculated contrast ratio and WCAG compliance status. If contrast is insufficient, use the color suggestions to find better alternatives."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Check Color Contrast for WCAG Compliance",
      "Learn how to check color contrast ratios for WCAG accessibility compliance using our free online contrast checker tool with support for multiple color formats and color blindness simulation.",
      howToSteps,
      "PT3M"
    ),
    generateSoftwareApplicationSchema(
      "Contrast Checker",
      "Free online contrast checker. Check color contrast ratios for WCAG accessibility compliance. Test text and background colors for AA and AAA standards. Supports HEX, RGB, HSL formats. Color blindness simulation included.",
      "https://prylad.pro/contrast-checker",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🎯 Contrast Checker"
        description="Check color contrast ratio for WCAG accessibility compliance. Test text and background colors for AA and AAA standards. Supports HEX, RGB, HSL formats with color blindness simulation."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* UI Element Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                UI Element Type
              </label>
              <div className="flex flex-wrap gap-2">
                {(['text', 'button', 'link', 'border', 'icon'] as UIElement[]).map((element) => (
                  <button
                    key={element}
                    onClick={() => setUIElement(element)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      uiElement === element
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {element.charAt(0).toUpperCase() + element.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Text Color (Foreground)
                  </label>
                  <select
                    value={fgFormat}
                    onChange={(e) => handleFgFormatChange(e.target.value as ColorFormat)}
                    className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="hex">HEX</option>
                    <option value="rgb">RGB</option>
                    <option value="hsl">HSL</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={fgFormat === 'hex' ? foreground : rgbToHex(fgRgb || { r: 0, g: 0, b: 0 })}
                    onChange={(e) => {
                      setForeground(e.target.value)
                      setFgFormat('hex')
                    }}
                    className="w-16 h-16 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    placeholder={fgFormat === 'hex' ? '#000000' : fgFormat === 'rgb' ? 'rgb(0, 0, 0)' : 'hsl(0, 0%, 0%)'}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Background Color
                  </label>
                  <select
                    value={bgFormat}
                    onChange={(e) => handleBgFormatChange(e.target.value as ColorFormat)}
                    className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="hex">HEX</option>
                    <option value="rgb">RGB</option>
                    <option value="hsl">HSL</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={bgFormat === 'hex' ? background : rgbToHex(bgRgb || { r: 255, g: 255, b: 255 })}
                    onChange={(e) => {
                      setBackground(e.target.value)
                      setBgFormat('hex')
                    }}
                    className="w-16 h-16 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    placeholder={bgFormat === 'hex' ? '#ffffff' : bgFormat === 'rgb' ? 'rgb(255, 255, 255)' : 'hsl(0, 0%, 100%)'}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Color Blindness Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Color Blindness Simulation
              </label>
              <div className="flex flex-wrap gap-2">
                {(['normal', 'protanopia', 'deuteranopia', 'tritanopia'] as ColorBlindnessType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setColorBlindness(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      colorBlindness === type
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type === 'normal' ? 'Normal Vision' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Preview
              </label>
              <div
                className="p-8 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                style={{ backgroundColor: bgDisplay }}
              >
                <div className="space-y-4">
                  {uiElement === 'text' && (
                    <>
                      <h2
                        style={{ color: fgDisplay }}
                        className="text-3xl font-bold"
                      >
                        Large Text (18pt+)
                      </h2>
                      <p
                        style={{ color: fgDisplay }}
                        className="text-base"
                      >
                        Normal Text - The quick brown fox jumps over the lazy dog. This is a sample text to preview the contrast.
                      </p>
                    </>
                  )}
                  {uiElement === 'button' && (
                    <button
                      style={{ 
                        backgroundColor: bgDisplay,
                        color: fgDisplay,
                        borderColor: fgDisplay
                      }}
                      className="px-6 py-3 rounded-lg border-2 font-semibold"
                    >
                      Button Text
                    </button>
                  )}
                  {uiElement === 'link' && (
                    <a
                      href="#"
                      style={{ color: fgDisplay }}
                      className="text-lg underline font-medium"
                    >
                      Link Text Example
                    </a>
                  )}
                  {uiElement === 'border' && (
                    <div
                      style={{ 
                        borderColor: fgDisplay,
                        backgroundColor: bgDisplay
                      }}
                      className="border-4 p-4 rounded-lg"
                    >
                      Border Preview
                    </div>
                  )}
                  {uiElement === 'icon' && (
                    <div
                      style={{ color: fgDisplay }}
                      className="text-4xl"
                    >
                      ⭐ Icon Preview
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results */}
            {contrastResult && (
              <div className={`p-6 rounded-lg border-2 ${getLevelBg(contrastResult.level)}`}>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Contrast Ratio
                      </h3>
                      <span className={`text-2xl font-bold ${getLevelColor(contrastResult.level)}`}>
                        {contrastResult.ratio.toFixed(2)}:1
                      </span>
                    </div>
                    <p className={`text-sm font-medium ${getLevelColor(contrastResult.level)}`}>
                      {contrastResult.level === 'aaa' && '✅ AAA - Excellent contrast'}
                      {contrastResult.level === 'aaa-large' && '✅ AAA Large Text - Excellent contrast'}
                      {contrastResult.level === 'aa' && '✅ AA - Good contrast'}
                      {contrastResult.level === 'aa-large' && '⚠️ AA Large Text - Passes for large text only'}
                      {contrastResult.level === 'fail' && '❌ Fail - Does not meet WCAG standards'}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Contrast Ratio</span>
                      <span>{contrastResult.ratio.toFixed(2)}:1 / 21:1</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          contrastResult.level === 'fail' ? 'bg-red-500' :
                          contrastResult.level === 'aa-large' ? 'bg-yellow-500' :
                          contrastResult.level === 'aa' ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, (contrastResult.ratio / 21) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                      <span>3:1</span>
                      <span>4.5:1</span>
                      <span>7:1</span>
                      <span>21:1</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">WCAG AA</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Normal Text ({getRequiredRatio(uiElement).normal}:1)</span>
                          <span className={contrastResult.aaNormal ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                            {contrastResult.aaNormal ? '✓ Pass' : '✗ Fail'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Large Text ({getRequiredRatio(uiElement).large}:1)</span>
                          <span className={contrastResult.aaLarge ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                            {contrastResult.aaLarge ? '✓ Pass' : '✗ Fail'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">WCAG AAA</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Normal Text (7:1)</span>
                          <span className={contrastResult.aaaNormal ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                            {contrastResult.aaaNormal ? '✓ Pass' : '✗ Fail'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Large Text (4.5:1)</span>
                          <span className={contrastResult.aaaLarge ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                            {contrastResult.aaaLarge ? '✓ Pass' : '✗ Fail'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Color Suggestions */}
            {getColorSuggestions && getColorSuggestions.length > 0 && contrastResult && contrastResult.ratio < 4.5 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  💡 Color Suggestions to Improve Contrast
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Try these color adjustments to achieve better contrast:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getColorSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div
                        className="w-12 h-12 rounded border-2 border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: suggestion.color }}
                      />
                      <div className="flex-1">
                        <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
                          {suggestion.color}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {suggestion.isForeground ? 'Foreground' : 'Background'} • Ratio: {suggestion.ratio.toFixed(2)}:1
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (suggestion.isForeground) {
                            setForeground(suggestion.color)
                            setFgFormat('hsl')
                          } else {
                            setBackground(suggestion.color)
                            setBgFormat('hsl')
                          }
                        }}
                        className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CSS Output */}
            {contrastResult && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    CSS Code
                  </label>
                  <button
                    onClick={() => copyToClipboard(`color: ${fgDisplay};\nbackground-color: ${bgDisplay};`, 'css')}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {copied === 'css' ? '✓ Copied' : 'Copy CSS'}
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <pre className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    <code>{`color: ${fgDisplay};\nbackground-color: ${bgDisplay};`}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">About WCAG Contrast Standards</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong className="text-gray-900 dark:text-gray-100">WCAG AA:</strong> Minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt+ bold).
            </p>
            <p>
              <strong className="text-gray-900 dark:text-gray-100">WCAG AAA:</strong> Enhanced contrast ratio of 7:1 for normal text and 4.5:1 for large text.
            </p>
            <p>
              Large text is defined as 18pt (24px) or larger, or 14pt (18.67px) or larger if bold.
            </p>
            <p className="mt-3">
              <strong className="text-gray-900 dark:text-gray-100">Color Formats Supported:</strong> HEX (#RRGGBB), RGB (rgb(r, g, b)), RGBA (rgba(r, g, b, a)), HSL (hsl(h, s%, l%)), HSLA (hsla(h, s%, l%, a))
            </p>
            <p>
              <strong className="text-gray-900 dark:text-gray-100">Color Blindness Types:</strong> Protanopia (red-green, difficulty seeing red), Deuteranopia (red-green, difficulty seeing green), Tritanopia (blue-yellow, difficulty seeing blue)
            </p>
          </div>
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
