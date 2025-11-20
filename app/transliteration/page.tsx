'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

const cyrillicToLatin: { [key: string]: string } = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
  'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
  'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
}

const latinToCyrillic: { [key: string]: string } = {
  'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д', 'e': 'е', 'yo': 'ё',
  'zh': 'ж', 'z': 'з', 'i': 'и', 'y': 'й', 'k': 'к', 'l': 'л', 'm': 'м',
  'n': 'н', 'o': 'о', 'p': 'п', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у',
  'f': 'ф', 'h': 'х', 'ts': 'ц', 'ch': 'ч', 'sh': 'ш', 'sch': 'щ',
  'yu': 'ю', 'ya': 'я',
  'A': 'А', 'B': 'Б', 'V': 'В', 'G': 'Г', 'D': 'Д', 'E': 'Е', 'Yo': 'Ё',
  'Zh': 'Ж', 'Z': 'З', 'I': 'И', 'Y': 'Й', 'K': 'К', 'L': 'Л', 'M': 'М',
  'N': 'Н', 'O': 'О', 'P': 'П', 'R': 'Р', 'S': 'С', 'T': 'Т', 'U': 'У',
  'F': 'Ф', 'H': 'Х', 'Ts': 'Ц', 'Ch': 'Ч', 'Sh': 'Ш', 'Sch': 'Щ',
  'Yu': 'Ю', 'Ya': 'Я'
}

export default function TransliterationPage() {
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [direction, setDirection] = useState<'cyr-to-lat' | 'lat-to-cyr'>('cyr-to-lat')
  const [autoTransliterate, setAutoTransliterate] = useState(true)
  const [totalOperations, setTotalOperations] = useState(0)

  const transliterate = useCallback(() => {
    if (!text.trim()) {
      setResult('')
      return
    }

    if (direction === 'cyr-to-lat') {
      let output = ''
      for (let i = 0; i < text.length; i++) {
        const char = text[i]
        // Check for multi-character combinations first
        if (i < text.length - 2) {
          const threeChar = text.substring(i, i + 3)
          if (cyrillicToLatin[threeChar]) {
            output += cyrillicToLatin[threeChar]
            i += 2
            continue
          }
        }
        if (i < text.length - 1) {
          const twoChar = text.substring(i, i + 2)
          if (cyrillicToLatin[twoChar]) {
            output += cyrillicToLatin[twoChar]
            i += 1
            continue
          }
        }
        output += cyrillicToLatin[char] || char
      }
      setResult(output)
    } else {
      let output = ''
      let i = 0
      while (i < text.length) {
        let found = false
        // Check three-character combinations first
        if (i < text.length - 2) {
          const threeChar = text.substring(i, i + 3)
          if (latinToCyrillic[threeChar]) {
            output += latinToCyrillic[threeChar]
            i += 3
            found = true
          }
        }
        // Check two-character combinations
        if (!found && i < text.length - 1) {
          const twoChar = text.substring(i, i + 2)
          if (latinToCyrillic[twoChar]) {
            output += latinToCyrillic[twoChar]
            i += 2
            found = true
          }
        }
        // Single character
        if (!found) {
          output += latinToCyrillic[text[i]] || text[i]
          i++
        }
      }
      setResult(output)
    }
    setTotalOperations(prev => prev + 1)
  }, [text, direction])

  useEffect(() => {
    if (autoTransliterate && text) {
      const timeoutId = setTimeout(() => {
        transliterate()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [text, direction, autoTransliterate, transliterate])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result)
    } catch (e) {
      console.error('Failed to copy')
    }
  }

  const exportToFile = () => {
    const blob = new Blob([result], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transliteration.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setText('')
    setResult('')
  }

  // SEO data
  const toolPath = '/transliteration'
  const toolName = 'Transliteration Tool'
  const category = 'text'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is transliteration?",
      answer: "Transliteration is the process of converting text from one writing system to another. This tool converts between Cyrillic (used in Russian, Bulgarian, Serbian, etc.) and Latin (English alphabet) scripts."
    },
    {
      question: "How do I convert Cyrillic to Latin?",
      answer: "Select 'Cyrillic → Latin' direction, enter or paste your Cyrillic text, and the tool automatically converts it to Latin script. Enable auto-convert for real-time conversion as you type."
    },
    {
      question: "How do I convert Latin to Cyrillic?",
      answer: "Select 'Latin → Cyrillic' direction, enter or paste your Latin text, and the tool automatically converts it to Cyrillic script. The conversion follows standard transliteration rules."
    },
    {
      question: "What languages are supported?",
      answer: "The tool supports transliteration for languages using Cyrillic script, primarily Russian, but also works for Bulgarian, Serbian, Ukrainian, and other Cyrillic-based languages."
    },
    {
      question: "Is the transliteration accurate?",
      answer: "The tool uses standard transliteration rules. However, transliteration is not always perfect as some sounds don't have direct equivalents. The tool provides the most common transliteration mappings."
    },
    {
      question: "Is the transliteration tool free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All transliteration happens in your browser - we never see or store your text."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Select Direction",
      text: "Choose the conversion direction: 'Cyrillic → Latin' to convert Cyrillic text to Latin, or 'Latin → Cyrillic' to convert Latin text to Cyrillic."
    },
    {
      name: "Enter Your Text",
      text: "Type or paste the text you want to transliterate in the input field. The text should be in the source script (Cyrillic or Latin)."
    },
    {
      name: "Enable Auto-Convert (Optional)",
      text: "Enable 'Auto-convert' for real-time transliteration as you type. This provides instant feedback and makes the conversion process faster."
    },
    {
      name: "View Results",
      text: "See the transliterated text in the output area. The conversion follows standard transliteration rules for the selected direction."
    },
    {
      name: "Copy or Export",
      text: "Copy the transliterated text to your clipboard or export it to a file. Use it for names, addresses, or any text that needs to be converted between scripts."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Convert Between Cyrillic and Latin Scripts",
      "Learn how to transliterate text between Cyrillic and Latin scripts using our free online transliteration tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Transliteration Tool",
      "Free online transliteration tool. Convert between Cyrillic and Latin scripts in real-time. Support for Russian, Bulgarian, Serbian, and other Cyrillic languages. Auto-convert option and export functionality.",
      "https://prylad.pro/transliteration",
      "UtilityApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🔄 Transliteration - Convert Cyrillic to Latin & Vice Versa"
        description="Convert between Cyrillic and Latin scripts online for free. Real-time transliteration with auto-convert option. Export results. No registration required."
        breadcrumbs={breadcrumbs}
      >
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Main Tool */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
          {/* Direction Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Transliteration Direction:</label>
            <div className="flex gap-3">
              <button
                onClick={() => setDirection('cyr-to-lat')}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  direction === 'cyr-to-lat'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Cyrillic → Latin
              </button>
              <button
                onClick={() => setDirection('lat-to-cyr')}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  direction === 'lat-to-cyr'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Latin → Cyrillic
              </button>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoTransliterate}
                onChange={(e) => setAutoTransliterate(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-transliterate as you type</span>
            </label>
          </div>

          {/* Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {direction === 'cyr-to-lat' ? 'Cyrillic Text' : 'Latin Text'}
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">{text.length} chars</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-32 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder={direction === 'cyr-to-lat' ? 'Enter Cyrillic text (e.g., Привет мир)...' : 'Enter Latin text (e.g., Privet mir)...'}
            />
          </div>

          {/* Manual Transliterate Button */}
          {!autoTransliterate && (
            <button
              onClick={transliterate}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
            >
              Transliterate
            </button>
          )}

          {/* Result */}
          {result && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {direction === 'cyr-to-lat' ? 'Latin Text' : 'Cyrillic Text'}
                </label>
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
                value={result}
                readOnly
                className="w-full h-32 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 resize-none text-gray-900 dark:text-gray-100"
              />
            </div>
          )}

          {/* Clear Button */}
          {(text || result) && (
            <button
              onClick={clearAll}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Clear All
            </button>
          )}

          {/* Total Operations */}
          {totalOperations > 0 && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Total transliterations: <span className="font-semibold">{totalOperations}</span>
            </div>
          )}
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is Transliteration?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Transliteration is the process of converting text from one writing system to another, representing 
                the sounds or characters of one script using the characters of another. Unlike translation, which 
                converts meaning between languages, transliteration focuses on representing the sounds or characters 
                of the source script.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our free online transliteration tool converts between Cyrillic (used in Russian, Bulgarian, Serbian, 
                and other languages) and Latin scripts. This is useful for typing Russian text using a standard 
                keyboard, creating URLs with Cyrillic content, or converting names and terms between scripts.
              </p>
            </div>
          </section>

          {/* How to Use */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use Our Transliteration Tool</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li><strong>Choose Direction:</strong> Select whether you want to convert from Cyrillic to Latin or from Latin to Cyrillic.</li>
                <li><strong>Enable Auto-Transliterate:</strong> Check the &quot;Auto-transliterate&quot; option to see results in real-time as you type, or uncheck it to transliterate manually.</li>
                <li><strong>Enter Your Text:</strong> Type or paste the text you want to transliterate in the input field.</li>
                <li><strong>Review Results:</strong> The transliterated text appears automatically (if auto-transliterate is enabled) or after clicking &quot;Transliterate&quot;.</li>
                <li><strong>Copy or Export:</strong> Click &quot;Copy&quot; to copy the result to your clipboard, or &quot;Export&quot; to save it as a text file.</li>
              </ol>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">⌨️ Typing Russian Text</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Type Russian text using a standard QWERTY keyboard by entering the Latin transliteration, 
                  then convert it to Cyrillic. Perfect for users without Cyrillic keyboard layouts.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🌐 URL Creation</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Create SEO-friendly URLs from Cyrillic text by converting to Latin. Many web systems 
                  require Latin characters in URLs, making transliteration essential.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📝 Name Conversion</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Convert names, addresses, or other proper nouns between Cyrillic and Latin scripts. 
                  Useful for official documents, forms, or international communication.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔤 Learning & Education</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Learn Cyrillic script by seeing how words are transliterated. Compare Cyrillic and 
                  Latin versions to understand pronunciation and script relationships.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the difference between transliteration and translation?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Transliteration converts text from one writing system to another (e.g., Cyrillic to Latin), 
                  representing sounds or characters. Translation converts meaning between languages. For example, 
                  &quot;Привет&quot; transliterates to &quot;Privet&quot; (same meaning, different script), while it translates to 
                  &quot;Hello&quot; (different language).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Which transliteration standard does this tool use?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our tool uses a common transliteration scheme that maps Cyrillic characters to their Latin 
                  equivalents. This is based on standard transliteration practices used for Russian and other 
                  Cyrillic-based languages.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I transliterate other languages that use Cyrillic?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  While our tool is optimized for Russian, it can handle other Cyrillic-based languages like 
                  Bulgarian, Serbian, Ukrainian, and others. Some language-specific characters may have 
                  different transliterations.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Is my text stored or transmitted?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, all transliteration happens entirely in your browser. We never see, store, or transmit 
                  any of your text. Your privacy is completely protected.
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

