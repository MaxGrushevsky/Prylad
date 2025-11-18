'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'

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

  return (
    <Layout
      title="🎯 Decision Generator"
      description="Get answers to your questions with Yes/No, Magic 8 Ball, Coin Flip, and Random decision generators. Free online decision maker with history tracking and statistics."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setMode('yesno')
                    setAnswer('')
                  }}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'yesno'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🎲 Random
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isAnimating && generateAnswer()}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                  <div className="text-sm text-gray-600 mt-2 italic">
                    "{question}"
                  </div>
                )}
              </div>
            )}

            {totalQuestions > 0 && (
              <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-200">
                Total questions asked: <span className="font-semibold text-primary-600">{totalQuestions}</span>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
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
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-600">Total Questions</div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-xs text-gray-600">8 Ball</div>
                <div className="text-2xl font-bold text-purple-600">{stats.eightBallCount}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-gray-600">Positive</div>
                <div className="text-2xl font-bold text-green-600">{stats.positiveAnswers}</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-xs text-gray-600">Negative</div>
                <div className="text-2xl font-bold text-red-600">{stats.negativeAnswers}</div>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-4">📜 Question History</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.slice(0, 20).map((entry, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {entry.question}
                      </div>
                      <div className="text-lg font-bold text-primary-600">
                        {entry.answer}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
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
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Online Decision Generator</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Can't make up your mind? Our free decision generator helps you get answers to life's questions. 
              Whether you need a simple yes/no, want to channel the wisdom of a Magic 8 Ball, flip a coin, or 
              get a random decision, we've got you covered.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Perfect for making decisions when you're stuck between options, settling debates, or just having 
              fun. All decision generation happens locally in your browser - your questions and answers remain 
              completely private.
            </p>
          </div>
        </section>

        {/* Use Cases */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Perfect For</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🤔 Daily Decisions</h3>
              <p className="text-gray-700 text-sm">
                Can't decide what to eat, what to wear, or which movie to watch? Let our decision generator 
                help you make quick choices without overthinking.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">💼 Business Choices</h3>
              <p className="text-gray-700 text-sm">
                When you need an unbiased perspective on business decisions, our generator provides a neutral 
                way to break decision paralysis.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🎮 Fun & Games</h3>
              <p className="text-gray-700 text-sm">
                Use our Magic 8 Ball mode for fun predictions, or flip a virtual coin for quick game decisions. 
                Perfect for parties and social gatherings.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Breaking Ties</h3>
              <p className="text-gray-700 text-sm">
                When groups can't agree, use our decision generator to make fair, random choices. Great for 
                settling friendly debates or choosing between equal options.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Creative Inspiration</h3>
              <p className="text-gray-700 text-sm">
                Stuck on a creative project? Use random mode to get unexpected answers that might spark new 
                ideas or perspectives you hadn't considered.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🧘 Decision Practice</h3>
              <p className="text-gray-700 text-sm">
                Practice making decisions faster by using our generator. Sometimes the act of asking the question 
                helps clarify what you really want.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Multiple Modes</h3>
                <p className="text-gray-700 text-sm">
                  Choose from Yes/No, Magic 8 Ball, Coin Flip, or Random decision modes. Each mode provides 
                  different types of answers suited to your needs.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📜</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Question History</h3>
                <p className="text-gray-700 text-sm">
                  Track all your questions and answers. Review past decisions, see patterns, and export your 
                  history for record-keeping.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Statistics</h3>
                <p className="text-gray-700 text-sm">
                  View statistics on your questions including total questions asked, mode usage, and positive 
                  vs negative answer distribution.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎲</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">True Randomness</h3>
                <p className="text-gray-700 text-sm">
                  All decisions are generated using cryptographically secure random number generation, ensuring 
                  truly unbiased and unpredictable results.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Quick & Easy</h3>
                <p className="text-gray-700 text-sm">
                  Get instant answers with just a few clicks. No registration, no waiting, no hassle. Ask your 
                  question and get an answer immediately.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Privacy Guaranteed</h3>
                <p className="text-gray-700 text-sm">
                  All decision generation happens locally in your browser. We never see, store, or transmit your 
                  questions or answers. Your privacy is completely protected.
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
              <h3 className="font-semibold text-gray-900 mb-2">How does the decision generator work?</h3>
              <p className="text-gray-700 text-sm">
                Our generator uses cryptographically secure random number generation to select answers from 
                predefined sets. Each mode has its own set of possible answers, and the generator randomly 
                selects one each time you ask a question.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What's the difference between the modes?</h3>
              <p className="text-gray-700 text-sm">
                Yes/No mode provides simple binary answers. Magic 8 Ball gives classic 8 Ball responses. Coin 
                Flip is purely heads or tails. Random mode provides varied, creative answers for more open-ended 
                questions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Are the answers truly random?</h3>
              <p className="text-gray-700 text-sm">
                Yes! All answers are generated using cryptographically secure random number generation, ensuring 
                truly unpredictable and unbiased results. Each question has equal probability of getting any 
                answer in the set.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I use this for serious decisions?</h3>
              <p className="text-gray-700 text-sm">
                While our generator provides random answers, it's best used for fun, breaking ties, or as a tool 
                to help clarify your own thinking. For serious life decisions, we recommend consulting with 
                trusted advisors or professionals.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is my question history stored?</h3>
              <p className="text-gray-700 text-sm">
                Question history is stored locally in your browser's memory and is cleared when you close the 
                tab or clear your browser data. We never transmit or store your questions on our servers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I export my question history?</h3>
              <p className="text-gray-700 text-sm">
                Yes! Click the "Export" button in the statistics section to download your question history as a 
                text file. Perfect for keeping records or analyzing your decision patterns.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How many questions can I ask?</h3>
              <p className="text-gray-700 text-sm">
                There's no limit! Ask as many questions as you want. The history keeps track of the last 50 
                questions, and you can export or clear it at any time.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
