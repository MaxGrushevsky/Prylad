'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
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

  return (
    <>
      <Layout
        title="🔗 URL Slug Generator"
      description="Generate URL-friendly slugs from text. Create SEO-friendly slugs for URLs, filenames, and identifiers. Free online slug generator with customizable options."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6">
          <div className="space-y-6">
            {/* Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Source Text:</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Enter text to generate slug..."
              />
              {input && (
                <p className="text-xs text-gray-500 mt-1">
                  {input.length} characters
                </p>
              )}
            </div>

            {/* Options */}
            <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <label className="block text-xs text-gray-600 mb-2">Separator:</label>
                <div className="flex gap-2">
                  {(['-', '_', ''] as Separator[]).map((sep) => (
                    <button
                      key={sep || 'none'}
                      onClick={() => setSeparator(sep)}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                        separator === sep
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
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
                <label htmlFor="lowercase" className="text-sm text-gray-700 cursor-pointer">
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
                <label htmlFor="remove-special" className="text-sm text-gray-700 cursor-pointer">
                  Remove special chars
                </label>
              </div>
            </div>

            {/* Auto-generate option */}
            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <input
                type="checkbox"
                id="auto-generate"
                checked={autoGenerate}
                onChange={(e) => setAutoGenerate(e.target.checked)}
                className="w-4 h-4 accent-primary-600"
              />
              <label htmlFor="auto-generate" className="text-sm text-gray-700 cursor-pointer flex-1">
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
                  <label className="block text-sm font-semibold text-gray-700">Generated Slug:</label>
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
                <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                  <code className="text-lg font-mono break-all">{slug}</code>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>URL Preview:</strong> <span className="font-mono text-xs">https://example.com/{slug}</span>
                  </p>
                </div>
                {totalGenerated > 0 && (
                  <p className="text-xs text-gray-500 text-center">
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
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is a URL Slug?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                A URL slug is the part of a URL that identifies a specific page or resource in a human-readable 
                format. Slugs are typically derived from the page title or content and are used in URLs to make 
                them more descriptive and SEO-friendly. For example, in the URL <code className="bg-gray-100 px-2 py-1 rounded">https://example.com/blog/my-awesome-post</code>, 
                "my-awesome-post" is the slug.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Good slugs are lowercase, use hyphens or underscores to separate words, remove special characters, 
                and are concise yet descriptive. They improve SEO, user experience, and make URLs easier to share 
                and remember.
              </p>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🌐 Website URLs</h3>
                <p className="text-gray-700 text-sm">
                  Generate SEO-friendly slugs for blog posts, articles, product pages, and other website content. 
                  Improve search engine rankings and user experience.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📁 File Names</h3>
                <p className="text-gray-700 text-sm">
                  Create clean, URL-friendly file names from titles or descriptions. Perfect for organizing 
                  files and ensuring cross-platform compatibility.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💻 API Endpoints</h3>
                <p className="text-gray-700 text-sm">
                  Generate consistent resource identifiers for REST APIs. Create predictable, readable 
                  endpoint paths from resource names.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🗄️ Database Fields</h3>
                <p className="text-gray-700 text-sm">
                  Create slug fields for database records. Use slugs as unique identifiers or for generating 
                  friendly URLs from database content.
                </p>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices for URL Slugs</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">1.</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Keep It Short and Descriptive</h3>
                  <p className="text-gray-700 text-sm">
                    Slugs should be concise but descriptive. Aim for 3-5 words that accurately represent the content. 
                    Avoid unnecessary words like "the", "a", "an" unless they're essential.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">2.</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Use Hyphens, Not Underscores</h3>
                  <p className="text-gray-700 text-sm">
                    Search engines treat hyphens as word separators, while underscores are often ignored. Use hyphens 
                    for better SEO. However, underscores are acceptable for database field names.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">3.</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Remove Special Characters</h3>
                  <p className="text-gray-700 text-sm">
                    Special characters can cause encoding issues and make URLs harder to read. Remove or replace 
                    special characters with their text equivalents when possible.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-600 font-bold">4.</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Use Lowercase</h3>
                  <p className="text-gray-700 text-sm">
                    URLs are case-sensitive on some servers. Using lowercase ensures consistency and prevents 
                    duplicate content issues. It also makes URLs easier to type and share.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔗</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Customizable Separators</h3>
                  <p className="text-gray-700 text-sm">
                    Choose between hyphens (-), underscores (_), or no separator. Select the format that 
                    best fits your use case and conventions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Auto-Generation</h3>
                  <p className="text-gray-700 text-sm">
                    Enable auto-generation to create slugs automatically as you type. See results instantly 
                    and adjust settings in real-time.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎛️</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Flexible Options</h3>
                  <p className="text-gray-700 text-sm">
                    Control lowercase conversion and special character removal. Customize slug generation 
                    to match your specific requirements.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Privacy First</h3>
                  <p className="text-gray-700 text-sm">
                    All slug generation happens locally in your browser. We never see, store, or have 
                    access to your text or generated slugs.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What's the best separator for URL slugs?</h3>
                <p className="text-gray-700 text-sm">
                  Hyphens (-) are generally recommended for URL slugs because search engines treat them as word 
                  separators. Underscores (_) are acceptable for database field names or when following specific 
                  conventions. No separator creates a single word, which may be less readable.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Should slugs be lowercase?</h3>
                <p className="text-gray-700 text-sm">
                  Yes, lowercase is recommended for URL slugs. URLs are case-sensitive on some servers, and 
                  using lowercase ensures consistency, prevents duplicate content issues, and makes URLs easier 
                  to type and share.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How long should a slug be?</h3>
                <p className="text-gray-700 text-sm">
                  Keep slugs concise but descriptive. Aim for 3-5 words (20-50 characters). Longer slugs 
                  can be cut off in search results and are harder to remember. Focus on the most important 
                  keywords that describe the content.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you store my generated slugs?</h3>
                <p className="text-gray-700 text-sm">
                  No, absolutely not. All slug generation happens entirely in your browser. We never see, 
                  store, transmit, or have any access to your text or generated slugs. Your privacy is 
                  completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
    </>
  )
}

