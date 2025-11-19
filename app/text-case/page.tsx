'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
type CaseType = 'uppercase' | 'lowercase' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'alternating' | 'inverse'

export default function TextCasePage() {
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [selectedCase, setSelectedCase] = useState<CaseType | null>(null)
  const [totalTransforms, setTotalTransforms] = useState(0)
  const transform = useCallback((type: CaseType) => {
    if (!text.trim()) {
      setResult('')
      return
    }

    let transformed = ''
    switch (type) {
      case 'uppercase':
        transformed = text.toUpperCase()
        break
      case 'lowercase':
        transformed = text.toLowerCase()
        break
      case 'title':
        transformed = text
          .toLowerCase()
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        break
      case 'sentence':
        transformed = text
          .toLowerCase()
          .split(/([.!?]\s+)/)
          .map((part, i) => {
            if (i === 0 || /[.!?]\s+/.test(part)) {
              return part.charAt(0).toUpperCase() + part.slice(1)
            }
            return part
          })
          .join('')
        break
      case 'camel':
        transformed = text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
          .replace(/^[A-Z]/, (chr) => chr.toLowerCase())
        break
      case 'pascal':
        transformed = text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
          .replace(/^[a-z]/, (chr) => chr.toUpperCase())
        break
      case 'snake':
        transformed = text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
        break
      case 'kebab':
        transformed = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        break
      case 'constant':
        transformed = text.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
        break
      case 'alternating':
        transformed = text
          .split('')
          .map((char, i) => i % 2 === 0 ? char.toUpperCase() : char.toLowerCase())
          .join('')
        break
      case 'inverse':
        transformed = text
          .split('')
          .map((char) => {
            if (char === char.toUpperCase() && char !== char.toLowerCase()) {
              return char.toLowerCase()
            } else if (char === char.toLowerCase() && char !== char.toUpperCase()) {
              return char.toUpperCase()
            }
            return char
          })
          .join('')
        break
      default:
        transformed = text
    }
    setResult(transformed)
    setSelectedCase(type)
    setTotalTransforms(prev => prev + 1)
  }, [text])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
    }
  }

  const exportToFile = () => {
    if (!result) return
    const blob = new Blob([result], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `text-case-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: () => exportToFile(),
    onClear: () => {
      setText('')
      setResult('')
      setSelectedCase(null)
    }
  })

  return (
    <>
      <Layout
      title="⌨️ Text Case Converter"
      description="Convert text to different cases: UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case, and more. Free online text case converter."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6">
          <div className="space-y-6">
            {/* Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Source Text:</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-40 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Enter text to convert..."
              />
              {text && (
                <p className="text-xs text-gray-500 mt-1">
                  {text.length} characters
                </p>
              )}
            </div>

            {/* Case Buttons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Convert To:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {([
                  { type: 'uppercase', label: 'UPPERCASE', desc: 'ALL CAPS' },
                  { type: 'lowercase', label: 'lowercase', desc: 'all small' },
                  { type: 'title', label: 'Title Case', desc: 'Each Word' },
                  { type: 'sentence', label: 'Sentence case', desc: 'First letter' },
                  { type: 'camel', label: 'camelCase', desc: 'firstWord' },
                  { type: 'pascal', label: 'PascalCase', desc: 'FirstWord' },
                  { type: 'snake', label: 'snake_case', desc: 'snake_case' },
                  { type: 'kebab', label: 'kebab-case', desc: 'kebab-case' },
                  { type: 'constant', label: 'CONSTANT_CASE', desc: 'CONSTANT' },
                  { type: 'alternating', label: 'AlTeRnAtInG', desc: 'aLtErNaTiNg' },
                  { type: 'inverse', label: 'iNvErSe', desc: 'InVeRsE' },
                ] as { type: CaseType; label: string; desc: string }[]).map(({ type, label, desc }) => (
                  <button
                    key={type}
                    onClick={() => transform(type)}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                      selectedCase === type
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={desc}
                  >
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
              <h2 className="text-xl font-bold">Result:</h2>
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
              className="w-full h-40 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 resize-none"
            />
            {totalTransforms > 0 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Total conversions: <span className="font-semibold text-primary-600">{totalTransforms}</span>
              </p>
            )}
          </div>
        )}

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Text Case Conversion?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Text case conversion is the process of changing the capitalization of text. Different case styles 
                serve different purposes in programming, writing, and design. For example, programming languages 
                use specific case conventions (camelCase, snake_case) for variable and function names, while 
                writing styles use Title Case or Sentence case for readability.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free text case converter supports 11 different case styles, from simple uppercase/lowercase 
                conversions to programming-specific formats like camelCase, PascalCase, and snake_case. Convert 
                text instantly with a single click, perfect for developers, writers, and anyone working with text.
              </p>
            </div>
          </section>

          {/* Case Types */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Text Case Types Explained</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">UPPERCASE</h3>
                <p className="text-gray-700 text-sm mb-2">
                  All letters are capitalized. Used for emphasis, headings, or when following specific style guides.
                </p>
                <p className="text-xs text-gray-600"><strong>Example:</strong> HELLO WORLD</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">lowercase</h3>
                <p className="text-gray-700 text-sm mb-2">
                  All letters are in lowercase. Common in programming, URLs, and informal writing.
                </p>
                <p className="text-xs text-gray-600"><strong>Example:</strong> hello world</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Title Case</h3>
                <p className="text-gray-700 text-sm mb-2">
                  First letter of each word is capitalized. Used in titles, headings, and formal writing.
                </p>
                <p className="text-xs text-gray-600"><strong>Example:</strong> Hello World</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sentence case</h3>
                <p className="text-gray-700 text-sm mb-2">
                  First letter of the sentence is capitalized, rest is lowercase. Standard for most writing.
                </p>
                <p className="text-xs text-gray-600"><strong>Example:</strong> Hello world</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">camelCase</h3>
                <p className="text-gray-700 text-sm mb-2">
                  First word lowercase, subsequent words capitalized. Common in JavaScript, Java, and C#.
                </p>
                <p className="text-xs text-gray-600"><strong>Example:</strong> helloWorld</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">PascalCase</h3>
                <p className="text-gray-700 text-sm mb-2">
                  First letter of each word capitalized. Used for class names in many programming languages.
                </p>
                <p className="text-xs text-gray-600"><strong>Example:</strong> HelloWorld</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">snake_case</h3>
                <p className="text-gray-700 text-sm mb-2">
                  Words separated by underscores, all lowercase. Common in Python, Ruby, and database naming.
                </p>
                <p className="text-xs text-gray-600"><strong>Example:</strong> hello_world</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">kebab-case</h3>
                <p className="text-gray-700 text-sm mb-2">
                  Words separated by hyphens, all lowercase. Used in URLs, CSS classes, and HTML attributes.
                </p>
                <p className="text-xs text-gray-600"><strong>Example:</strong> hello-world</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">CONSTANT_CASE</h3>
                <p className="text-gray-700 text-sm mb-2">
                  All uppercase with underscores. Used for constants in programming languages.
                </p>
                <p className="text-xs text-gray-600"><strong>Example:</strong> HELLO_WORLD</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AlTeRnAtInG</h3>
                <p className="text-gray-700 text-sm mb-2">
                  Alternates between uppercase and lowercase. Used for stylistic purposes or mocking text.
                </p>
                <p className="text-xs text-gray-600"><strong>Example:</strong> HeLlO wOrLd</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">iNvErSe</h3>
                <p className="text-gray-700 text-sm mb-2">
                  Inverts the case of each letter. Uppercase becomes lowercase and vice versa.
                </p>
                <p className="text-xs text-gray-600"><strong>Example:</strong> hELLO WORLD</p>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💻 Programming</h3>
                <p className="text-gray-700 text-sm">
                  Convert variable names, function names, and class names between different case conventions. 
                  Essential when switching between programming languages or following style guides.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Writing</h3>
                <p className="text-gray-700 text-sm">
                  Convert text to Title Case for headings, Sentence case for body text, or UPPERCASE for 
                  emphasis. Perfect for formatting documents and articles.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🔗 URLs & Slugs</h3>
                <p className="text-gray-700 text-sm">
                  Convert text to kebab-case for URL slugs, or snake_case for database fields. Ensure 
                  consistent naming across your application.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Data Processing</h3>
                <p className="text-gray-700 text-sm">
                  Normalize text data by converting to consistent case formats. Useful for data cleaning, 
                  database imports, and API integrations.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⌨️</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">11 Case Types</h3>
                  <p className="text-gray-700 text-sm">
                    Convert to uppercase, lowercase, title case, sentence case, camelCase, PascalCase, 
                    snake_case, kebab-case, CONSTANT_CASE, alternating, and inverse case.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Instant Conversion</h3>
                  <p className="text-gray-700 text-sm">
                    Convert text with a single click. No waiting, no processing delays. Get results 
                    immediately for any case style.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📥</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Export Options</h3>
                  <p className="text-gray-700 text-sm">
                    Copy converted text to clipboard or export to a text file. Easy integration into 
                    your workflow and projects.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Privacy First</h3>
                  <p className="text-gray-700 text-sm">
                    All text conversion happens locally in your browser. We never see, store, or have 
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
                <h3 className="font-semibold text-gray-900 mb-2">What's the difference between camelCase and PascalCase?</h3>
                <p className="text-gray-700 text-sm">
                  camelCase starts with a lowercase letter (e.g., "helloWorld"), while PascalCase starts 
                  with an uppercase letter (e.g., "HelloWorld"). camelCase is used for variables and functions, 
                  PascalCase for classes and types.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">When should I use snake_case vs kebab-case?</h3>
                <p className="text-gray-700 text-sm">
                  snake_case uses underscores and is common in Python, Ruby, and databases. kebab-case uses 
                  hyphens and is common in URLs, CSS classes, and HTML attributes. Choose based on your 
                  technology stack and conventions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you store my converted text?</h3>
                <p className="text-gray-700 text-sm">
                  No, absolutely not. All text conversion happens entirely in your browser. We never see, 
                  store, transmit, or have any access to your text. Your privacy is completely protected.
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

