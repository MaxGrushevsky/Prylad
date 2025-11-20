'use client'

import { useState, useMemo, useCallback } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type Tab = 'statistics' | 'word-frequency' | 'character-frequency'

export default function WordCounterPage() {
  const [text, setText] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('statistics')
  const [ignoreCase, setIgnoreCase] = useState(true)
  const [minWordLength, setMinWordLength] = useState(1)

  // SEO data
  const toolPath = '/word-counter'
  const toolName = 'Word Counter'
  const category = 'text'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "How does the word counter work?",
      answer: "Our word counter analyzes your text and counts words, characters (with and without spaces), paragraphs, sentences, and provides detailed statistics including reading time, readability score, and frequency analysis."
    },
    {
      question: "What is the Flesch Reading Ease score?",
      answer: "The Flesch Reading Ease score measures how easy your text is to read. Scores range from 0-100, with higher scores indicating easier reading. Scores 90-100 are very easy, 60-70 are standard, and 0-30 are very difficult."
    },
    {
      question: "How is reading time calculated?",
      answer: "Reading time is calculated based on an average reading speed of 200 words per minute. This is a standard estimate used by most reading time calculators. Actual reading time may vary based on the reader and text complexity."
    },
    {
      question: "Can I analyze word and character frequency?",
      answer: "Yes! Our tool provides detailed frequency analysis showing how often each word and character appears in your text. This is useful for text analysis, SEO optimization, and content writing."
    },
    {
      question: "Is the word counter free to use?",
      answer: "Yes, absolutely! Our word counter is completely free to use. There are no hidden fees, subscriptions, or usage limits. You can analyze as much text as you need."
    },
    {
      question: "Do you store my text?",
      answer: "No, absolutely not. All text analysis happens entirely in your browser. We never see, store, transmit, or have any access to your text. Your privacy is completely protected."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Enter Your Text",
      text: "Paste or type your text into the input area. The tool will automatically analyze it in real-time."
    },
    {
      name: "View Statistics",
      text: "See detailed statistics including word count, character count (with/without spaces), paragraphs, sentences, and reading time."
    },
    {
      name: "Analyze Frequency",
      text: "Switch to Word Frequency or Character Frequency tabs to see how often each word or character appears in your text."
    },
    {
      name: "Check Readability",
      text: "View the Flesch Reading Ease score to understand how easy your text is to read."
    },
    {
      name: "Export Results",
      text: "Copy statistics or export them for use in your projects or documentation."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Count Words and Analyze Text",
      "Learn how to count words, characters, and analyze text with detailed statistics using our free online word counter tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Word Counter",
      "Free online word counter and text analyzer. Count words, characters, paragraphs, sentences, analyze frequency, and calculate readability scores.",
      "https://prylad.pro/word-counter",
      "UtilityApplication"
    )
  ]

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/) : []
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()) : []
    const lines = text.split('\n').length
    const numbers = (text.match(/\d/g) || []).length
    const uppercase = (text.match(/[A-Z]/g) || []).length
    const lowercase = (text.match(/[a-z]/g) || []).length
    const specialChars = (text.match(/[^a-zA-Z0-9\s]/g) || []).length
    
    // Sentences - improved detection
    const sentenceMatches = text.match(/[.!?]+[\s\n]|$/g) || []
    const sentences = sentenceMatches.length > 0 ? sentenceMatches.length : 0
    
    // Reading time estimate (average 200 words per minute)
    const readingTimeMinutes = words.length > 0 ? Math.ceil(words.length / 200) : 0
    
    // Average word length
    const avgWordLength = words.length > 0 
      ? (words.reduce((sum, word) => sum + word.length, 0) / words.length).toFixed(1)
      : '0'

    // Advanced text analysis
    const wordLengths = words.map(w => w.replace(/[^\w]/g, '').length).filter(l => l > 0)
    const longestWord = wordLengths.length > 0 ? words[wordLengths.indexOf(Math.max(...wordLengths))] : ''
    const shortestWord = wordLengths.length > 0 ? words[wordLengths.indexOf(Math.min(...wordLengths))] : ''
    
    // Sentence analysis
    const sentenceList = text.split(/[.!?]+[\s\n]/).filter(s => s.trim().length > 0)
    const sentenceLengths = sentenceList.map(s => s.trim().split(/\s+/).length)
    const avgSentenceLength = sentenceLengths.length > 0 
      ? (sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length).toFixed(1)
      : '0'
    const longestSentence = sentenceLengths.length > 0 
      ? sentenceList[sentenceLengths.indexOf(Math.max(...sentenceLengths))].trim()
      : ''
    
    // Paragraph analysis
    const paragraphLengths = paragraphs.map(p => p.trim().split(/\s+/).length)
    const avgParagraphLength = paragraphLengths.length > 0
      ? (paragraphLengths.reduce((sum, len) => sum + len, 0) / paragraphLengths.length).toFixed(1)
      : '0'
    
    // Words per sentence
    const wordsPerSentence = sentences > 0 ? (words.length / sentences).toFixed(1) : '0'
    
    // Characters per word
    const charsPerWord = words.length > 0 ? (charactersNoSpaces / words.length).toFixed(1) : '0'
    
    // Flesch Reading Ease Score (simplified)
    // Formula: 206.835 - (1.015 × ASL) - (84.6 × ASW)
    // ASL = Average Sentence Length (words per sentence)
    // ASW = Average Syllables per Word (simplified: using word length as proxy)
    const avgSyllablesPerWord = words.length > 0
      ? words.reduce((sum, word) => {
          const cleanWord = word.replace(/[^\w]/g, '').toLowerCase()
          // Simple syllable estimation: roughly 1 syllable per 2-3 characters
          const syllables = Math.max(1, Math.ceil(cleanWord.length / 2.5))
          return sum + syllables
        }, 0) / words.length
      : 0
    const fleschScore = sentences > 0 && words.length > 0
      ? Math.max(0, Math.min(100, 206.835 - (1.015 * parseFloat(wordsPerSentence)) - (84.6 * avgSyllablesPerWord)))
      : 0
    
    const getReadabilityLevel = (score: number): string => {
      if (score >= 90) return 'Very Easy'
      if (score >= 80) return 'Easy'
      if (score >= 70) return 'Fairly Easy'
      if (score >= 60) return 'Standard'
      if (score >= 50) return 'Fairly Difficult'
      if (score >= 30) return 'Difficult'
      return 'Very Difficult'
    }

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
      // Advanced stats
      longestWord: longestWord.replace(/[^\w\s]/g, ''),
      shortestWord: shortestWord.replace(/[^\w\s]/g, ''),
      avgSentenceLength,
      longestSentence: longestSentence.length > 100 ? longestSentence.substring(0, 100) + '...' : longestSentence,
      avgParagraphLength,
      wordsPerSentence,
      charsPerWord,
      fleschScore: fleschScore.toFixed(1),
      readabilityLevel: getReadabilityLevel(fleschScore),
    }
  }, [text])

  // Word frequency analysis
  const wordFrequency = useMemo(() => {
    if (!text.trim()) return []
    
    const words = text.trim().split(/\s+/)
    const frequency: { [key: string]: number } = {}
    
    words.forEach(word => {
      // Clean word: remove punctuation, handle case
      let cleaned = word.replace(/[^\w\s]/g, '')
      if (ignoreCase) {
        cleaned = cleaned.toLowerCase()
      }
      
      // Filter by minimum length
      if (cleaned.length >= minWordLength) {
        frequency[cleaned] = (frequency[cleaned] || 0) + 1
      }
    })
    
    // Convert to array and sort
    return Object.entries(frequency)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
  }, [text, ignoreCase, minWordLength])

  // Character frequency analysis
  const characterFrequency = useMemo(() => {
    if (!text.trim()) return []
    
    const frequency: { [key: string]: number } = {}
    const chars = text.split('')
    
    chars.forEach(char => {
      let key = char
      if (ignoreCase && /[a-zA-Z]/.test(char)) {
        key = char.toLowerCase()
      }
      frequency[key] = (frequency[key] || 0) + 1
    })
    
    // Convert to array and sort
    return Object.entries(frequency)
      .map(([char, count]) => ({ 
        char: char === ' ' ? '[space]' : char === '\n' ? '[newline]' : char === '\t' ? '[tab]' : char, 
        originalChar: char,
        count 
      }))
      .sort((a, b) => b.count - a.count || a.char.localeCompare(b.char))
  }, [text, ignoreCase])

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
      <StructuredData data={structuredData} />
      <Layout
        title="🔢 Word & Character Counter"
        description="Count words, characters, paragraphs, sentences, and analyze text with detailed statistics. Free online word counter with frequency analysis, readability score (Flesch), text analysis, reading time, and export options."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('statistics')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'statistics'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('word-frequency')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'word-frequency'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Word Frequency
            </button>
            <button
              onClick={() => setActiveTab('character-frequency')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'character-frequency'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Character Frequency
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Input */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Text Input:</h2>
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
              className="w-full h-96 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="Enter or paste text for analysis..."
            />
          </div>

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Statistics:</h2>
            <div className="space-y-4">
              {/* Main Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Words</div>
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{stats.words}</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Characters</div>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.characters}</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">No Spaces</div>
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">{stats.charactersNoSpaces}</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paragraphs</div>
                  <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">{stats.paragraphs}</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 rounded-lg border border-pink-200 dark:border-pink-800">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sentences</div>
                  <div className="text-3xl font-bold text-pink-700 dark:text-pink-400">{stats.sentences}</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 rounded-lg border border-teal-200 dark:border-teal-800">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lines</div>
                  <div className="text-3xl font-bold text-teal-700 dark:text-teal-400">{stats.lines}</div>
                </div>
              </div>

              {/* Reading Time */}
              {stats.words > 0 && (
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reading Time</div>
                  <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                    {stats.readingTimeMinutes} {stats.readingTimeMinutes === 1 ? 'minute' : 'minutes'}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">(at 200 words/minute)</p>
                </div>
              )}

              {/* Detailed Stats */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Character Breakdown:</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Uppercase:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.uppercase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Lowercase:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.lowercase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Numbers:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.numbers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Special:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.specialChars}</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">Avg Word Length:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.avgWordLength} chars</span>
                  </div>
                </div>
              </div>

              {/* Text Analysis */}
              {text.trim() && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📊 Text Analysis:</h3>
                  
                  {/* Readability Score */}
                  {stats.sentences > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-lg border border-cyan-200 dark:border-cyan-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-cyan-700 dark:text-cyan-300 font-semibold">Readability Score (Flesch):</span>
                        <span className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">{stats.fleschScore}</span>
                      </div>
                      <div className="text-xs text-cyan-600 dark:text-cyan-400">
                        Level: <span className="font-semibold">{stats.readabilityLevel}</span>
                      </div>
                    </div>
                  )}

                  {/* Sentence & Paragraph Stats */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Avg Sentence Length:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.avgSentenceLength} words</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Words per Sentence:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.wordsPerSentence}</span>
                    </div>
                    {stats.paragraphs > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Avg Paragraph Length:</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.avgParagraphLength} words</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Chars per Word:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.charsPerWord}</span>
                    </div>
                  </div>

                  {/* Longest/Shortest Word */}
                  {stats.longestWord && (
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 block mb-1">Longest Word:</span>
                        <span className="font-mono font-semibold text-gray-900 dark:text-gray-100 break-all">
                          {stats.longestWord} ({stats.longestWord.length} chars)
                        </span>
                      </div>
                      {stats.shortestWord && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 block mb-1">Shortest Word:</span>
                          <span className="font-mono font-semibold text-gray-900 dark:text-gray-100 break-all">
                            {stats.shortestWord} ({stats.shortestWord.length} chars)
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Longest Sentence */}
                  {stats.longestSentence && (
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400 block mb-1">Longest Sentence:</span>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-900 dark:text-gray-100 italic text-xs leading-relaxed">
                          &quot;{stats.longestSentence}&quot;
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                          ({stats.longestSentence.split(/\s+/).length} words)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          )}

          {/* Word Frequency Tab */}
          {activeTab === 'word-frequency' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Word Frequency:</h2>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ignoreCase}
                    onChange={(e) => setIgnoreCase(e.target.checked)}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Ignore case</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-gray-700 dark:text-gray-300">Min length:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={minWordLength}
                    onChange={(e) => setMinWordLength(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
            {wordFrequency.length > 0 ? (
              <div className="max-h-[600px] overflow-y-auto">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                      <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Rank</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Word</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Count</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Percentage</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Bar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wordFrequency.map((item, index) => {
                        const totalWords = wordFrequency.reduce((sum, w) => sum + w.count, 0)
                        const percentage = ((item.count / totalWords) * 100).toFixed(2)
                        const maxCount = wordFrequency[0]?.count || 1
                        const barWidth = (item.count / maxCount) * 100
                        return (
                          <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-400 font-medium">{index + 1}</td>
                            <td className="py-2 px-4 text-sm font-mono text-gray-900 dark:text-gray-100">{item.word}</td>
                            <td className="py-2 px-4 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">{item.count}</td>
                            <td className="py-2 px-4 text-sm text-right text-gray-600 dark:text-gray-400">{percentage}%</td>
                            <td className="py-2 px-4">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                <div 
                                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                  Total unique words: <span className="font-semibold text-gray-900 dark:text-gray-100">{wordFrequency.length}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg mb-2">No words found</p>
                <p className="text-sm">Enter some text to see word frequency analysis</p>
              </div>
            )}
          </div>
          )}

          {/* Character Frequency Tab */}
          {activeTab === 'character-frequency' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Character Frequency:</h2>
              <div className="flex items-center gap-2 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ignoreCase}
                    onChange={(e) => setIgnoreCase(e.target.checked)}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Ignore case</span>
                </label>
              </div>
            </div>
            {characterFrequency.length > 0 ? (
              <div className="max-h-[600px] overflow-y-auto">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                      <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Rank</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Character</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Count</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Percentage</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Bar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {characterFrequency.map((item, index) => {
                        const totalChars = characterFrequency.reduce((sum, c) => sum + c.count, 0)
                        const percentage = ((item.count / totalChars) * 100).toFixed(2)
                        const maxCount = characterFrequency[0]?.count || 1
                        const barWidth = (item.count / maxCount) * 100
                        return (
                          <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-400 font-medium">{index + 1}</td>
                            <td className="py-2 px-4 text-sm font-mono text-gray-900 dark:text-gray-100">
                              {item.char}
                              {item.originalChar !== item.char && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({item.originalChar})</span>
                              )}
                            </td>
                            <td className="py-2 px-4 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">{item.count}</td>
                            <td className="py-2 px-4 text-sm text-right text-gray-600 dark:text-gray-400">{percentage}%</td>
                            <td className="py-2 px-4">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-4 rounded-full transition-all"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                  Total unique characters: <span className="font-semibold text-gray-900 dark:text-gray-100">{characterFrequency.length}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg mb-2">No characters found</p>
                <p className="text-sm">Enter some text to see character frequency analysis</p>
              </div>
            )}
          </div>
          )}
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Why Use a Word Counter?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Word and character counting is essential for writers, students, content creators, and developers. 
                Whether you&apos;re writing an article with a word limit, creating social media posts with character 
                restrictions, or analyzing text data, knowing the exact word and character count is crucial.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our free word counter provides comprehensive text analysis including word count, character count 
                (with and without spaces), paragraph count, sentence count, reading time estimates, detailed 
                character breakdowns, frequency analysis, and advanced text statistics. Get readability scores 
                (Flesch Reading Ease), average sentence/paragraph lengths, longest/shortest words, and more. 
                All analysis happens instantly in your browser as you type.
              </p>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📝 Writing & Content</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Track word count for articles, essays, blog posts, or any written content. Meet word limits 
                  for assignments, publications, or content requirements.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📱 Social Media</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Count characters for Twitter (280), Facebook, LinkedIn, and other social media platforms. 
                  Ensure your posts fit within platform limits.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📊 SEO & Marketing</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Analyze content length for SEO optimization. Track meta descriptions (150-160 characters), 
                  titles (50-60 characters), and article length for optimal search rankings.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">💻 Development</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Validate input length for forms, text fields, and API payloads. Ensure content meets 
                  database field limits and validation requirements.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Comprehensive Statistics</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Count words, characters (with/without spaces), paragraphs, sentences, lines, and more. 
                    Get detailed character breakdowns including uppercase, lowercase, numbers, and special characters.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Reading Time</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Estimate reading time based on average reading speed (200 words per minute). Helpful 
                    for content planning and user experience optimization.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Real-time Analysis</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Statistics update instantly as you type. No need to click buttons or wait for processing. 
                    See counts change in real-time.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📥</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Export Options</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Export your text to a file for backup or further processing. Copy statistics or text 
                    to clipboard for easy sharing.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Average Word Length</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Calculate average word length to understand text complexity. Useful for readability 
                    analysis and content optimization.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Frequency Analysis</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Analyze word and character frequency with detailed tables, percentages, and visual bars. 
                    Identify most common words and characters in your text. Filter by case sensitivity and minimum word length.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Advanced Text Analysis</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Get detailed text statistics including readability score (Flesch Reading Ease), average sentence 
                    and paragraph lengths, longest/shortest words, longest sentence, and words per sentence. 
                    Perfect for content optimization and writing analysis.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📖</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Readability Score</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Calculate Flesch Reading Ease score to understand how easy your text is to read. Get readability 
                    level from &quot;Very Easy&quot; to &quot;Very Difficult&quot;. Useful for content writers, educators, and editors.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Privacy First</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    All text analysis happens locally in your browser. We never see, store, or have 
                    access to your text or statistics.
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
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How is word count calculated?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Words are counted by splitting text on whitespace (spaces, tabs, newlines). Each sequence 
                  of non-whitespace characters is counted as one word. This matches the standard word counting 
                  method used by most word processors.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the difference between characters and characters (no spaces)?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  &quot;Characters&quot; includes all characters including spaces, while &quot;Characters (no spaces)&quot; excludes 
                  all whitespace. The no-spaces count is useful for platforms with strict character limits or 
                  when calculating actual content length.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How is reading time calculated?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Reading time is estimated based on an average reading speed of 200 words per minute. This is 
                  a standard estimate for general reading. Actual reading time varies based on content complexity 
                  and reader speed.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Do you store my text?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, absolutely not. All text analysis happens entirely in your browser. We never see, store, 
                  transmit, or have any access to your text or statistics. Your privacy is completely protected.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What is frequency analysis?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Frequency analysis shows how often each word or character appears in your text. This is useful 
                  for identifying common words, analyzing writing patterns, detecting repeated phrases, and 
                  understanding text composition. The analysis includes counts, percentages, and visual bars 
                  for easy comparison.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How does case sensitivity work?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  When &quot;Ignore case&quot; is enabled, words like &quot;Hello&quot; and &quot;hello&quot; are counted together. 
                  When disabled, they are counted separately. This option helps you analyze text regardless of 
                  capitalization patterns.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What is the Flesch Reading Ease score?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  The Flesch Reading Ease score is a readability test that rates text on a scale from 0 to 100. 
                  Higher scores indicate easier-to-read text. Scores of 90-100 are &quot;Very Easy&quot; (5th grade level), 
                  while scores below 30 are &quot;Very Difficult&quot; (college graduate level). This helps writers 
                  optimize content for their target audience.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What text analysis metrics are provided?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our text analyzer provides comprehensive statistics including average sentence length, average paragraph 
                  length, longest and shortest words, longest sentence, words per sentence, characters per word, and 
                  readability score. These metrics help you understand text complexity, writing style, and content structure.
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

