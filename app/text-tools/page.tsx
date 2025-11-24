'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import HistoryPanel from '@/components/HistoryPanel'
import { useHistory } from '@/hooks/useHistory'

type Tab = 'case' | 'cleaner' | 'reverser'
type CaseType = 'uppercase' | 'lowercase' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'alternating' | 'inverse' | 'capitalize' | 'dot' | 'train' | 'cobol' | 'flat' | 'random'
type CleanType = 'spaces' | 'allSpaces' | 'duplicates' | 'emptyLines' | 'trim' | 'specialChars' | 'numbers' | 'letters' | 'all'
type ReverseMode = 'all' | 'words' | 'lines' | 'characters'

export default function TextToolsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('case')

  // Check URL hash for tab switching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash === '#cleaner') {
        setActiveTab('cleaner')
      } else if (hash === '#reverser') {
        setActiveTab('reverser')
      } else if (hash === '#case') {
        setActiveTab('case')
      }
    }
  }, [])

  // Update URL hash when tab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = activeTab === 'case' ? '' : activeTab === 'cleaner' ? '#cleaner' : '#reverser'
      if (window.location.hash !== hash) {
        window.history.replaceState(null, '', hash || window.location.pathname)
      }
    }
  }, [activeTab])

  // ========== TEXT CASE STATE ==========
  const [caseText, setCaseText] = useState('')
  const [caseResult, setCaseResult] = useState('')
  const [selectedCase, setSelectedCase] = useState<CaseType | null>(null)

  // ========== TEXT CLEANER STATE ==========
  const [cleanerInput, setCleanerInput] = useState('')
  const [cleanerResult, setCleanerResult] = useState('')
  const [selectedClean, setSelectedClean] = useState<CleanType | null>(null)

  // ========== TEXT REVERSER STATE ==========
  const [reverserInput, setReverserInput] = useState('Hello World')
  const [reverserOutput, setReverserOutput] = useState('')
  const [reverseMode, setReverseMode] = useState<ReverseMode>('all')
  const [autoConvert, setAutoConvert] = useState(true)

  // ========== HISTORY ==========
  const { history: caseHistory, addToHistory: addCaseToHistory, removeFromHistory: removeCaseFromHistory, clearHistory: clearCaseHistory } = useHistory<string>('text-case-history', 20)
  const { history: cleanerHistory, addToHistory: addCleanerToHistory, removeFromHistory: removeCleanerFromHistory, clearHistory: clearCleanerHistory } = useHistory<string>('text-cleaner-history', 20)
  const { history: reverserHistory, addToHistory: addReverserToHistory, removeFromHistory: removeReverserFromHistory, clearHistory: clearReverserHistory } = useHistory<string>('text-reverser-history', 20)

  // History selection handlers
  const selectFromCaseHistory = useCallback((item: string) => {
    setCaseText(item)
  }, [])

  const selectFromCleanerHistory = useCallback((item: string) => {
    setCleanerInput(item)
  }, [])

  const selectFromReverserHistory = useCallback((item: string) => {
    setReverserInput(item)
  }, [])

  // ========== TEXT CASE FUNCTIONS ==========
  const transformCase = useCallback((type: CaseType) => {
    if (!caseText.trim()) {
      setCaseResult('')
      return
    }

    let transformed = ''
    switch (type) {
      case 'uppercase': transformed = caseText.toUpperCase(); break
      case 'lowercase': transformed = caseText.toLowerCase(); break
      case 'title':
        transformed = caseText.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        break
      case 'sentence':
        transformed = caseText.toLowerCase().split(/([.!?]\s+)/).map((p, i) => 
          i === 0 || /[.!?]\s+/.test(p) ? p.charAt(0).toUpperCase() + p.slice(1) : p
        ).join('')
        break
      case 'camel':
        transformed = caseText.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, c => c.toLowerCase())
        break
      case 'pascal':
        transformed = caseText.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[a-z]/, c => c.toUpperCase())
        break
      case 'snake': transformed = caseText.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''); break
      case 'kebab': transformed = caseText.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); break
      case 'constant': transformed = caseText.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, ''); break
      case 'alternating': transformed = caseText.split('').map((c, i) => i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()).join(''); break
      case 'inverse':
        transformed = caseText.split('').map(c => {
          if (c === c.toUpperCase() && c !== c.toLowerCase()) return c.toLowerCase()
          if (c === c.toLowerCase() && c !== c.toUpperCase()) return c.toUpperCase()
          return c
        }).join('')
        break
      case 'capitalize': transformed = caseText.charAt(0).toUpperCase() + caseText.slice(1).toLowerCase(); break
      case 'dot': transformed = caseText.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, ''); break
      case 'train':
        transformed = caseText.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('-').replace(/[^a-zA-Z0-9-]/g, '')
        break
      case 'cobol': transformed = caseText.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, ''); break
      case 'flat': transformed = caseText.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, ''); break
      case 'random':
        transformed = caseText.split('').map(c => /[a-zA-Z]/.test(c) ? (Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()) : c).join('')
        break
      default: transformed = caseText
    }
    setCaseResult(transformed)
    setSelectedCase(type)
    if (transformed) {
      addCaseToHistory(transformed, `${type} case`)
    }
  }, [caseText, addCaseToHistory])

  // ========== TEXT CLEANER FUNCTIONS ==========
  const clean = useCallback((type: CleanType) => {
    if (!cleanerInput.trim()) {
      setCleanerResult('')
      return
    }

    let cleaned = cleanerInput
    switch (type) {
      case 'spaces': cleaned = cleanerInput.replace(/\s+/g, ' ').trim(); break
      case 'allSpaces': cleaned = cleanerInput.replace(/\s/g, ''); break
      case 'duplicates': cleaned = Array.from(new Set(cleanerInput.split('\n'))).join('\n'); break
      case 'emptyLines': cleaned = cleanerInput.split('\n').filter(l => l.trim()).join('\n'); break
      case 'trim': cleaned = cleanerInput.split('\n').map(l => l.trim()).join('\n'); break
      case 'specialChars': cleaned = cleanerInput.replace(/[^a-zA-Z0-9\s]/g, ''); break
      case 'numbers': cleaned = cleanerInput.replace(/\d/g, ''); break
      case 'letters': cleaned = cleanerInput.replace(/[a-zA-Z]/g, ''); break
      case 'all':
        const lines = cleanerInput.replace(/\s+/g, ' ').trim().split('\n').filter(l => l.trim()).map(l => l.trim())
        cleaned = Array.from(new Set(lines)).join('\n')
        break
      default: cleaned = cleanerInput
    }
    setCleanerResult(cleaned)
    setSelectedClean(type)
    if (cleaned) {
      addCleanerToHistory(cleaned, `${type} clean`)
    }
  }, [cleanerInput, addCleanerToHistory])

  // ========== TEXT REVERSER FUNCTIONS ==========
  // Вынесено наружу для оптимизации - простая функция не нуждается в useCallback
  const reverseText = (text: string, mode: ReverseMode): string => {
    if (!text.trim()) return ''
    switch (mode) {
      case 'all': return text.split('').reverse().join('')
      case 'words': return text.split(/\s+/).reverse().join(' ')
      case 'lines': return text.split('\n').reverse().join('\n')
      case 'characters': return text.split(/\s+/).map(w => w.split('').reverse().join('')).join(' ')
      default: return text
    }
  }

  useEffect(() => {
    if (activeTab === 'reverser' && autoConvert && reverserInput.trim()) {
      const timer = setTimeout(() => {
        const reversed = reverseText(reverserInput, reverseMode)
        setReverserOutput(reversed)
        if (reversed) {
          addReverserToHistory(reversed, `${reverseMode} reverse`)
        }
      }, 100)
      return () => clearTimeout(timer)
    } else if (activeTab === 'reverser' && !reverserInput.trim()) {
      setReverserOutput('')
    }
  }, [reverserInput, reverseMode, autoConvert, activeTab, addReverserToHistory])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Silent fail
    }
  }

  const exportToFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Helper function to transform case
  const transformCaseText = (text: string, type: CaseType): string => {
    switch (type) {
      case 'uppercase': return text.toUpperCase()
      case 'lowercase': return text.toLowerCase()
      case 'title': return text.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      case 'sentence': return text.toLowerCase().split(/([.!?]\s+)/).map((p, i) => i === 0 || /[.!?]\s+/.test(p) ? p.charAt(0).toUpperCase() + p.slice(1) : p).join('')
      case 'camel': return text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, c => c.toLowerCase())
      case 'pascal': return text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[a-z]/, c => c.toUpperCase())
      case 'snake': return text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      case 'kebab': return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      case 'constant': return text.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
      case 'alternating': return text.split('').map((c, i) => i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()).join('')
      case 'inverse': return text.split('').map(c => { if (c === c.toUpperCase() && c !== c.toLowerCase()) return c.toLowerCase(); if (c === c.toLowerCase() && c !== c.toUpperCase()) return c.toUpperCase(); return c }).join('')
      case 'capitalize': return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
      case 'dot': return text.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')
      case 'train': return text.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('-').replace(/[^a-zA-Z0-9-]/g, '')
      case 'cobol': return text.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '')
      case 'flat': return text.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
      case 'random': return text.split('').map(c => /[a-zA-Z]/.test(c) ? (Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()) : c).join('')
      default: return text
    }
  }

  // Helper function to clean text
  const cleanText = (text: string, type: CleanType): string => {
    switch (type) {
      case 'spaces': return text.replace(/\s+/g, ' ').trim()
      case 'allSpaces': return text.replace(/\s/g, '')
      case 'duplicates': return Array.from(new Set(text.split('\n'))).join('\n')
      case 'emptyLines': return text.split('\n').filter(l => l.trim()).join('\n')
      case 'trim': return text.split('\n').map(l => l.trim()).join('\n')
      case 'specialChars': return text.replace(/[^a-zA-Z0-9\s]/g, '')
      case 'numbers': return text.replace(/\d/g, '')
      case 'letters': return text.replace(/[a-zA-Z]/g, '')
      case 'all': {
        const lines = text.replace(/\s+/g, ' ').trim().split('\n').filter(l => l.trim()).map(l => l.trim())
        return Array.from(new Set(lines)).join('\n')
      }
      default: return text
    }
  }


  return (
    <Layout
      title="📝 Text Tools - Case Converter, Cleaner & Reverser"
      description="All-in-one text tools: convert text case, clean text, and reverse text. Free online text manipulation tools."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Tabs */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('case')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'case'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Case Converter
            </button>
            <button
              onClick={() => setActiveTab('cleaner')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'cleaner'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Text Cleaner
            </button>
            <button
              onClick={() => setActiveTab('reverser')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'reverser'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Text Reverser
            </button>
          </div>
        </div>

        {/* Case Converter Tab */}
        {activeTab === 'case' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Source Text:</label>
                <textarea
                  value={caseText}
                  onChange={(e) => setCaseText(e.target.value)}
                  className="w-full h-40 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none bg-white dark:bg-gray-900"
                  placeholder="Enter text to convert..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">Convert To:</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    { type: 'uppercase' as CaseType, label: 'UPPERCASE' },
                    { type: 'lowercase' as CaseType, label: 'lowercase' },
                    { type: 'title' as CaseType, label: 'Title Case' },
                    { type: 'sentence' as CaseType, label: 'Sentence case' },
                    { type: 'capitalize' as CaseType, label: 'Capitalize' },
                    { type: 'camel' as CaseType, label: 'camelCase' },
                    { type: 'pascal' as CaseType, label: 'PascalCase' },
                    { type: 'snake' as CaseType, label: 'snake_case' },
                    { type: 'kebab' as CaseType, label: 'kebab-case' },
                    { type: 'dot' as CaseType, label: 'dot.case' },
                    { type: 'train' as CaseType, label: 'Train-Case' },
                    { type: 'cobol' as CaseType, label: 'COBOL-CASE' },
                    { type: 'constant' as CaseType, label: 'CONSTANT_CASE' },
                    { type: 'flat' as CaseType, label: 'flatcase' },
                    { type: 'alternating' as CaseType, label: 'AlTeRnAtInG' },
                    { type: 'random' as CaseType, label: 'RaNdOm' },
                    { type: 'inverse' as CaseType, label: 'iNvErSe' },
                  ].map(({ type, label }) => (
                    <button
                      key={type}
                      onClick={() => transformCase(type)}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                        selectedCase === type
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {caseResult && (
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-semibold">Result:</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportToFile(caseResult, `text-case-${Date.now()}.txt`)}
                        className="text-xs text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Export to file"
                      >
                        Export
                      </button>
                      <button
                        onClick={() => copyToClipboard(caseResult)}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={caseResult}
                    readOnly
                    className="w-full h-40 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 resize-none"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Text Cleaner Tab */}
        {activeTab === 'cleaner' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Source Text:</label>
                <textarea
                  value={cleanerInput}
                  onChange={(e) => setCleanerInput(e.target.value)}
                  className="w-full h-48 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none bg-white dark:bg-gray-900"
                  placeholder="Enter text to clean..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">Clean Options:</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { type: 'spaces' as CleanType, label: 'Remove extra spaces', icon: '🔤' },
                    { type: 'allSpaces' as CleanType, label: 'Remove all spaces', icon: '🚫' },
                    { type: 'duplicates' as CleanType, label: 'Remove duplicates', icon: '🔄' },
                    { type: 'emptyLines' as CleanType, label: 'Remove empty lines', icon: '📄' },
                    { type: 'trim' as CleanType, label: 'Trim lines', icon: '✂️' },
                    { type: 'specialChars' as CleanType, label: 'Remove special chars', icon: '🔣' },
                    { type: 'numbers' as CleanType, label: 'Remove numbers', icon: '🔢' },
                    { type: 'letters' as CleanType, label: 'Remove letters', icon: '🔤' },
                    { type: 'all' as CleanType, label: 'Clean all', icon: '✨' },
                  ].map(({ type, label, icon }) => (
                    <button
                      key={type}
                      onClick={() => clean(type)}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                        selectedClean === type
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="mr-2">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {cleanerResult && (
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-semibold">Cleaned Text:</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportToFile(cleanerResult, `text-cleaned-${Date.now()}.txt`)}
                        className="text-xs text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Export to file"
                      >
                        Export
                      </button>
                      <button
                        onClick={() => copyToClipboard(cleanerResult)}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={cleanerResult}
                    readOnly
                    className="w-full h-48 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 resize-none"
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    Original: {cleanerInput.length} chars → Cleaned: {cleanerResult.length} chars ({cleanerInput.length - cleanerResult.length} removed)
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Text Reverser Tab */}
        {activeTab === 'reverser' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3">Reverse Mode:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { mode: 'all' as ReverseMode, label: '🔄 All Text' },
                    { mode: 'words' as ReverseMode, label: '📝 Words' },
                    { mode: 'lines' as ReverseMode, label: '📄 Lines' },
                    { mode: 'characters' as ReverseMode, label: '🔤 Characters' },
                  ].map(({ mode, label }) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setReverseMode(mode)
                        setReverserOutput('')
                      }}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                        reverseMode === mode
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-convert"
                  checked={autoConvert}
                  onChange={(e) => setAutoConvert(e.target.checked)}
                  className="w-4 h-4 accent-primary-600"
                />
                <label htmlFor="auto-convert" className="text-sm cursor-pointer">Auto-reverse on input change</label>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Text to Reverse:</label>
                <textarea
                  value={reverserInput}
                  onChange={(e) => setReverserInput(e.target.value)}
                  placeholder="Enter text to reverse..."
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 font-mono text-sm min-h-[150px] resize-y"
                />
              </div>

              {!autoConvert && (
                <button
                  onClick={() => setReverserOutput(reverseText(reverserInput, reverseMode))}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
                >
                  Reverse Text
                </button>
              )}

              {reverserOutput && (
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-semibold">Reversed Text:</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportToFile(reverserOutput, `text-reversed-${Date.now()}.txt`)}
                        className="text-xs text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Export to file"
                      >
                        Export
                      </button>
                      <button
                        onClick={() => copyToClipboard(reverserOutput)}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={reverserOutput}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-primary-200 dark:border-primary-800 rounded-lg bg-primary-50 dark:bg-primary-900/20 font-mono text-sm min-h-[150px] resize-y"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Panels */}
        {activeTab === 'case' && caseHistory.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <HistoryPanel
              history={caseHistory}
              onSelect={selectFromCaseHistory}
              onRemove={removeCaseFromHistory}
              onClear={clearCaseHistory}
              formatItem={(item) => item.substring(0, 50) + (item.length > 50 ? '...' : '')}
              title="Case Conversion History"
              maxDisplay={10}
            />
          </div>
        )}

        {activeTab === 'cleaner' && cleanerHistory.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <HistoryPanel
              history={cleanerHistory}
              onSelect={selectFromCleanerHistory}
              onRemove={removeCleanerFromHistory}
              onClear={clearCleanerHistory}
              formatItem={(item) => item.substring(0, 50) + (item.length > 50 ? '...' : '')}
              title="Text Cleaning History"
              maxDisplay={10}
            />
          </div>
        )}

        {activeTab === 'reverser' && reverserHistory.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <HistoryPanel
              history={reverserHistory}
              onSelect={selectFromReverserHistory}
              onRemove={removeReverserFromHistory}
              onClear={clearReverserHistory}
              formatItem={(item) => item.substring(0, 50) + (item.length > 50 ? '...' : '')}
              title="Text Reversal History"
              maxDisplay={10}
            />
          </div>
        )}
      </div>
    </Layout>
  )
}

