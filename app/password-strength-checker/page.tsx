'use client'

import { useState, useCallback, useMemo } from 'react'
import Layout from '@/components/Layout'
type Strength = 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'

interface PasswordAnalysis {
  strength: Strength
  score: number
  feedback: string[]
  timeToCrack: string
  entropy: number
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
    common: boolean
    repeated: boolean
  }
}

const commonPasswords = [
  'password', '123456', '123456789', '12345678', '12345', '1234567',
  '1234567890', 'qwerty', 'abc123', 'monkey', '12345678910', 'letmein',
  'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321',
  'superman', 'qazwsx', 'michael', 'football', 'welcome', 'jesus',
  'ninja', 'mustang', 'password1', '123qwe', 'admin', 'qwerty123'
]

export default function PasswordStrengthCheckerPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const analyzePassword = useCallback((pwd: string): PasswordAnalysis => {
    if (!pwd) {
      return {
        strength: 'very-weak',
        score: 0,
        feedback: ['Enter a password to check its strength'],
        timeToCrack: 'Instant',
        entropy: 0,
        checks: {
          length: false,
          uppercase: false,
          lowercase: false,
          numbers: false,
          symbols: false,
          common: true,
          repeated: false
        }
      }
    }

    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /\d/.test(pwd),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      common: commonPasswords.some(common => pwd.toLowerCase().includes(common.toLowerCase())),
      repeated: /(.)\1{2,}/.test(pwd)
    }

    // Calculate entropy
    let charsetSize = 0
    if (checks.lowercase) charsetSize += 26
    if (checks.uppercase) charsetSize += 26
    if (checks.numbers) charsetSize += 10
    if (checks.symbols) charsetSize += 32
    const entropy = pwd.length * Math.log2(charsetSize || 1)

    // Calculate score (0-100)
    let score = 0
    const feedback: string[] = []

    // Length scoring
    if (pwd.length >= 12) score += 25
    else if (pwd.length >= 8) score += 15
    else if (pwd.length >= 6) score += 5
    else feedback.push('Use at least 8 characters')

    // Character variety scoring
    let varietyCount = 0
    if (checks.uppercase) varietyCount++
    if (checks.lowercase) varietyCount++
    if (checks.numbers) varietyCount++
    if (checks.symbols) varietyCount++
    score += varietyCount * 15

    if (varietyCount < 3) {
      feedback.push('Use a mix of letters, numbers, and symbols')
    }

    // Entropy scoring
    if (entropy >= 60) score += 20
    else if (entropy >= 40) score += 15
    else if (entropy >= 20) score += 10
    else feedback.push('Password is too predictable')

    // Penalties
    if (checks.common) {
      score -= 30
      feedback.push('Avoid common passwords')
    }
    if (checks.repeated) {
      score -= 10
      feedback.push('Avoid repeated characters')
    }
    if (pwd.length < 8) {
      score -= 20
    }

    score = Math.max(0, Math.min(100, score))

    // Determine strength
    let strength: Strength
    if (score >= 80) strength = 'very-strong'
    else if (score >= 60) strength = 'strong'
    else if (score >= 40) strength = 'good'
    else if (score >= 20) strength = 'fair'
    else if (score >= 10) strength = 'weak'
    else strength = 'very-weak'

    // Estimate time to crack (rough estimate)
    const combinations = Math.pow(charsetSize || 1, pwd.length)
    const guessesPerSecond = 1e9 // 1 billion guesses per second (high-end)
    const seconds = combinations / guessesPerSecond
    let timeToCrack = 'Instant'
    
    if (seconds < 1) timeToCrack = 'Less than a second'
    else if (seconds < 60) timeToCrack = `${Math.round(seconds)} seconds`
    else if (seconds < 3600) timeToCrack = `${Math.round(seconds / 60)} minutes`
    else if (seconds < 86400) timeToCrack = `${Math.round(seconds / 3600)} hours`
    else if (seconds < 31536000) timeToCrack = `${Math.round(seconds / 86400)} days`
    else if (seconds < 31536000000) timeToCrack = `${Math.round(seconds / 31536000)} years`
    else timeToCrack = 'Centuries'

    if (feedback.length === 0) {
      feedback.push('Password looks good!')
    }

    return {
      strength,
      score,
      feedback,
      timeToCrack,
      entropy: Math.round(entropy * 10) / 10,
      checks
    }
  }, [])

  const analysis = useMemo(() => analyzePassword(password), [password, analyzePassword])

  const getStrengthColor = (strength: Strength): string => {
    switch (strength) {
      case 'very-strong': return 'bg-green-600'
      case 'strong': return 'bg-green-500'
      case 'good': return 'bg-yellow-500'
      case 'fair': return 'bg-orange-500'
      case 'weak': return 'bg-red-500'
      case 'very-weak': return 'bg-red-600'
      default: return 'bg-gray-400'
    }
  }

  const getStrengthLabel = (strength: Strength): string => {
    switch (strength) {
      case 'very-strong': return 'Very Strong'
      case 'strong': return 'Strong'
      case 'good': return 'Good'
      case 'fair': return 'Fair'
      case 'weak': return 'Weak'
      case 'very-weak': return 'Very Weak'
      default: return 'Unknown'
    }
  }

  return (
    <Layout
      title="🔒 Password Strength Checker"
      description="Check password strength and security online. Get detailed feedback on password quality and recommendations."
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Enter Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password to check"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Strength Indicator */}
            {password && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Strength: {getStrengthLabel(analysis.strength)}
                    </span>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Score: {analysis.score}/100
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthColor(analysis.strength)}`}
                      style={{ width: `${analysis.score}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Entropy</div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {analysis.entropy}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">bits</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="text-sm text-green-600 dark:text-green-400 mb-1">Time to Crack</div>
                    <div className="text-lg font-bold text-green-900 dark:text-green-100">
                      {analysis.timeToCrack}
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Length</div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {password.length}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">characters</div>
                  </div>
                </div>

                {/* Checks */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Requirements
                  </label>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 ${analysis.checks.length ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                      <span>{analysis.checks.length ? '✓' : '✗'}</span>
                      <span className="text-sm">At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${analysis.checks.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                      <span>{analysis.checks.uppercase ? '✓' : '✗'}</span>
                      <span className="text-sm">Contains uppercase letters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${analysis.checks.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                      <span>{analysis.checks.lowercase ? '✓' : '✗'}</span>
                      <span className="text-sm">Contains lowercase letters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${analysis.checks.numbers ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                      <span>{analysis.checks.numbers ? '✓' : '✗'}</span>
                      <span className="text-sm">Contains numbers</span>
                    </div>
                    <div className={`flex items-center gap-2 ${analysis.checks.symbols ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                      <span>{analysis.checks.symbols ? '✓' : '✗'}</span>
                      <span className="text-sm">Contains symbols</span>
                    </div>
                    <div className={`flex items-center gap-2 ${!analysis.checks.common ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      <span>{!analysis.checks.common ? '✓' : '✗'}</span>
                      <span className="text-sm">Not a common password</span>
                    </div>
                    <div className={`flex items-center gap-2 ${!analysis.checks.repeated ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      <span>{!analysis.checks.repeated ? '✓' : '✗'}</span>
                      <span className="text-sm">No repeated characters</span>
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Feedback</h3>
                  <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                    {analysis.feedback.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Password Tips</h3>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>• Use at least 12 characters for better security</li>
                <li>• Mix uppercase, lowercase, numbers, and symbols</li>
                <li>• Avoid common words and patterns</li>
                <li>• Don&apos;t reuse passwords across different accounts</li>
                <li>• Consider using a password manager</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 mt-10">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How the Strength Score Works</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            The score (0&ndash;100) combines length, character variety, entropy, and penalties for common patterns. The meter converts the score into descriptive labels to help you understand how resilient the password is against brute-force attacks.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Very Weak / Weak</h3>
              <p>Short passwords (&lt;8 chars) or containing only one character type.</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Fair / Good</h3>
              <p>Reasonable variety with 10+ characters. Suitable for low-risk accounts.</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Strong / Very Strong</h3>
              <p>Long (12+), mixed charset, and no repeated/common patterns.</p>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Password Creation Checklist</h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed list-disc list-inside">
            <li>Use at least 12 characters. Go longer for admin or financial accounts.</li>
            <li>Mix uppercase, lowercase, digits, and symbols. Avoid predictable substitutions (0 for O, 1 for l).</li>
            <li>Avoid dictionary words, names, or keyboard patterns (e.g., <code className="font-mono">qwerty</code>, <code className="font-mono">password123</code>).</li>
            <li>Don&rsquo;t reuse passwords between services. Use a password manager to store unique credentials.</li>
            <li>Enable multi-factor authentication (MFA) wherever possible for an extra layer.</li>
          </ul>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Estimates &amp; Entropy</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            The entropy calculation approximates how unpredictable the password is, and the &ldquo;Time to Crack&rdquo; uses a high-end brute-force baseline (1 billion guesses/second). Real-world times vary by attacker resources, but the numbers help prioritize risk.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Entropy Guide</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>&lt;20 bits: Guessable instantly</li>
                <li>20&ndash;40 bits: Breakable in minutes/hours</li>
                <li>40&ndash;60 bits: Acceptable but improve</li>
                <li>&gt;60 bits: Strong for modern systems</li>
              </ul>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Use Cases</h3>
              <p>Combine this checker with a password manager to iteratively improve generated passwords before saving them to your vault.</p>
            </div>
          </div>
        </section>
      </div>

      </Layout>
  )
}

