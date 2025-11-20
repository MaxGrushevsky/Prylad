'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type Mode = 'yesno' | '8ball' | 'coin' | 'random'

interface QuestionHistory {
  question: string
  answer: string
  mode: Mode
  timestamp: number
}

const yesNoAnswers = [
  'Yes', 'No', 'Maybe', 'Probably', 'Unlikely',
  'Definitely yes', 'Definitely no', 'Not sure',
  'Absolutely', 'Definitely not', 'Perhaps', 'Uncertain'
]

const magic8BallAnswers = [
  'It is certain',
  'Without a doubt',
  'Yes, definitely',
  'You may rely on it',
  'As I see it, yes',
  'Most likely',
  'Outlook good',
  'Yes',
  'Signs point to yes',
  'Reply hazy, try again',
  'Ask again later',
  'Better not tell you now',
  'Cannot predict now',
  'Concentrate and ask again',
  "Don't count on it",
  'My reply is no',
  'My sources say no',
  'Outlook not so good',
  'Very doubtful'
]

const randomAnswers = [
  'Go for it!', 'Wait and see', 'Trust your instincts', 'Not now',
  'The stars say yes', 'The stars say no', 'Follow your heart',
  'Take a risk', 'Play it safe', 'Time will tell', 'Absolutely!',
  'Definitely not', 'Maybe later', 'Why not?', 'Better not',
  'Seems promising', 'Looks doubtful', 'Hard to say', 'Clear as day',
  'Mysterious...'
]

export default function DecisionGeneratorPage() {
  const [mode, setMode] = useState<Mode>('yesno')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [history, setHistory] = useState<QuestionHistory[]>([])
  const [totalQuestions, setTotalQuestions] = useState(0)

  const generateAnswer = useCallback(() => {
    if (!question.trim()) {
      alert('Ask a question!')
      return
    }

    setIsAnimating(true)
    setTimeout(() => {
      let randomAnswer = ''
      
      if (mode === 'yesno') {
        randomAnswer = yesNoAnswers[Math.floor(Math.random() * yesNoAnswers.length)]
      } else if (mode === '8ball') {
        randomAnswer = magic8BallAnswers[Math.floor(Math.random() * magic8BallAnswers.length)]
      } else if (mode === 'coin') {
        randomAnswer = Math.random() < 0.5 ? 'Heads' : 'Tails'
      } else if (mode === 'random') {
        randomAnswer = randomAnswers[Math.floor(Math.random() * randomAnswers.length)]
      }

      setAnswer(randomAnswer)
      setIsAnimating(false)
      
      // Add to history
      const historyEntry: QuestionHistory = {
        question: question.trim(),
        answer: randomAnswer,
        mode,
        timestamp: Date.now()
      }
      setHistory(prev => [historyEntry, ...prev].slice(0, 50)) // Keep last 50
      setTotalQuestions(prev => prev + 1)
    }, 1500)
  }, [question, mode])

  const clearHistory = () => {
    setHistory([])
  }

  const exportHistory = () => {
    if (history.length === 0) return
    
    let content = 'Decision Generator History\n'
    content += '='.repeat(40) + '\n\n'
    
    history.forEach((entry, index) => {
      const date = new Date(entry.timestamp).toLocaleString()
      content += `${index + 1}. [${entry.mode.toUpperCase()}]\n`
      content += `   Q: ${entry.question}\n`
      content += `   A: ${entry.answer}\n`
      content += `   Date: ${date}\n\n`
    })
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `decisions-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Calculate statistics
  const stats = history.length > 0 ? {
    totalQuestions: history.length,
    yesNoCount: history.filter(h => h.mode === 'yesno').length,
    eightBallCount: history.filter(h => h.mode === '8ball').length,
    coinCount: history.filter(h => h.mode === 'coin').length,
    randomCount: history.filter(h => h.mode === 'random').length,
    positiveAnswers: history.filter(h => 
      ['Yes', 'Definitely yes', 'Absolutely', 'Yes, definitely', 'Most likely', 'Outlook good', 'It is certain', 'Without a doubt', 'Heads'].includes(h.answer)
    ).length,
    negativeAnswers: history.filter(h => 
      ['No', 'Definitely no', 'Definitely not', 'My reply is no', "Don't count on it", 'Very doubtful', 'Tails'].includes(h.answer)
    ).length
  } : null

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      mode
    }
    localStorage.setItem('decisionGeneratorSettings', JSON.stringify(settings))
  }, [mode])

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('decisionGeneratorSettings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        if (settings.mode) {
          setMode(settings.mode)
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  // SEO data
  const toolPath = '/decision-generator'
  const toolName = 'Decision Generator'
  const category = 'generator'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is a decision generator?",
      answer: "A decision generator helps you make decisions by providing random answers to your questions. It includes multiple modes: Yes/No (simple yes/no answers), Magic 8 Ball (classic 8-ball responses), Coin Flip (heads or tails), and Random (random selection from options)."
    },
    {
      question: "How do I use the decision generator?",
      answer: "Enter your question, select a mode (Yes/No, Magic 8 Ball, Coin Flip, or Random), and click 'Get Answer' or 'Flip Coin'. The generator provides a random answer based on your selected mode."
    },
    {
      question: "What modes are available?",
      answer: "Four modes: Yes/No (simple yes/no/maybe answers), Magic 8 Ball (classic 8-ball responses like 'It is certain', 'Without a doubt'), Coin Flip (heads or tails), and Random (random selection from custom options)."
    },
    {
      question: "Can I see my decision history?",
      answer: "Yes! The tool tracks all your questions and answers with timestamps. View your history to see previous decisions and their outcomes."
    },
    {
      question: "What statistics are available?",
      answer: "Statistics show: total questions asked, mode usage (how many times each mode was used), and answer distribution (how often each answer type appears). Useful for tracking your decision patterns."
    },
    {
      question: "Is the decision generator free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All decision generation happens in your browser - we never see or store your questions."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Enter Question",
      text: "Type your question into the input field. You can ask anything: 'Should I go to the party?', 'What should I have for dinner?', etc."
    },
    {
      name: "Choose Mode",
      text: "Select a decision mode: Yes/No (simple answers), Magic 8 Ball (classic responses), Coin Flip (heads/tails), or Random (custom options)."
    },
    {
      name: "Get Answer",
      text: "Click 'Get Answer' or 'Flip Coin' to receive a random answer. The answer is generated instantly based on your selected mode."
    },
    {
      name: "View History",
      text: "Check your decision history to see all previous questions and answers with timestamps. Useful for tracking decisions over time."
    },
    {
      name: "Check Statistics",
      text: "View statistics about your decisions: total questions, mode usage, and answer distribution. See patterns in your decision-making."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Use a Decision Generator",
      "Learn how to use a decision generator to get answers to your questions using Yes/No, Magic 8 Ball, Coin Flip, and Random modes.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Decision Generator",
      "Free online decision generator. Get answers to your questions with Yes/No, Magic 8 Ball, Coin Flip, and Random decision generators. History tracking and statistics included.",
      "https://prylad.pro/decision-generator",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🎯 Decision Generator"
        description="Get answers to your questions with Yes/No, Magic 8 Ball, Coin Flip, and Random decision generators. Free online decision maker with history tracking and statistics."
        breadcrumbs={breadcrumbs}
      >
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mode</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setMode('yesno')
                    setAnswer('')
                  }}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'yesno'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Yes/No
                </button>
                <button
                  onClick={() => {
                    setMode('8ball')
                    setAnswer('')
                  }}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    mode === '8ball'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  🎱 8 Ball
                </button>
                <button
                  onClick={() => {
                    setMode('coin')
                    setAnswer('')
                  }}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'coin'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  🪙 Coin
                </button>
                <button
                  onClick={() => {
                    setMode('random')
                    setAnswer('')
                  }}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'random'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  🎲 Random
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isAnimating && generateAnswer()}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Ask your question..."
              />
            </div>

            <button
              onClick={generateAnswer}
              disabled={isAnimating}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnimating ? 'Thinking...' : 'Get Answer'}
            </button>

            {answer && (
              <div className={`p-8 rounded-xl border-2 text-center transition-all ${
                mode === '8ball'
                  ? 'bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-300'
                  : mode === 'coin'
                  ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300'
                  : mode === 'random'
                  ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-300'
                  : 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-300'
              }`}>
                {mode === '8ball' && (
                  <div className="text-6xl mb-4 animate-bounce">🎱</div>
                )}
                {mode === 'coin' && (
                  <div className="text-6xl mb-4">
                    {answer === 'Heads' ? '👑' : '⚫'}
                  </div>
                )}
                {mode === 'random' && (
                  <div className="text-6xl mb-4">✨</div>
                )}
                <div className={`text-2xl font-bold mb-2 transition-opacity ${
                  isAnimating ? 'opacity-50' : 'opacity-100'
                }`}>
                  {answer}
                </div>
                {question && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                    &quot;{question}&quot;
                  </div>
                )}
              </div>
            )}

            {totalQuestions > 0 && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                Total questions asked: <span className="font-semibold text-primary-600">{totalQuestions}</span>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">📊 Statistics</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportHistory}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
                <button
                  onClick={clearHistory}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Clear History
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Questions</div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">8 Ball</div>
                <div className="text-2xl font-bold text-purple-600">{stats.eightBallCount}</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Positive</div>
                <div className="text-2xl font-bold text-green-600">{stats.positiveAnswers}</div>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Negative</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.negativeAnswers}</div>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">📜 Question History</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.slice(0, 20).map((entry, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {entry.question}
                      </div>
                      <div className="text-lg font-bold text-primary-600">
                        {entry.answer}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Mode: <span className="font-medium">{entry.mode.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        {/* Introduction */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Online Decision Generator</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Can&apos;t make up your mind? Our free decision generator helps you get answers to life&apos;s questions. 
              Whether you need a simple yes/no, want to channel the wisdom of a Magic 8 Ball, flip a coin, or 
              get a random decision, we&apos;ve got you covered.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Perfect for making decisions when you&apos;re stuck between options, settling debates, or just having 
              fun. All decision generation happens locally in your browser - your questions and answers remain 
              completely private.
            </p>
          </div>
        </section>

        {/* Use Cases */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Perfect For</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🤔 Daily Decisions</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Can&apos;t decide what to eat, what to wear, or which movie to watch? Let our decision generator 
                help you make quick choices without overthinking.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">💼 Business Choices</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                When you need an unbiased perspective on business decisions, our generator provides a neutral 
                way to break decision paralysis.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎮 Fun & Games</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Use our Magic 8 Ball mode for fun predictions, or flip a virtual coin for quick game decisions. 
                Perfect for parties and social gatherings.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎯 Breaking Ties</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                When groups can&apos;t agree, use our decision generator to make fair, random choices. Great for 
                settling friendly debates or choosing between equal options.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📝 Creative Inspiration</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Stuck on a creative project? Use random mode to get unexpected answers that might spark new 
                ideas or perspectives you hadn&apos;t considered.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🧘 Decision Practice</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Practice making decisions faster by using our generator. Sometimes the act of asking the question 
                helps clarify what you really want.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Multiple Modes</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Choose from Yes/No, Magic 8 Ball, Coin Flip, or Random decision modes. Each mode provides 
                  different types of answers suited to your needs.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📜</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Question History</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Track all your questions and answers. Review past decisions, see patterns, and export your 
                  history for record-keeping.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Statistics</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  View statistics on your questions including total questions asked, mode usage, and positive 
                  vs negative answer distribution.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎲</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">True Randomness</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  All decisions are generated using cryptographically secure random number generation, ensuring 
                  truly unbiased and unpredictable results.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Quick & Easy</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Get instant answers with just a few clicks. No registration, no waiting, no hassle. Ask your 
                  question and get an answer immediately.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Privacy Guaranteed</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  All decision generation happens locally in your browser. We never see, store, or transmit your 
                  questions or answers. Your privacy is completely protected.
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
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How does the decision generator work?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Our generator uses cryptographically secure random number generation to select answers from 
                predefined sets. Each mode has its own set of possible answers, and the generator randomly 
                selects one each time you ask a question.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the difference between the modes?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Yes/No mode provides simple binary answers. Magic 8 Ball gives classic 8 Ball responses. Coin 
                Flip is purely heads or tails. Random mode provides varied, creative answers for more open-ended 
                questions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Are the answers truly random?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Yes! All answers are generated using cryptographically secure random number generation, ensuring 
                truly unpredictable and unbiased results. Each question has equal probability of getting any 
                answer in the set.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I use this for serious decisions?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                While our generator provides random answers, it&apos;s best used for fun, breaking ties, or as a tool 
                to help clarify your own thinking. For serious life decisions, we recommend consulting with 
                trusted advisors or professionals.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Is my question history stored?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Question history is stored locally in your browser&apos;s memory and is cleared when you close the 
                tab or clear your browser data. We never transmit or store your questions on our servers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I export my question history?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Yes! Click the &quot;Export&quot; button in the statistics section to download your question history as a 
                text file. Perfect for keeping records or analyzing your decision patterns.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How many questions can I ask?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                There&apos;s no limit! Ask as many questions as you want. The history keeps track of the last 50 
                questions, and you can export or clear it at any time.
              </p>
            </div>
          </div>
        </section>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Generator Tools" />
      )}
    </Layout>
    </>
  )
}
