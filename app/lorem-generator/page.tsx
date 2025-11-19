'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'

const loremText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

type OutputFormat = 'paragraphs' | 'words' | 'bytes' | 'lists'
type ListType = 'ordered' | 'unordered'

export default function LoremGeneratorPage() {
  const [paragraphs, setParagraphs] = useState(3)
  const [words, setWords] = useState(50)
  const [bytes, setBytes] = useState(500)
  const [listItems, setListItems] = useState(5)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('paragraphs')
  const [listType, setListType] = useState<ListType>('unordered')
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [output, setOutput] = useState('')
  const [totalGenerated, setTotalGenerated] = useState(0)

  const generate = useCallback(() => {
    const wordsArray = loremText.split(' ')
    let result = ''

    if (outputFormat === 'paragraphs') {
      for (let p = 0; p < paragraphs; p++) {
        let paragraph = ''
        const targetWords = words
        for (let i = 0; i < targetWords; i++) {
          const wordIndex = (p * targetWords + i) % wordsArray.length
          paragraph += wordsArray[wordIndex] + ' '
        }
        if (p === 0 && startWithLorem) {
          paragraph = 'Lorem ipsum ' + paragraph
        }
        result += paragraph.trim() + (p < paragraphs - 1 ? '\n\n' : '')
      }
    } else if (outputFormat === 'words') {
      let text = ''
      for (let i = 0; i < words; i++) {
        text += wordsArray[i % wordsArray.length] + ' '
      }
      if (startWithLorem) {
        text = 'Lorem ipsum ' + text
      }
      result = text.trim()
    } else if (outputFormat === 'bytes') {
      let text = ''
      let currentBytes = 0
      let wordIndex = 0
      while (currentBytes < bytes) {
        const word = wordsArray[wordIndex % wordsArray.length]
        const wordWithSpace = word + ' '
        if (currentBytes + wordWithSpace.length > bytes && currentBytes > 0) {
          break
        }
        text += wordWithSpace
        currentBytes += wordWithSpace.length
        wordIndex++
      }
      if (startWithLorem && !text.startsWith('Lorem')) {
        text = 'Lorem ipsum ' + text
      }
      result = text.trim()
    } else if (outputFormat === 'lists') {
      for (let i = 0; i < listItems; i++) {
        let itemText = ''
        const itemWords = Math.floor(Math.random() * 10) + 5
        for (let j = 0; j < itemWords; j++) {
          itemText += wordsArray[(i * itemWords + j) % wordsArray.length] + ' '
        }
        const prefix = listType === 'ordered' ? `${i + 1}. ` : '• '
        result += prefix + itemText.trim() + (i < listItems - 1 ? '\n' : '')
      }
    }

    setOutput(result.trim())
    setTotalGenerated(prev => prev + 1)
  }, [paragraphs, words, bytes, listItems, outputFormat, listType, startWithLorem])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  const exportToFile = () => {
    if (!output) return
    
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `lorem-ipsum-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      paragraphs,
      words,
      bytes,
      listItems,
      outputFormat,
      listType,
      startWithLorem
    }
    localStorage.setItem('loremGeneratorSettings', JSON.stringify(settings))
  }, [paragraphs, words, bytes, listItems, outputFormat, listType, startWithLorem])

  // Load settings and auto-generate on mount
  useEffect(() => {
    const saved = localStorage.getItem('loremGeneratorSettings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        setParagraphs(settings.paragraphs || 3)
        setWords(settings.words || 50)
        setBytes(settings.bytes || 500)
        setListItems(settings.listItems || 5)
        setOutputFormat(settings.outputFormat || 'paragraphs')
        setListType(settings.listType || 'unordered')
        setStartWithLorem(settings.startWithLorem !== undefined ? settings.startWithLorem : true)
      } catch (e) {
        // Ignore parse errors
      }
    }
    // Auto-generate on mount
    setTimeout(() => {
      generate()
    }, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const wordCount = output.split(/\s+/).filter(w => w.length > 0).length
  const charCount = output.length
  const byteCount = new Blob([output]).size

  return (
    <Layout
      title="📝 Lorem Ipsum Generator"
      description="Generate Lorem Ipsum placeholder text for design and development. Create paragraphs, words, bytes, or lists. Free online Lorem Ipsum generator with customizable options."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6">
          <div className="space-y-6">
            {/* Output Format */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Output Format:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['paragraphs', 'words', 'bytes', 'lists'] as OutputFormat[]).map((format) => (
                  <button
                    key={format}
                    onClick={() => setOutputFormat(format)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      outputFormat === format
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {format.charAt(0).toUpperCase() + format.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Format-specific options */}
            {outputFormat === 'paragraphs' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Paragraphs: <span className="text-primary-600 font-bold">{paragraphs}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={paragraphs}
                  onChange={(e) => setParagraphs(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>20</span>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Words per paragraph: <span className="text-primary-600 font-bold">{words}</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={words}
                    onChange={(e) => setWords(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10</span>
                    <span>200</span>
                  </div>
                </div>
              </div>
            )}

            {outputFormat === 'words' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of words: <span className="text-primary-600 font-bold">{words}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={words}
                  onChange={(e) => setWords(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>1000</span>
                </div>
              </div>
            )}

            {outputFormat === 'bytes' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of bytes: <span className="text-primary-600 font-bold">{bytes}</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="5000"
                  value={bytes}
                  onChange={(e) => setBytes(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10</span>
                  <span>5000</span>
                </div>
              </div>
            )}

            {outputFormat === 'lists' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    List items: <span className="text-primary-600 font-bold">{listItems}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={listItems}
                    onChange={(e) => setListItems(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>50</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">List Type:</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setListType('unordered')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        listType === 'unordered'
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Unordered (•)
                    </button>
                    <button
                      onClick={() => setListType('ordered')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        listType === 'ordered'
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Ordered (1.)
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Options */}
            <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                id="start-with-lorem"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="w-4 h-4 accent-primary-600"
              />
              <label htmlFor="start-with-lorem" className="text-sm text-gray-700 cursor-pointer flex-1">
                Start with &quot;Lorem ipsum&quot;
              </label>
            </div>

            {/* Generate Button */}
            <button
              onClick={generate}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
            >
              Generate Lorem Ipsum
            </button>

            {/* Statistics */}
            {totalGenerated > 0 && (
              <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-200">
                Total generated: <span className="font-semibold text-primary-600">{totalGenerated}</span> {totalGenerated === 1 ? 'time' : 'times'}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {output && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-bold">Generated Text:</h3>
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
                  onClick={copyToClipboard}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              className="w-full h-64 p-4 border-2 border-gray-200 rounded-lg font-serif text-gray-700 resize-none focus:outline-none"
            />
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Words</div>
                <div className="font-bold text-gray-900">{wordCount}</div>
              </div>
              <div>
                <div className="text-gray-600">Characters</div>
                <div className="font-bold text-gray-900">{charCount}</div>
              </div>
              <div>
                <div className="text-gray-600">Bytes</div>
                <div className="font-bold text-gray-900">{byteCount}</div>
              </div>
            </div>
          </div>
        )}

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Lorem Ipsum?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Lorem Ipsum is placeholder text commonly used in design, publishing, and web development. It&apos;s derived 
                from a Latin text by Cicero, but the words have been scrambled and modified over time, making it 
                meaningless while maintaining the appearance of real text. This makes it perfect for demonstrating 
                layouts, typography, and designs without distracting readers with actual content.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Designers and developers use Lorem Ipsum to focus attention on visual design rather than content. 
                When clients see &quot;Lorem ipsum&quot; text, they understand it&apos;s placeholder content and focus on layout, 
                colors, spacing, and other design elements instead of reading the actual words.
              </p>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎨 Web Design</h3>
                <p className="text-gray-700 text-sm">
                  Fill website mockups and prototypes with placeholder text to demonstrate layouts, typography, and 
                  content structure before final content is ready.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📄 Print Design</h3>
                <p className="text-gray-700 text-sm">
                  Use Lorem Ipsum in brochures, magazines, and other print materials during the design phase to 
                  show how text will flow and look.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💻 Development</h3>
                <p className="text-gray-700 text-sm">
                  Populate databases, forms, and applications with placeholder text for testing and development. 
                  Generate specific byte counts for testing character limits.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Presentations</h3>
                <p className="text-gray-700 text-sm">
                  Create placeholder content for presentations, wireframes, and design proposals. Show clients 
                  how content will appear without writing actual copy.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Multiple Formats</h3>
                  <p className="text-gray-700 text-sm">
                    Generate paragraphs, word counts, byte counts, or formatted lists. Choose the format that best 
                    fits your design or development needs.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚙️</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Fully Customizable</h3>
                  <p className="text-gray-700 text-sm">
                    Control the number of paragraphs (1-20), words (1-1000), bytes (10-5000), or list items (1-50). 
                    Generate exactly what you need.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Statistics</h3>
                  <p className="text-gray-700 text-sm">
                    See word count, character count, and byte count for generated text. Perfect for meeting specific 
                    content length requirements.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📥</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Export Options</h3>
                  <p className="text-gray-700 text-sm">
                    Copy generated text to clipboard or export to a text file. Easy integration into your design 
                    tools, code editors, or documents.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Instant Generation</h3>
                  <p className="text-gray-700 text-sm">
                    Generate Lorem Ipsum text instantly in your browser. No waiting, no API calls, no server 
                    processing. Get results immediately.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Privacy First</h3>
                  <p className="text-gray-700 text-sm">
                    All text generation happens locally in your browser. We never see, store, or have access to 
                    any generated text or your preferences.
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
                <h3 className="font-semibold text-gray-900 mb-2">Why use Lorem Ipsum instead of real text?</h3>
                <p className="text-gray-700 text-sm">
                  Lorem Ipsum allows designers and clients to focus on visual design, layout, and typography without 
                  being distracted by actual content. When people see &quot;Lorem ipsum,&quot; they know it&apos;s placeholder 
                  text and focus on design elements instead of reading.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What&apos;s the difference between words and bytes?</h3>
                <p className="text-gray-700 text-sm">
                  Words mode generates a specific number of words. Bytes mode generates text up to a specific byte 
                  count, which is useful for testing character limits, database fields, or API payload sizes. 
                  Bytes mode is more precise for technical requirements.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I generate lists with Lorem Ipsum?</h3>
                <p className="text-gray-700 text-sm">
                  Yes! Choose the &quot;Lists&quot; format to generate ordered (numbered) or unordered (bullet) lists. 
                  Perfect for demonstrating list styles, navigation menus, or content structures.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How many paragraphs can I generate?</h3>
                <p className="text-gray-700 text-sm">
                  You can generate 1-20 paragraphs, each with 10-200 words. This covers most design and development 
                  needs, from short snippets to longer content blocks.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you store the generated text?</h3>
                <p className="text-gray-700 text-sm">
                  No, absolutely not. All text generation happens entirely in your browser. We never see, store, 
                  transmit, or have any access to the text you generate. Your privacy is completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}

