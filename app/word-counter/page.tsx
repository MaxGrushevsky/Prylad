'use client'

import { useState, useMemo, useCallback } from 'react'
import Layout from '@/components/Layout'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
export default function WordCounterPage() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/) : []
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()) : []
    const sentences = text.match(/[.!?]+/g)?.length || 0
    const lines = text.split('\n').length
    const numbers = (text.match(/\d/g) || []).length
    const uppercase = (text.match(/[A-Z]/g) || []).length
    const lowercase = (text.match(/[a-z]/g) || []).length
    const specialChars = (text.match(/[^a-zA-Z0-9\s]/g) || []).length
    
    // Reading time estimate (average 200 words per minute)
    const readingTimeMinutes = words.length > 0 ? Math.ceil(words.length / 200) : 0
    
    // Average word length
    const avgWordLength = words.length > 0 
      ? (words.reduce((sum, word) => sum + word.length, 0) / words.length).toFixed(1)
      : '0'

    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      paragraphs: paragraphs.length,
      sentences,
      lines,
      numbers,
      uppercase,
      lowercase,
      specialChars,
      readingTimeMinutes,
      avgWordLength,
    }
  }, [text])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
    }
  }

  const exportToFile = () => {
    if (!text) return
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `text-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const clearText = () => {
    setText('')
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: () => exportToFile(),
    onClear: () => clearText()
  })

  return (
    <>
      <Layout
      title="🔢 Word & Character Counter"
      description="Count words, characters, paragraphs, sentences, and more. Free online word counter with detailed statistics, reading time, and export options."
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Input */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Text Input:</h2>
              <div className="flex gap-2">
                {text && (
                  <>
                    <button
                      onClick={exportToFile}
                      className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors text-xs flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export
                    </button>
                    <button
                      onClick={clearText}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-xs"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-96 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Enter or paste text for analysis..."
            />
          </div>

          {/* Statistics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-6">Statistics:</h2>
            <div className="space-y-4">
              {/* Main Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">Words</div>
                  <div className="text-3xl font-bold text-blue-700">{stats.words}</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="text-sm text-gray-600 mb-1">Characters</div>
                  <div className="text-3xl font-bold text-green-700">{stats.characters}</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="text-sm text-gray-600 mb-1">No Spaces</div>
                  <div className="text-3xl font-bold text-purple-700">{stats.charactersNoSpaces}</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="text-sm text-gray-600 mb-1">Paragraphs</div>
                  <div className="text-3xl font-bold text-orange-700">{stats.paragraphs}</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg border border-pink-200">
                  <div className="text-sm text-gray-600 mb-1">Sentences</div>
                  <div className="text-3xl font-bold text-pink-700">{stats.sentences}</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg border border-teal-200">
                  <div className="text-sm text-gray-600 mb-1">Lines</div>
                  <div className="text-3xl font-bold text-teal-700">{stats.lines}</div>
                </div>
              </div>

              {/* Reading Time */}
              {stats.words > 0 && (
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                  <div className="text-sm text-gray-600 mb-1">Reading Time</div>
                  <div className="text-2xl font-bold text-indigo-700">
                    {stats.readingTimeMinutes} {stats.readingTimeMinutes === 1 ? 'minute' : 'minutes'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">(at 200 words/minute)</p>
                </div>
              )}

              {/* Detailed Stats */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Character Breakdown:</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uppercase:</span>
                    <span className="font-semibold text-gray-900">{stats.uppercase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lowercase:</span>
                    <span className="font-semibold text-gray-900">{stats.lowercase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Numbers:</span>
                    <span className="font-semibold text-gray-900">{stats.numbers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Special:</span>
                    <span className="font-semibold text-gray-900">{stats.specialChars}</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-600">Avg Word Length:</span>
                    <span className="font-semibold text-gray-900">{stats.avgWordLength} chars</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Use a Word Counter?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Word and character counting is essential for writers, students, content creators, and developers. 
                Whether you're writing an article with a word limit, creating social media posts with character 
                restrictions, or analyzing text data, knowing the exact word and character count is crucial.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free word counter provides comprehensive text analysis including word count, character count 
                (with and without spaces), paragraph count, sentence count, reading time estimates, and detailed 
                character breakdowns. All analysis happens instantly in your browser as you type.
              </p>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Writing & Content</h3>
                <p className="text-gray-700 text-sm">
                  Track word count for articles, essays, blog posts, or any written content. Meet word limits 
                  for assignments, publications, or content requirements.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📱 Social Media</h3>
                <p className="text-gray-700 text-sm">
                  Count characters for Twitter (280), Facebook, LinkedIn, and other social media platforms. 
                  Ensure your posts fit within platform limits.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 SEO & Marketing</h3>
                <p className="text-gray-700 text-sm">
                  Analyze content length for SEO optimization. Track meta descriptions (150-160 characters), 
                  titles (50-60 characters), and article length for optimal search rankings.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💻 Development</h3>
                <p className="text-gray-700 text-sm">
                  Validate input length for forms, text fields, and API payloads. Ensure content meets 
                  database field limits and validation requirements.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Comprehensive Statistics</h3>
                  <p className="text-gray-700 text-sm">
                    Count words, characters (with/without spaces), paragraphs, sentences, lines, and more. 
                    Get detailed character breakdowns including uppercase, lowercase, numbers, and special characters.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Reading Time</h3>
                  <p className="text-gray-700 text-sm">
                    Estimate reading time based on average reading speed (200 words per minute). Helpful 
                    for content planning and user experience optimization.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Real-time Analysis</h3>
                  <p className="text-gray-700 text-sm">
                    Statistics update instantly as you type. No need to click buttons or wait for processing. 
                    See counts change in real-time.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📥</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Export Options</h3>
                  <p className="text-gray-700 text-sm">
                    Export your text to a file for backup or further processing. Copy statistics or text 
                    to clipboard for easy sharing.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Average Word Length</h3>
                  <p className="text-gray-700 text-sm">
                    Calculate average word length to understand text complexity. Useful for readability 
                    analysis and content optimization.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Privacy First</h3>
                  <p className="text-gray-700 text-sm">
                    All text analysis happens locally in your browser. We never see, store, or have 
                    access to your text or statistics.
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
                <h3 className="font-semibold text-gray-900 mb-2">How is word count calculated?</h3>
                <p className="text-gray-700 text-sm">
                  Words are counted by splitting text on whitespace (spaces, tabs, newlines). Each sequence 
                  of non-whitespace characters is counted as one word. This matches the standard word counting 
                  method used by most word processors.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What's the difference between characters and characters (no spaces)?</h3>
                <p className="text-gray-700 text-sm">
                  "Characters" includes all characters including spaces, while "Characters (no spaces)" excludes 
                  all whitespace. The no-spaces count is useful for platforms with strict character limits or 
                  when calculating actual content length.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How is reading time calculated?</h3>
                <p className="text-gray-700 text-sm">
                  Reading time is estimated based on an average reading speed of 200 words per minute. This is 
                  a standard estimate for general reading. Actual reading time varies based on content complexity 
                  and reader speed.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you store my text?</h3>
                <p className="text-gray-700 text-sm">
                  No, absolutely not. All text analysis happens entirely in your browser. We never see, store, 
                  transmit, or have any access to your text or statistics. Your privacy is completely protected.
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

