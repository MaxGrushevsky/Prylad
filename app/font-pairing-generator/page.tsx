'use client'

import { useState, useCallback, useMemo } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'
interface FontPairing {
  heading: string
  body: string
  headingName: string
  bodyName: string
  description: string
}

const fontPairings: FontPairing[] = [
  {
    heading: 'Playfair Display',
    body: 'Source Sans Pro',
    headingName: 'Playfair Display',
    bodyName: 'Source Sans Pro',
    description: 'Elegant serif with modern sans-serif'
  },
  {
    heading: 'Montserrat',
    body: 'Merriweather',
    headingName: 'Montserrat',
    bodyName: 'Merriweather',
    description: 'Bold sans-serif with readable serif'
  },
  {
    heading: 'Roboto',
    body: 'Roboto Slab',
    headingName: 'Roboto',
    bodyName: 'Roboto Slab',
    description: 'Modern sans-serif with slab serif'
  },
  {
    heading: 'Oswald',
    body: 'Lato',
    headingName: 'Oswald',
    bodyName: 'Lato',
    description: 'Condensed with clean sans-serif'
  },
  {
    heading: 'Raleway',
    body: 'Open Sans',
    headingName: 'Raleway',
    bodyName: 'Open Sans',
    description: 'Elegant sans-serif with friendly sans-serif'
  },
  {
    heading: 'Poppins',
    body: 'Lora',
    headingName: 'Poppins',
    bodyName: 'Lora',
    description: 'Geometric sans-serif with serif'
  },
  {
    heading: 'Bebas Neue',
    body: 'Roboto',
    headingName: 'Bebas Neue',
    bodyName: 'Roboto',
    description: 'Bold display with versatile sans-serif'
  },
  {
    heading: 'Crimson Text',
    body: 'Lato',
    headingName: 'Crimson Text',
    bodyName: 'Lato',
    description: 'Classic serif with modern sans-serif'
  },
  {
    heading: 'Fjalla One',
    body: 'Source Sans Pro',
    headingName: 'Fjalla One',
    bodyName: 'Source Sans Pro',
    description: 'Condensed with clean sans-serif'
  },
  {
    heading: 'Abril Fatface',
    body: 'Lato',
    headingName: 'Abril Fatface',
    bodyName: 'Lato',
    description: 'Decorative with readable sans-serif'
  },
  {
    heading: 'Ubuntu',
    body: 'Lora',
    headingName: 'Ubuntu',
    bodyName: 'Lora',
    description: 'Modern sans-serif with serif'
  },
  {
    heading: 'PT Sans',
    body: 'PT Serif',
    headingName: 'PT Sans',
    bodyName: 'PT Serif',
    description: 'Matching sans-serif and serif family'
  }
]

export default function FontPairingGeneratorPage() {
  const [selectedPairing, setSelectedPairing] = useState<FontPairing>(fontPairings[0])
  const [headingSize, setHeadingSize] = useState(48)
  const [bodySize, setBodySize] = useState(16)
  const [sampleText, setSampleText] = useState('The quick brown fox jumps over the lazy dog')
  const googleFontsLink = useMemo(() => {
    const headingFont = selectedPairing.heading.replace(/\s+/g, '+')
    const bodyFont = selectedPairing.body.replace(/\s+/g, '+')
    return `https://fonts.googleapis.com/css2?family=${headingFont}:wght@400;700&family=${bodyFont}:wght@400;700&display=swap`
  }, [selectedPairing])

  const cssCode = useMemo(() => {
    return `/* Add to your HTML <head> */
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${googleFontsLink}" rel="stylesheet">

/* CSS */
h1, h2, h3, h4, h5, h6 {
  font-family: '${selectedPairing.headingName}', serif;
}

body, p {
  font-family: '${selectedPairing.bodyName}', sans-serif;
}`
  }, [selectedPairing, googleFontsLink])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Silent fail
    }
  }

  // SEO data
  const toolPath = '/font-pairing-generator'
  const toolName = 'Font Pairing Generator'
  const category = 'design'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is a font pairing?",
      answer: "A font pairing is a combination of two fonts (typically one for headings and one for body text) that work well together visually. Good font pairings create contrast and harmony, making text more readable and visually appealing."
    },
    {
      question: "How do I find a good font pairing?",
      answer: "Browse through curated font pairings from Google Fonts, preview how they look together, and select the one that matches your design style. Each pairing includes a heading font and a body font that complement each other."
    },
    {
      question: "Can I use custom fonts?",
      answer: "Yes! Select 'Custom' mode and enter any Google Font name for both heading and body text. The tool will load and preview your custom font combination."
    },
    {
      question: "What makes a good font pairing?",
      answer: "Good font pairings combine contrast (different styles, weights, or families) with harmony (complementary characteristics). Common strategies: serif + sans-serif, bold + regular, or contrasting weights of the same family."
    },
    {
      question: "How do I use the font pairing in my project?",
      answer: "Copy the Google Fonts import link and CSS code provided. Add the import link to your HTML <head> and use the CSS font-family values in your stylesheets. The code is ready to use immediately."
    },
    {
      question: "Is the font pairing generator free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All font pairings use Google Fonts, which are free to use in any project."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Browse Font Pairings",
      text: "Scroll through curated font pairings from Google Fonts. Each pairing shows a heading font and a body font that work well together, with a description of the style."
    },
    {
      name: "Preview Pairing",
      text: "Click on a font pairing to see a live preview with sample heading and body text. The preview shows exactly how the fonts look together."
    },
    {
      name: "Use Custom Fonts (Optional)",
      text: "Select 'Custom' mode and enter any Google Font name for heading and body text. The tool will load and preview your custom combination."
    },
    {
      name: "Copy Import Link",
      text: "Copy the Google Fonts import link provided. Add this link to your HTML <head> section to load the fonts."
    },
    {
      name: "Copy CSS Code",
      text: "Copy the CSS font-family values and use them in your stylesheets. Apply the heading font to headings and the body font to body text."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Find and Use Font Pairings",
      "Learn how to discover beautiful font pairings from Google Fonts and use them in your projects using our free online font pairing generator tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Font Pairing Generator",
      "Free online font pairing generator. Discover beautiful font pairings from Google Fonts. Preview heading and body text combinations. Get CSS code and import links. Perfect for web designers.",
      "https://prylad.pro/font-pairing-generator",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🔤 Font Pairing Generator"
        description="Discover beautiful font pairings from Google Fonts. Preview heading and body text combinations."
        breadcrumbs={breadcrumbs}
      >
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            {/* Preview */}
            <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-xl">
              <div className="space-y-4">
                <h1
                  style={{
                    fontFamily: `'${selectedPairing.heading}', serif`,
                    fontSize: `${headingSize}px`,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: '#1f2937'
                  }}
                  className="dark:text-gray-100"
                >
                  {sampleText}
                </h1>
                <p
                  style={{
                    fontFamily: `'${selectedPairing.body}', sans-serif`,
                    fontSize: `${bodySize}px`,
                    lineHeight: 1.6,
                    color: '#4b5563'
                  }}
                  className="dark:text-gray-300"
                >
                  {sampleText} {sampleText.toLowerCase()}
                </p>
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Sample Text
                </label>
                <input
                  type="text"
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Heading Size: {headingSize}px
                </label>
                <input
                  type="range"
                  min="24"
                  max="72"
                  value={headingSize}
                  onChange={(e) => setHeadingSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Body Size: {bodySize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={bodySize}
                  onChange={(e) => setBodySize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
            </div>

            {/* Font Pairings Grid */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Select Font Pairing
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fontPairings.map((pairing, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPairing(pairing)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedPairing.heading === pairing.heading
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-gray-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div
                        style={{ fontFamily: `'${pairing.heading}', serif` }}
                        className="text-xl font-bold text-gray-900 dark:text-gray-100"
                      >
                        {pairing.headingName}
                      </div>
                      <div
                        style={{ fontFamily: `'${pairing.body}', sans-serif` }}
                        className="text-sm text-gray-600 dark:text-gray-400"
                      >
                        {pairing.bodyName}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {pairing.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* CSS Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  CSS Code
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(cssCode)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Copy CSS
                  </button>
                  <button
                    onClick={() => copyToClipboard(googleFontsLink)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
                  <code>{cssCode}</code>
                </pre>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Fonts are loaded from Google Fonts. Make sure to add the link tag to your HTML head before using the fonts in your CSS.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is Font Pairing?</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Font pairing is the art of combining two or more typefaces that complement each other to create 
            visually appealing and readable typography. Good font pairings create contrast and hierarchy while 
            maintaining harmony in your design.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            The key to successful font pairing is finding fonts that have enough contrast to be distinct but 
            share enough characteristics to work together. Common strategies include pairing serif with sans-serif, 
            or using different weights of the same font family.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Font Pairing Principles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🎯 Contrast</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Pair fonts with different characteristics (serif/sans-serif, weight, size) to create visual hierarchy.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🎨 Harmony</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Choose fonts that share similar proportions, x-height, or design philosophy for cohesion.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📖 Readability</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Ensure both fonts are highly readable at their intended sizes and contexts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">⚖️ Balance</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Use one font for headings and another for body text, maintaining clear visual distinction.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Best Practices</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Limit Fonts:</strong> Use 2-3 fonts maximum to avoid visual clutter and maintain consistency.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Size Ratio:</strong> Maintain a clear size difference between heading and body fonts (typically 1.5-2x).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Test Readability:</strong> Always test font pairings at actual sizes and in context before finalizing.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Google Fonts:</strong> All fonts in this tool are from Google Fonts, ensuring fast loading and wide compatibility.</span>
            </li>
          </ul>
        </section>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Design Tools" />
      )}
    </Layout>
    </>
  )
}

