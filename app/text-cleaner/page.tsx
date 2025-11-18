'use client'

import { useState, useCallback } from 'react'
import Layout from '@/components/Layout'

type CleanType = 'spaces' | 'allSpaces' | 'duplicates' | 'emptyLines' | 'trim' | 'specialChars' | 'numbers' | 'letters' | 'all'

export default function TextCleanerPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [selectedClean, setSelectedClean] = useState<CleanType | null>(null)
  const [totalCleaned, setTotalCleaned] = useState(0)

  const clean = useCallback((type: CleanType) => {
    if (!input.trim()) {
      setResult('')
      return
    }

    let cleaned = input
    switch (type) {
      case 'spaces':
        cleaned = input.replace(/\s+/g, ' ').trim()
        break
      case 'allSpaces':
        cleaned = input.replace(/\s/g, '')
        break
      case 'duplicates':
        cleaned = [...new Set(input.split('\n'))].join('\n')
        break
      case 'emptyLines':
        cleaned = input.split('\n').filter(line => line.trim()).join('\n')
        break
      case 'trim':
        cleaned = input.split('\n').map(line => line.trim()).join('\n')
        break
      case 'specialChars':
        cleaned = input.replace(/[^a-zA-Z0-9\s]/g, '')
        break
      case 'numbers':
        cleaned = input.replace(/\d/g, '')
        break
      case 'letters':
        cleaned = input.replace(/[a-zA-Z]/g, '')
        break
      case 'all':
        cleaned = input
          .replace(/\s+/g, ' ')
          .trim()
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.trim())
        cleaned = [...new Set(cleaned)].join('\n')
        break
      default:
        cleaned = input
    }
    setResult(cleaned)
    setSelectedClean(type)
    setTotalCleaned(prev => prev + 1)
  }, [input])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportToFile = () => {
    if (!result) return
    const blob = new Blob([result], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cleaned-text-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getStats = () => {
    if (!input || !result) return null
    return {
      originalLength: input.length,
      cleanedLength: result.length,
      removed: input.length - result.length,
      originalLines: input.split('\n').length,
      cleanedLines: result.split('\n').filter(l => l.trim()).length
    }
  }

  const stats = getStats()

  return (
    <Layout
      title="🧹 Text Cleaner"
      description="Clean and format text: remove spaces, duplicate lines, empty lines, special characters, and more. Free online text cleaning tool."
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
                className="w-full h-48 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Enter text to clean..."
              />
              {input && (
                <p className="text-xs text-gray-500 mt-1">
                  {input.length} characters, {input.split('\n').length} lines
                </p>
              )}
            </div>

            {/* Clean Options */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Clean Options:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {([
                  { type: 'spaces', label: 'Remove extra spaces', icon: '🔤' },
                  { type: 'allSpaces', label: 'Remove all spaces', icon: '🚫' },
                  { type: 'duplicates', label: 'Remove duplicates', icon: '🔄' },
                  { type: 'emptyLines', label: 'Remove empty lines', icon: '📄' },
                  { type: 'trim', label: 'Trim lines', icon: '✂️' },
                  { type: 'specialChars', label: 'Remove special chars', icon: '🔣' },
                  { type: 'numbers', label: 'Remove numbers', icon: '🔢' },
                  { type: 'letters', label: 'Remove letters', icon: '🔤' },
                  { type: 'all', label: 'Clean all', icon: '✨' },
                ] as { type: CleanType; label: string; icon: string }[]).map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => clean(type)}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                      selectedClean === type
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-2">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="text-xl font-bold">Cleaned Text:</h2>
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
                  onClick={() => copyToClipboard(result)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
            <textarea
              value={result}
              readOnly
              className="w-full h-48 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 resize-none"
            />
            {stats && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Original</div>
                  <div className="font-bold text-gray-900">{stats.originalLength} chars</div>
                </div>
                <div>
                  <div className="text-gray-600">Cleaned</div>
                  <div className="font-bold text-gray-900">{stats.cleanedLength} chars</div>
                </div>
                <div>
                  <div className="text-gray-600">Removed</div>
                  <div className="font-bold text-red-600">{stats.removed} chars</div>
                </div>
                <div>
                  <div className="text-gray-600">Original Lines</div>
                  <div className="font-bold text-gray-900">{stats.originalLines}</div>
                </div>
                <div>
                  <div className="text-gray-600">Cleaned Lines</div>
                  <div className="font-bold text-gray-900">{stats.cleanedLines}</div>
                </div>
              </div>
            )}
            {totalCleaned > 0 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Total clean operations: <span className="font-semibold text-primary-600">{totalCleaned}</span>
              </p>
            )}
          </div>
        )}

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Use a Text Cleaner?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Text data often comes with formatting issues: extra spaces, duplicate lines, empty lines, 
                special characters, or inconsistent formatting. Manually cleaning text is time-consuming and 
                error-prone, especially when dealing with large amounts of data or text copied from various sources.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free text cleaner provides instant solutions for common text formatting problems. Remove 
                extra spaces, eliminate duplicate lines, strip empty lines, remove special characters or 
                numbers, and more. Perfect for data cleaning, text processing, and preparing text for 
                further use in applications or documents.
              </p>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Data Processing</h3>
                <p className="text-gray-700 text-sm">
                  Clean data imported from CSV files, spreadsheets, or databases. Remove formatting issues 
                  and prepare data for analysis or import into other systems.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Content Editing</h3>
                <p className="text-gray-700 text-sm">
                  Clean text copied from PDFs, websites, or documents. Remove extra spaces, empty lines, 
                  and formatting artifacts for clean, readable text.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💻 Development</h3>
                <p className="text-gray-700 text-sm">
                  Clean user input, API responses, or log files. Remove unwanted characters, normalize 
                  spacing, and prepare text for processing in applications.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 List Processing</h3>
                <p className="text-gray-700 text-sm">
                  Clean lists of items by removing duplicates, empty lines, and extra spaces. Perfect for 
                  preparing lists for databases, spreadsheets, or applications.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🧹</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Multiple Clean Options</h3>
                  <p className="text-gray-700 text-sm">
                    Remove extra spaces, all spaces, duplicate lines, empty lines, trim lines, special 
                    characters, numbers, letters, or clean everything at once.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Statistics</h3>
                  <p className="text-gray-700 text-sm">
                    See original length, cleaned length, characters removed, and line counts. Understand 
                    the impact of your cleaning operations.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Instant Cleaning</h3>
                  <p className="text-gray-700 text-sm">
                    Clean text instantly with a single click. No waiting, no processing delays. Get 
                    cleaned results immediately.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Privacy First</h3>
                  <p className="text-gray-700 text-sm">
                    All text cleaning happens locally in your browser. We never see, store, or have 
                    access to your text.
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
                <h3 className="font-semibold text-gray-900 mb-2">What's the difference between "Remove extra spaces" and "Remove all spaces"?</h3>
                <p className="text-gray-700 text-sm">
                  "Remove extra spaces" replaces multiple consecutive spaces with a single space and trims 
                  leading/trailing spaces. "Remove all spaces" removes every space character from the text, 
                  including single spaces between words.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I combine multiple cleaning operations?</h3>
                <p className="text-gray-700 text-sm">
                  Yes! Use the "Clean all" option to apply multiple cleaning operations at once: remove 
                  extra spaces, trim lines, remove empty lines, and remove duplicates. You can also apply 
                  operations sequentially.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you store my cleaned text?</h3>
                <p className="text-gray-700 text-sm">
                  No, absolutely not. All text cleaning happens entirely in your browser. We never see, 
                  store, transmit, or have any access to your text. Your privacy is completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}

