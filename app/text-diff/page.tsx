'use client'

import { useState, useCallback } from 'react'
import Layout from '@/components/Layout'

type DiffMode = 'line' | 'word' | 'character'
type DiffStats = {
  added: number
  removed: number
  modified: number
  unchanged: number
}

export default function TextDiffPage() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [diff, setDiff] = useState('')
  const [mode, setMode] = useState<DiffMode>('line')
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [stats, setStats] = useState<DiffStats>({ added: 0, removed: 0, modified: 0, unchanged: 0 })
  const [totalOperations, setTotalOperations] = useState(0)

  const normalizeText = useCallback((text: string): string => {
    let normalized = text
    if (ignoreWhitespace) {
      normalized = normalized.replace(/\s+/g, ' ').trim()
    }
    if (ignoreCase) {
      normalized = normalized.toLowerCase()
    }
    return normalized
  }, [ignoreWhitespace, ignoreCase])

  const compareLines = useCallback(() => {
    const lines1 = text1.split('\n')
    const lines2 = text2.split('\n')
    const maxLines = Math.max(lines1.length, lines2.length)
    let result = ''
    let added = 0
    let removed = 0
    let modified = 0
    let unchanged = 0

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || ''
      const line2 = lines2[i] || ''
      const norm1 = normalizeText(line1)
      const norm2 = normalizeText(line2)
      
      if (norm1 === norm2) {
        result += `  ${line1}\n`
        unchanged++
      } else {
        if (line1) {
          result += `- ${line1}\n`
          removed++
        }
        if (line2) {
          result += `+ ${line2}\n`
          added++
        }
        if (line1 && line2) {
          modified++
        }
      }
    }
    
    setDiff(result.trim())
    setStats({ added, removed, modified, unchanged })
  }, [text1, text2, normalizeText])

  const compareWords = useCallback(() => {
    const words1 = text1.split(/\s+/)
    const words2 = text2.split(/\s+/)
    const maxWords = Math.max(words1.length, words2.length)
    let result = ''
    let added = 0
    let removed = 0
    let unchanged = 0

    for (let i = 0; i < maxWords; i++) {
      const word1 = words1[i] || ''
      const word2 = words2[i] || ''
      const norm1 = normalizeText(word1)
      const norm2 = normalizeText(word2)
      
      if (norm1 === norm2) {
        result += `${word1} `
        unchanged++
      } else {
        if (word1) {
          result += `[-${word1}-] `
          removed++
        }
        if (word2) {
          result += `[+${word2}+] `
          added++
        }
      }
    }
    
    setDiff(result.trim())
    setStats({ added, removed, modified: 0, unchanged })
  }, [text1, text2, normalizeText])

  const compareCharacters = useCallback(() => {
    const chars1 = text1.split('')
    const chars2 = text2.split('')
    const maxChars = Math.max(chars1.length, chars2.length)
    let result = ''
    let added = 0
    let removed = 0
    let unchanged = 0

    for (let i = 0; i < maxChars; i++) {
      const char1 = chars1[i] || ''
      const char2 = chars2[i] || ''
      const norm1 = normalizeText(char1)
      const norm2 = normalizeText(char2)
      
      if (norm1 === norm2) {
        result += char1
        unchanged++
      } else {
        if (char1) {
          result += `[-${char1}-]`
          removed++
        }
        if (char2) {
          result += `[+${char2}+]`
          added++
        }
      }
    }
    
    setDiff(result)
    setStats({ added, removed, modified: 0, unchanged })
  }, [text1, text2, normalizeText])

  const compare = useCallback(() => {
    if (!text1 && !text2) {
      setDiff('')
      setStats({ added: 0, removed: 0, modified: 0, unchanged: 0 })
      return
    }

    if (mode === 'line') {
      compareLines()
    } else if (mode === 'word') {
      compareWords()
    } else {
      compareCharacters()
    }
    setTotalOperations(prev => prev + 1)
  }, [mode, compareLines, compareWords, compareCharacters, text1, text2])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(diff)
    } catch (e) {
      console.error('Failed to copy')
    }
  }

  const exportToFile = () => {
    const blob = new Blob([diff], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'text-diff.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setText1('')
    setText2('')
    setDiff('')
    setStats({ added: 0, removed: 0, modified: 0, unchanged: 0 })
  }

  return (
    <Layout
      title="🔍 Text Diff - Compare & Find Differences Online"
      description="Compare two texts and find differences online for free. Line-by-line, word-by-word, or character-by-character comparison. Export results. No registration required."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Main Tool */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
          {/* Options */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Comparison Mode:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setMode('line')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                    mode === 'line'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Line-by-Line
                </button>
                <button
                  onClick={() => setMode('word')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                    mode === 'word'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Word-by-Word
                </button>
                <button
                  onClick={() => setMode('character')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                    mode === 'character'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Character-by-Character
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Ignore whitespace</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ignoreCase}
                  onChange={(e) => setIgnoreCase(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Ignore case</span>
              </label>
            </div>
          </div>

          {/* Input Texts */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Text 1 (Original)</label>
                <span className="text-xs text-gray-500">{text1.length} chars</span>
              </div>
              <textarea
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                className="w-full h-64 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                placeholder="Enter first text..."
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Text 2 (Modified)</label>
                <span className="text-xs text-gray-500">{text2.length} chars</span>
              </div>
              <textarea
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                className="w-full h-64 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                placeholder="Enter second text..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={compare}
              className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
            >
              Compare
            </button>
            <button
              onClick={clearAll}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Statistics */}
          {(stats.added > 0 || stats.removed > 0 || stats.modified > 0 || stats.unchanged > 0) && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Added</p>
                  <p className="text-lg font-bold text-green-600">{stats.added}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Removed</p>
                  <p className="text-lg font-bold text-red-600">{stats.removed}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Modified</p>
                  <p className="text-lg font-bold text-orange-600">{stats.modified}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Unchanged</p>
                  <p className="text-lg font-bold text-gray-600">{stats.unchanged}</p>
                </div>
              </div>
            </div>
          )}

          {/* Diff Result */}
          {diff && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Differences</label>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    Copy
                  </button>
                  <button
                    onClick={exportToFile}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Export
                  </button>
                </div>
              </div>
              <textarea
                value={diff}
                readOnly
                className="w-full h-64 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Legend: Lines starting with <span className="font-mono bg-red-100 px-1 rounded">-</span> are removed, 
                lines starting with <span className="font-mono bg-green-100 px-1 rounded">+</span> are added
              </p>
            </div>
          )}

          {/* Total Operations */}
          {totalOperations > 0 && (
            <div className="text-center text-sm text-gray-500">
              Total comparisons: <span className="font-semibold">{totalOperations}</span>
            </div>
          )}
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Text Diff?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Text diff (difference) is a comparison tool that identifies changes between two versions of text. 
                It's an essential utility for developers, writers, editors, and anyone who needs to track changes 
                in documents, code, or any text-based content.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free online text diff tool allows you to compare two texts and see exactly what has been added, 
                removed, or modified. Whether you're reviewing code changes, comparing document versions, or tracking 
                edits, our tool makes it easy to spot differences quickly and accurately.
              </p>
            </div>
          </section>

          {/* How to Use */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Our Text Diff Tool</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li><strong>Choose Comparison Mode:</strong> Select line-by-line, word-by-word, or character-by-character comparison depending on your needs.</li>
                <li><strong>Set Options:</strong> Enable "Ignore whitespace" to compare texts without considering spaces, or "Ignore case" to compare without considering letter case.</li>
                <li><strong>Enter Your Texts:</strong> Paste or type the original text in the first field and the modified text in the second field.</li>
                <li><strong>Compare:</strong> Click "Compare" to see the differences highlighted. Added content is marked with <span className="font-mono bg-green-100 px-1 rounded">+</span>, removed content with <span className="font-mono bg-red-100 px-1 rounded">-</span>.</li>
                <li><strong>Review Statistics:</strong> Check the statistics panel to see how many lines/words/characters were added, removed, modified, or unchanged.</li>
                <li><strong>Export Results:</strong> Copy the diff to your clipboard or export it to a text file for documentation or further analysis.</li>
              </ol>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💻 Code Review</h3>
                <p className="text-gray-700 text-sm">
                  Compare code versions to see what changed between commits, branches, or revisions. 
                  Essential for code reviews and understanding changes in software development.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Document Editing</h3>
                <p className="text-gray-700 text-sm">
                  Track changes in documents, articles, or any written content. See exactly what was 
                  added, removed, or modified between versions.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 Content Verification</h3>
                <p className="text-gray-700 text-sm">
                  Verify that content matches expected versions. Compare translations, transcriptions, 
                  or any text that should match a reference version.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Data Analysis</h3>
                <p className="text-gray-700 text-sm">
                  Compare datasets, logs, or configuration files to identify differences. Useful for 
                  debugging, troubleshooting, or understanding changes in data.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What's the difference between comparison modes?</h3>
                <p className="text-gray-700 text-sm">
                  <strong>Line-by-line:</strong> Compares entire lines, best for code or structured text. 
                  <strong>Word-by-word:</strong> Compares individual words, useful for prose and documents. 
                  <strong>Character-by-character:</strong> Compares each character, most detailed but can be verbose for large texts.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">When should I use "Ignore whitespace"?</h3>
                <p className="text-gray-700 text-sm">
                  Use this option when you want to compare content without considering spaces, tabs, or line breaks. 
                  Useful when formatting differences don't matter, only the actual content.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I export the diff results?</h3>
                <p className="text-gray-700 text-sm">
                  Yes! Click the "Export" button to download the diff as a text file. This is useful for 
                  documentation, sharing with team members, or keeping a record of changes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my data stored or transmitted?</h3>
                <p className="text-gray-700 text-sm">
                  No, all comparison happens entirely in your browser. We never see, store, or transmit 
                  any of your text. Your privacy is completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}

