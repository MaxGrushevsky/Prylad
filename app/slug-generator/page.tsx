'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'
type Separator = '-' | '_' | ''

export default function SlugGeneratorPage() {
  const [input, setInput] = useState('')
  const [slug, setSlug] = useState('')
  const [separator, setSeparator] = useState<Separator>('-')
  const [lowercase, setLowercase] = useState(true)
  const [removeSpecialChars, setRemoveSpecialChars] = useState(true)
  const [autoGenerate, setAutoGenerate] = useState(true)
  const [totalGenerated, setTotalGenerated] = useState(0)
  const generate = useCallback(() => {
    if (!input.trim()) {
      setSlug('')
      return
    }

    let result = input.trim()
    
    if (lowercase) {
      result = result.toLowerCase()
    }
    
    if (removeSpecialChars) {
      result = result.replace(/[^\w\s-]/g, '')
    }
    
    if (separator === '-') {
      result = result.replace(/[\s_]+/g, '-')
    } else if (separator === '_') {
      result = result.replace(/[\s-]+/g, '_')
    } else {
      result = result.replace(/[\s_-]+/g, '')
    }
    
    // Remove leading/trailing separators
    if (separator) {
      result = result.replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '')
    }
    
    setSlug(result)
    setTotalGenerated(prev => prev + 1)
  }, [input, separator, lowercase, removeSpecialChars])

  // Auto-generate on input or settings change
  useEffect(() => {
    if (autoGenerate && input.trim()) {
      const timer = setTimeout(() => {
        generate()
      }, 300)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, separator, lowercase, removeSpecialChars, autoGenerate])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
    }
  }

  const exportToFile = () => {
    if (!slug) return
    const blob = new Blob([slug], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `slug-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onEnter: () => generate(),
    onSave: () => exportToFile(),
    onClear: () => {
      setInput('')
      setSlug('')
    }
  })

  // SEO data
  const toolPath = '/slug-generator'
  const toolName = 'URL Slug Generator'
  const category = 'text'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is a URL slug?",
      answer: "A URL slug is the part of a URL that identifies a specific page or resource. It's the text that appears after the domain name, typically in a human-readable format. For example, in 'example.com/blog/my-article', 'my-article' is the slug."
    },
    {
      question: "Why are URL slugs important for SEO?",
      answer: "URL slugs are important for SEO because they help search engines understand the content of a page. Descriptive, keyword-rich slugs can improve search rankings and make URLs more user-friendly and shareable."
    },
    {
      question: "What characters should be in a URL slug?",
      answer: "URL slugs should contain only lowercase letters, numbers, and hyphens or underscores. Special characters, spaces, and uppercase letters should be avoided or converted to maintain URL compatibility and readability."
    },
    {
      question: "What separator should I use for slugs?",
      answer: "Hyphens (-) are the most common and recommended separator for URL slugs as they're more SEO-friendly and readable than underscores. However, you can also use underscores (_) or no separator depending on your needs."
    },
    {
      question: "Can I customize the slug generation?",
      answer: "Yes! Our slug generator allows you to customize the separator (hyphen, underscore, or none), choose whether to convert to lowercase, and decide whether to remove special characters. You can also enable auto-generation for real-time updates."
    },
    {
      question: "Is the slug generator free to use?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All slug generation happens in your browser - we never see or store your data."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Enter Your Text",
      text: "Type or paste the text you want to convert into a URL slug. This could be a title, article name, or any text you want to make URL-friendly."
    },
    {
      name: "Choose Separator",
      text: "Select your preferred separator: hyphen (-), underscore (_), or no separator. Hyphens are most commonly used and SEO-friendly."
    },
    {
      name: "Configure Options",
      text: "Enable or disable lowercase conversion and special character removal based on your needs. These options help create clean, readable slugs."
    },
    {
      name: "Generate Slug",
      text: "The slug is generated automatically in real-time if auto-generate is enabled, or click 'Generate' to create it manually."
    },
    {
      name: "Copy and Use",
      text: "Copy the generated slug to your clipboard and use it in your URLs, permalinks, or any other place where you need a URL-friendly identifier."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Generate URL Slugs",
      "Learn how to create SEO-friendly URL slugs from text using our free online slug generator tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "URL Slug Generator",
      "Free online URL slug generator. Create SEO-friendly slugs from text with customizable separators, lowercase conversion, and special character removal.",
      "https://prylad.pro/slug-generator",
      "UtilityApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🔗 URL Slug Generator"
        description="Generate URL-friendly slugs from text. Create SEO-friendly slugs for URLs, filenames, and identifiers. Free online slug generator with customizable options."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Source Text:</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-32 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Enter text to generate slug..."
              />
              {input && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {input.length} characters
                </p>
              )}
            </div>

            {/* Options */}
            <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Separator:</label>
                <div className="flex gap-2">
                  {(['-', '_', ''] as Separator[]).map((sep) => (
                    <button
                      key={sep || 'none'}
                      onClick={() => setSeparator(sep)}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                        separator === sep
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {sep || 'None'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lowercase"
                  checked={lowercase}
                  onChange={(e) => setLowercase(e.target.checked)}
                  className="w-4 h-4 accent-primary-600"
                />
                <label htmlFor="lowercase" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  Lowercase
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remove-special"
                  checked={removeSpecialChars}
                  onChange={(e) => setRemoveSpecialChars(e.target.checked)}
                  className="w-4 h-4 accent-primary-600"
                />
                <label htmlFor="remove-special" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  Remove special chars
                </label>
              </div>
            </div>

            {/* Auto-generate option */}
            <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <input
                type="checkbox"
                id="auto-generate"
                checked={autoGenerate}
                onChange={(e) => setAutoGenerate(e.target.checked)}
                className="w-4 h-4 accent-primary-600"
              />
              <label htmlFor="auto-generate" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                Auto-generate slug as you type
              </label>
            </div>

            {/* Generate Button */}
            {!autoGenerate && (
              <button
                onClick={generate}
                disabled={!input.trim()}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Slug
              </button>
            )}

            {/* Result */}
            {slug && (
              <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Generated Slug:</label>
                  <div className="flex gap-2">
                    <button
                      onClick={exportToFile}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export
                    </button>
                    <button
                      onClick={() => copyToClipboard(slug)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                  <code className="text-lg font-mono break-all text-gray-900 dark:text-gray-100">{slug}</code>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>URL Preview:</strong> <span className="font-mono text-xs">https://example.com/{slug}</span>
                  </p>
                </div>
                {totalGenerated > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Total generated: <span className="font-semibold text-primary-600">{totalGenerated}</span> slugs
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is a URL Slug?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                A URL slug is the part of a URL that identifies a specific page or resource in a human-readable 
                format. Slugs are typically derived from the page title or content and are used in URLs to make 
                them more descriptive and SEO-friendly. For example, in the URL <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">https://example.com/blog/my-awesome-post</code>, 
                &quot;my-awesome-post&quot; is the slug.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Good slugs are lowercase, use hyphens or underscores to separate words, remove special characters, 
                and are concise yet descriptive. They improve SEO, user experience, and make URLs easier to share 
                and remember.
              </p>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🌐 Website URLs</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Generate SEO-friendly slugs for blog posts, articles, product pages, and other website content. 
                  Improve search engine rankings and user experience.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📁 File Names</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Create clean, URL-friendly file names from titles or descriptions. Perfect for organizing 
                  files and ensuring cross-platform compatibility.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">💻 API Endpoints</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Generate consistent resource identifiers for REST APIs. Create predictable, readable 
                  endpoint paths from resource names.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🗄️ Database Fields</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Create slug fields for database records. Use slugs as unique identifiers or for generating 
                  friendly URLs from database content.
                </p>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Best Practices for URL Slugs</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">1.</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Keep It Short and Descriptive</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Slugs should be concise but descriptive. Aim for 3-5 words that accurately represent the content. 
                    Avoid unnecessary words like &quot;the&quot;, &quot;a&quot;, &quot;an&quot; unless they&apos;re essential.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">2.</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Use Hyphens, Not Underscores</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Search engines treat hyphens as word separators, while underscores are often ignored. Use hyphens 
                    for better SEO. However, underscores are acceptable for database field names.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">3.</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Remove Special Characters</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Special characters can cause encoding issues and make URLs harder to read. Remove or replace 
                    special characters with their text equivalents when possible.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">4.</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Use Lowercase</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    URLs are case-sensitive on some servers. Using lowercase ensures consistency and prevents 
                    duplicate content issues. It also makes URLs easier to type and share.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔗</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Customizable Separators</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Choose between hyphens (-), underscores (_), or no separator. Select the format that 
                    best fits your use case and conventions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Auto-Generation</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Enable auto-generation to create slugs automatically as you type. See results instantly 
                    and adjust settings in real-time.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎛️</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Flexible Options</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Control lowercase conversion and special character removal. Customize slug generation 
                    to match your specific requirements.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Privacy First</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    All slug generation happens locally in your browser. We never see, store, or have 
                    access to your text or generated slugs.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the best separator for URL slugs?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Hyphens (-) are generally recommended for URL slugs because search engines treat them as word 
                  separators. Underscores (_) are acceptable for database field names or when following specific 
                  conventions. No separator creates a single word, which may be less readable.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Should slugs be lowercase?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes, lowercase is recommended for URL slugs. URLs are case-sensitive on some servers, and 
                  using lowercase ensures consistency, prevents duplicate content issues, and makes URLs easier 
                  to type and share.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How long should a slug be?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Keep slugs concise but descriptive. Aim for 3-5 words (20-50 characters). Longer slugs 
                  can be cut off in search results and are harder to remember. Focus on the most important 
                  keywords that describe the content.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Do you store my generated slugs?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, absolutely not. All slug generation happens entirely in your browser. We never see, 
                  store, transmit, or have any access to your text or generated slugs. Your privacy is 
                  completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Text Tools" />
      )}
    </Layout>
    </>
  )
}

