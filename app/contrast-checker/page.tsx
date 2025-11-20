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

export default function ContrastCheckerPage() {
  const [foreground, setForeground] = useState('#000000')
  const [background, setBackground] = useState('#ffffff')
  const hexToRgb = useCallback((hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }, [])

  const getLuminance = useCallback((r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(val => {
      val = val / 255
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }, [])

  const getContrastRatio = useCallback((color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }): number => {
    const lum1 = getLuminance(color1.r, color1.g, color1.b)
    const lum2 = getLuminance(color2.r, color2.g, color2.b)
    const lighter = Math.max(lum1, lum2)
    const darker = Math.min(lum1, lum2)
    return (lighter + 0.05) / (darker + 0.05)
  }, [getLuminance])

  const contrastResult = useMemo((): ContrastResult | null => {
    const fgRgb = hexToRgb(foreground)
    const bgRgb = hexToRgb(background)
    
    if (!fgRgb || !bgRgb) return null

    const ratio = getContrastRatio(fgRgb, bgRgb)
    
    // WCAG standards
    const aaNormal = ratio >= 4.5  // Normal text (AA)
    const aaLarge = ratio >= 3      // Large text (AA) - 18pt+ or 14pt+ bold
    const aaaNormal = ratio >= 7   // Normal text (AAA)
    const aaaLarge = ratio >= 4.5  // Large text (AAA)

    let level: ContrastResult['level'] = 'fail'
    if (ratio >= 7) level = 'aaa'
    else if (ratio >= 4.5) level = 'aaa-large'
    else if (ratio >= 3) level = 'aa-large'
    else if (ratio >= 4.5) level = 'aa'
    else level = 'fail'

    return {
      ratio,
      aaNormal,
      aaLarge,
      aaaNormal,
      aaaLarge,
      level
    }
  }, [foreground, background, hexToRgb, getContrastRatio])

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Silent fail
    }
  }

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
      answer: "Select your foreground (text) color and background color using the color pickers. The tool automatically calculates the contrast ratio and shows WCAG compliance status (AA, AAA, or fail)."
    },
    {
      question: "Why is color contrast important?",
      answer: "Good color contrast ensures text is readable for all users, including those with visual impairments, color blindness, or viewing screens in bright sunlight. It's also required for web accessibility compliance."
    },
    {
      question: "What does the contrast ratio mean?",
      answer: "Contrast ratio ranges from 1:1 (same color, no contrast) to 21:1 (maximum contrast, black on white). Higher ratios mean better readability. WCAG recommends minimum 4.5:1 for normal text."
    },
    {
      question: "Is the contrast checker free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All contrast calculations happen in your browser - we never see or store your color choices."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Select Text Color",
      text: "Choose your foreground (text) color using the color picker or enter a hex code. This is the color of the text you want to check."
    },
    {
      name: "Select Background Color",
      text: "Choose your background color using the color picker or enter a hex code. This is the color behind the text."
    },
    {
      name: "View Contrast Ratio",
      text: "See the calculated contrast ratio displayed immediately. The ratio shows how much the colors differ in brightness."
    },
    {
      name: "Check WCAG Compliance",
      text: "View WCAG compliance status: AA (normal/large text), AAA (normal/large text), or fail. The tool shows which standards your color combination meets."
    },
    {
      name: "Adjust Colors",
      text: "If contrast is insufficient, adjust either the text or background color until you achieve WCAG AA or AAA compliance for better accessibility."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Check Color Contrast for WCAG Compliance",
      "Learn how to check color contrast ratios for WCAG accessibility compliance using our free online contrast checker tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Contrast Checker",
      "Free online contrast checker. Check color contrast ratios for WCAG accessibility compliance. Test text and background colors for AA and AAA standards. Real-time calculations.",
      "https://prylad.pro/contrast-checker",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🎯 Contrast Checker"
        description="Check color contrast ratio for WCAG accessibility compliance. Test text and background colors for AA and AAA standards."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            {/* Color Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Text Color (Foreground)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    className="w-16 h-16 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="text"
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-16 h-16 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="text"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Preview
              </label>
              <div
                className="p-8 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                style={{ backgroundColor: background }}
              >
                <div className="space-y-4">
                  <h2
                    style={{ color: foreground }}
                    className="text-3xl font-bold"
                  >
                    Large Text (18pt+)
                  </h2>
                  <p
                    style={{ color: foreground }}
                    className="text-base"
                  >
                    Normal Text - The quick brown fox jumps over the lazy dog. This is a sample text to preview the contrast.
                  </p>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">WCAG AA</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Normal Text (4.5:1)</span>
                          <span className={contrastResult.aaNormal ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                            {contrastResult.aaNormal ? '✓ Pass' : '✗ Fail'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Large Text (3:1)</span>
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

            {/* CSS Output */}
            {contrastResult && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    CSS Code
                  </label>
                  <button
                    onClick={() => copyToClipboard(`color: ${foreground};\nbackground-color: ${background};`)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Copy CSS
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <pre className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    <code>{`color: ${foreground};\nbackground-color: ${background};`}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
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

