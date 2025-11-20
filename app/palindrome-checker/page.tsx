'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

export default function PalindromeCheckerPage() {
  const [text, setText] = useState('')
  const [isPalindrome, setIsPalindrome] = useState<boolean | null>(null)
  const [cleanedText, setCleanedText] = useState('')
  const [reversedText, setReversedText] = useState('')
  const [ignoreCase, setIgnoreCase] = useState(true)
  const [ignoreSpaces, setIgnoreSpaces] = useState(true)
  const [ignorePunctuation, setIgnorePunctuation] = useState(true)
  const [ignoreNumbers, setIgnoreNumbers] = useState(false)
  const [autoCheck, setAutoCheck] = useState(true)
  const [totalChecks, setTotalChecks] = useState(0)

  const examples = [
    'A man a plan a canal Panama',
    'race car',
    'Never odd or even',
    'Madam',
    'level',
    'radar',
    'rotor',
    'civic',
    'deified',
    'noon'
  ]

  const checkPalindrome = useCallback(() => {
    if (!text.trim()) {
      setIsPalindrome(null)
      setCleanedText('')
      setReversedText('')
      return
    }

    let cleaned = text
    if (ignoreCase) {
      cleaned = cleaned.toLowerCase()
    }
    if (ignoreSpaces) {
      cleaned = cleaned.replace(/\s+/g, '')
    }
    if (ignorePunctuation) {
      cleaned = cleaned.replace(/[^\w\s]/g, '')
    }
    if (ignoreNumbers) {
      cleaned = cleaned.replace(/\d/g, '')
    }
    
    // Remove any remaining non-alphanumeric if punctuation is ignored
    if (ignorePunctuation) {
      cleaned = cleaned.replace(/[^a-z0-9]/gi, '')
    }

    const reversed = cleaned.split('').reverse().join('')
    const isPal = cleaned === reversed

    setCleanedText(cleaned)
    setReversedText(reversed)
    setIsPalindrome(isPal)
    setTotalChecks(prev => prev + 1)
  }, [text, ignoreCase, ignoreSpaces, ignorePunctuation, ignoreNumbers])

  useEffect(() => {
    if (autoCheck) {
      const timeoutId = setTimeout(() => {
        checkPalindrome()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [text, ignoreCase, ignoreSpaces, ignorePunctuation, ignoreNumbers, autoCheck, checkPalindrome])

  const loadExample = (example: string) => {
    setText(example)
    setTimeout(() => checkPalindrome(), 100)
  }

  const exportToFile = () => {
    const result = `Palindrome Check Result\n\n` +
      `Original Text: ${text}\n` +
      `Cleaned Text: ${cleanedText}\n` +
      `Reversed Text: ${reversedText}\n` +
      `Is Palindrome: ${isPalindrome ? 'Yes' : 'No'}\n` +
      `\nOptions:\n` +
      `- Ignore Case: ${ignoreCase}\n` +
      `- Ignore Spaces: ${ignoreSpaces}\n` +
      `- Ignore Punctuation: ${ignorePunctuation}\n` +
      `- Ignore Numbers: ${ignoreNumbers}`
    
    const blob = new Blob([result], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'palindrome-check.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setText('')
    setIsPalindrome(null)
    setCleanedText('')
    setReversedText('')
  }

  // SEO data
  const toolPath = '/palindrome-checker'
  const toolName = 'Palindrome Checker'
  const category = 'text'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is a palindrome?",
      answer: "A palindrome is a word, phrase, number, or sequence of characters that reads the same forward and backward. Examples include 'race car', 'level', 'A man a plan a canal Panama', and 'madam'."
    },
    {
      question: "How do I check if text is a palindrome?",
      answer: "Enter your text in the input field, and the tool automatically checks if it's a palindrome. You can customize options to ignore case, spaces, punctuation, or numbers. The result shows whether the text is a palindrome and displays the cleaned and reversed text."
    },
    {
      question: "What options can I customize?",
      answer: "Four options: Ignore Case (treat uppercase and lowercase as the same), Ignore Spaces (remove spaces before checking), Ignore Punctuation (remove punctuation marks), and Ignore Numbers (remove numbers). These help check palindromes in various formats."
    },
    {
      question: "What does 'cleaned text' mean?",
      answer: "Cleaned text is your input text after applying the ignore options (case, spaces, punctuation, numbers). This is the text that's actually used for palindrome checking."
    },
    {
      question: "Can I see examples of palindromes?",
      answer: "Yes! Click on any example palindrome (like 'A man a plan a canal Panama', 'race car', 'level', etc.) to load it into the checker and see how it works."
    },
    {
      question: "Is the palindrome checker free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All palindrome checking happens in your browser - we never see or store your text."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Enter Text",
      text: "Type or paste your text into the input field. You can enter words, phrases, sentences, or even numbers."
    },
    {
      name: "Configure Options",
      text: "Choose which characters to ignore: Ignore Case (for case-insensitive checking), Ignore Spaces (remove spaces), Ignore Punctuation (remove punctuation), or Ignore Numbers (remove numbers)."
    },
    {
      name: "View Results",
      text: "See if your text is a palindrome. The tool shows the cleaned text (after applying ignore options) and the reversed text for comparison."
    },
    {
      name: "Try Examples",
      text: "Click on example palindromes to see how they work. Examples include 'race car', 'level', 'A man a plan a canal Panama', and more."
    },
    {
      name: "Export Results",
      text: "Copy the results or export them if needed. The checker works automatically as you type (if auto-check is enabled)."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Check if Text is a Palindrome",
      "Learn how to check if text is a palindrome using our free online palindrome checker tool with customizable options.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Palindrome Checker",
      "Free online palindrome checker. Check if text is a palindrome with customizable options: ignore case, spaces, punctuation, numbers. See cleaned and reversed text. Perfect for word games and text analysis.",
      "https://prylad.pro/palindrome-checker",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🔄 Palindrome Checker - Check if Text is a Palindrome"
        description="Check if text is a palindrome online for free. Customize options: ignore case, spaces, punctuation, numbers. See cleaned and reversed text. Export results. No registration required."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Main Tool */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          {/* Options */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Options:</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ignoreCase}
                  onChange={(e) => setIgnoreCase(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Ignore case</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ignoreSpaces}
                  onChange={(e) => setIgnoreSpaces(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Ignore spaces</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ignorePunctuation}
                  onChange={(e) => setIgnorePunctuation(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Ignore punctuation</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ignoreNumbers}
                  onChange={(e) => setIgnoreNumbers(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Ignore numbers</span>
              </label>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCheck}
                onChange={(e) => setAutoCheck(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-check as you type</span>
            </label>
          </div>

          {/* Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Enter Text</label>
              <span className="text-xs text-gray-500 dark:text-gray-400">{text.length} chars</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-32 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="Enter text to check if it's a palindrome..."
            />
          </div>

          {/* Manual Check Button */}
          {!autoCheck && (
            <button
              onClick={checkPalindrome}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
            >
              Check Palindrome
            </button>
          )}

          {/* Result */}
          {isPalindrome !== null && (
            <div className={`p-6 rounded-xl border-2 ${
              isPalindrome
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300'
                : 'bg-red-50 dark:bg-red-900/20 border-red-300'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{isPalindrome ? '✅' : '❌'}</span>
                <div>
                  <h3 className="text-lg font-bold mb-1">
                    {isPalindrome ? 'It\'s a palindrome!' : 'Not a palindrome'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isPalindrome
                      ? 'Text reads the same forwards and backwards'
                      : 'Text does not read the same forwards and backwards'}
                  </p>
                </div>
              </div>
              
              {cleanedText && (
                <div className="space-y-2 mt-4 pt-4 border-t border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cleaned Text:</p>
                    <p className="font-mono text-sm bg-white dark:bg-gray-800 p-2 rounded border">{cleanedText || '(empty)'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Reversed Text:</p>
                    <p className="font-mono text-sm bg-white dark:bg-gray-800 p-2 rounded border">{reversedText || '(empty)'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {(text || isPalindrome !== null) && (
            <div className="flex gap-3">
              <button
                onClick={exportToFile}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Export Result
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Clear
              </button>
            </div>
          )}

          {/* Total Checks */}
          {totalChecks > 0 && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Total checks: <span className="font-semibold">{totalChecks}</span>
            </div>
          )}
        </div>

        {/* Examples */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">💡 Try Examples</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => loadExample(example)}
                className="text-left p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <p className="font-mono truncate">{example}</p>
              </button>
            ))}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is a Palindrome?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                A palindrome is a word, phrase, number, or sequence of characters that reads the same forwards and 
                backwards. The term comes from the Greek words &quot;palin&quot; (again) and &quot;dromos&quot; (way, direction), 
                meaning &quot;running back again.&quot;
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Famous examples include words like &quot;radar,&quot; &quot;level,&quot; and &quot;civic,&quot; as well as phrases like 
                &quot;A man a plan a canal Panama&quot; and &quot;Never odd or even.&quot; Palindromes can be found in many languages 
                and are often used in wordplay, puzzles, and literature.
              </p>
            </div>
          </section>

          {/* How to Use */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use Our Palindrome Checker</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li><strong>Set Options:</strong> Choose which characters to ignore: case, spaces, punctuation, or numbers.</li>
                <li><strong>Enable Auto-Check:</strong> Check the &quot;Auto-check&quot; option to see results in real-time as you type.</li>
                <li><strong>Enter Your Text:</strong> Type or paste the text you want to check in the input field.</li>
                <li><strong>Review Results:</strong> See if your text is a palindrome, along with the cleaned and reversed versions.</li>
                <li><strong>Try Examples:</strong> Click on example palindromes to see how they work with different options.</li>
                <li><strong>Export Results:</strong> Save the check result to a text file for documentation or sharing.</li>
              </ol>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📚 Education & Learning</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Learn about palindromes, practice identifying them, and understand how text processing works. 
                  Great for students learning about strings, algorithms, and text manipulation.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">💻 Programming Practice</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Test palindrome-checking algorithms, verify implementations, or use as a reference when 
                  writing code that needs to check for palindromes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎮 Word Games & Puzzles</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Check if words or phrases are palindromes for word games, puzzles, or competitions. 
                  Discover new palindromes or verify existing ones.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">✍️ Creative Writing</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use palindromes in creative writing, poetry, or wordplay. Check if your creations read 
                  the same forwards and backwards.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What makes a text a palindrome?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  A text is a palindrome if it reads the same forwards and backwards after applying your 
                  selected options (ignoring case, spaces, punctuation, etc.). For example, &quot;A man a plan 
                  a canal Panama&quot; is a palindrome when spaces and case are ignored.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Why are there options to ignore certain characters?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Different contexts require different palindrome definitions. Sometimes you want to check 
                  if text is a palindrome ignoring spaces and punctuation (like &quot;A man a plan a canal Panama&quot;), 
                  while other times you want exact character-by-character matching.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can numbers be palindromes?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes! Numbers can be palindromes too. For example, 121, 1331, and 12321 are palindromic numbers. 
                  Our tool can check numeric palindromes when numbers are not ignored.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the longest palindrome?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  The longest single-word palindrome in English is &quot;tattarrattat&quot; (12 letters), coined by 
                  James Joyce. The longest palindromic phrase is much longer and depends on how you define 
                  &quot;phrase&quot; and which characters you ignore.
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

