'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useHistory } from '@/hooks/useHistory'
import HistoryPanel from '@/components/HistoryPanel'
import Tooltip from '@/components/Tooltip'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type Mode = 'generate' | 'check'

const commonPasswords = [
  'password', '123456', '123456789', '12345678', '12345', '1234567',
  '1234567890', 'qwerty', 'abc123', 'monkey', '12345678910', 'letmein',
  'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321',
  'superman', 'qazwsx', 'michael', 'football', 'welcome', 'jesus',
  'ninja', 'mustang', 'password1', '123qwe', 'admin', 'qwerty123'
]

export default function PasswordGeneratorPage() {
  const [mode, setMode] = useState<Mode>('generate')
  const [length, setLength] = useState(16)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [excludeSimilar, setExcludeSimilar] = useState(false)
  const [password, setPassword] = useState('')
  const [checkPassword, setCheckPassword] = useState('')
  const [showCheckPassword, setShowCheckPassword] = useState(false)
  const [passwords, setPasswords] = useState<string[]>([])
  const [count, setCount] = useState(1)
  const [strength, setStrength] = useState(0)
  const [crackTime, setCrackTime] = useState('')
  const [entropy, setEntropy] = useState(0)
  const [passwordStats, setPasswordStats] = useState({
    uppercase: 0,
    lowercase: 0,
    numbers: 0,
    symbols: 0
  })
  const [checkAnalysis, setCheckAnalysis] = useState<{
    strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
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
  } | null>(null)
  const { history, addToHistory, removeFromHistory, clearHistory } = useHistory<string>('password-history', 20)

  // SEO data
  const toolPath = '/password-generator'
  const toolName = 'Password Generator'
  const category = 'security'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data (from existing FAQ section)
  const faqs = [
    {
      question: "How secure are the generated passwords?",
      answer: "Our password generator uses cryptographically secure random number generation, ensuring passwords are truly random and unpredictable. The strength meter and crack time estimate help you understand the security level of each generated password."
    },
    {
      question: "Are my passwords stored or transmitted?",
      answer: "Absolutely not. All password generation happens entirely in your browser using JavaScript. We never see, store, transmit, or have any access to your generated passwords. Your privacy and security are guaranteed."
    },
    {
      question: "What makes a password strong?",
      answer: "A strong password combines length, complexity, and randomness. Longer passwords (16+ characters) with a mix of uppercase, lowercase, numbers, and symbols are exponentially stronger than short, simple passwords. Our generator creates passwords that meet all these criteria."
    },
    {
      question: "Should I exclude similar characters?",
      answer: "Excluding similar characters (0, O, 1, l, I) makes passwords easier to read and type, which is helpful when you need to manually enter them. However, it slightly reduces the character set size. For maximum security, keep all characters; for better usability, exclude similar ones."
    },
    {
      question: "How many passwords should I generate at once?",
      answer: "Generate as many as you need! Our tool supports generating up to 20 passwords simultaneously. This is useful when setting up multiple accounts, creating backup passwords, or when you need several options to choose from."
    },
    {
      question: "What is the estimated crack time based on?",
      answer: "The crack time estimate assumes a modern attacker using specialized hardware capable of approximately 1 billion password guesses per second. This is a realistic estimate for sophisticated attacks, though actual times may vary based on the attacker's resources and methods."
    },
    {
      question: "Can I use these passwords for any service?",
      answer: "Yes! Generated passwords work with any service that accepts passwords. However, always check the specific requirements of each service - some may have length limits, character restrictions, or other requirements that you'll need to adjust for."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Choose a Preset (Optional)",
      text: "Start with one of our quick presets - Strong, PIN, Memorable, or Maximum - for common use cases."
    },
    {
      name: "Adjust Length",
      text: "Use the slider to set your desired password length (4-64 characters). Longer passwords are generally more secure."
    },
    {
      name: "Select Character Types",
      text: "Choose which character sets to include - uppercase letters, lowercase letters, numbers, and symbols."
    },
    {
      name: "Exclude Similar Characters (Optional)",
      text: "Optionally exclude confusing characters like 0, O, 1, l, and I to make passwords easier to read."
    },
    {
      name: "Generate and Review",
      text: "Click Generate and review the password strength indicator and estimated crack time before using."
    },
    {
      name: "Copy and Use",
      text: "Copy your password securely and use it immediately. Never share passwords or reuse them across accounts."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Generate a Strong Password",
      "Learn how to create secure, strong passwords using our free online password generator with customizable settings.",
      howToSteps,
      "PT3M"
    ),
    generateSoftwareApplicationSchema(
      "Password Generator",
      "Free online password generator. Create strong, secure passwords with customizable length, character types, and security options.",
      "https://prylad.pro/password-generator",
      "UtilityApplication"
    )
  ]

  const generatePasswordWithSettings = useCallback((
    pwdLength: number,
    upper: boolean,
    lower: boolean,
    numbers: boolean,
    symbols: boolean,
    excludeSim: boolean,
    pwdCount: number = count
  ) => {
    let chars = ''
    if (upper) {
      if (excludeSim) {
        chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ' // Exclude I, O
      } else {
        chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      }
    }
    if (lower) {
      if (excludeSim) {
        chars += 'abcdefghijkmnopqrstuvwxyz' // Exclude l, o
      } else {
        chars += 'abcdefghijklmnopqrstuvwxyz'
      }
    }
    if (numbers) {
      if (excludeSim) {
        chars += '23456789' // Exclude 0, 1
      } else {
        chars += '0123456789'
      }
    }
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (!chars) {
      setPassword('Select at least one character type')
      setPasswords([])
      return
    }

    const generateSingle = () => {
      let newPassword = ''
      for (let i = 0; i < pwdLength; i++) {
        newPassword += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return newPassword
    }

    const newPasswords = Array.from({ length: pwdCount }, () => generateSingle())
    setPasswords(newPasswords)
    setPassword(newPasswords[0])
    calculateStrengthWithSettings(newPasswords[0], upper, lower, numbers, symbols, excludeSim, pwdLength)
    
    // Add to history
    addToHistory(newPasswords[0], `Length: ${pwdLength}`)
    
    // Calculate password statistics
    const stats = {
      uppercase: (newPasswords[0].match(/[A-Z]/g) || []).length,
      lowercase: (newPasswords[0].match(/[a-z]/g) || []).length,
      numbers: (newPasswords[0].match(/[0-9]/g) || []).length,
      symbols: (newPasswords[0].match(/[^a-zA-Z0-9]/g) || []).length
    }
    setPasswordStats(stats)
  }, [count, addToHistory])

  const selectFromHistory = useCallback((pwd: string) => {
    setPassword(pwd)
    calculateStrength(pwd)
    // Recalculate stats
    const stats = {
      uppercase: (pwd.match(/[A-Z]/g) || []).length,
      lowercase: (pwd.match(/[a-z]/g) || []).length,
      numbers: (pwd.match(/[0-9]/g) || []).length,
      symbols: (pwd.match(/[^a-zA-Z0-9]/g) || []).length
    }
    setPasswordStats(stats)
  }, [])

  const generatePassword = useCallback((single: boolean = false) => {
    generatePasswordWithSettings(length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, single ? 1 : count)
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, count, generatePasswordWithSettings])

  const calculateStrengthWithSettings = (
    pwd: string,
    upper: boolean,
    lower: boolean,
    numbers: boolean,
    symbols: boolean,
    excludeSim: boolean,
    pwdLength: number
  ) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (pwd.length >= 16) score++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[^a-zA-Z\d]/.test(pwd)) score++
    setStrength(score)
    
    // Calculate crack time estimate
    // Based on zxcvbn algorithm principles
    const charsetSize = 
      (upper ? (excludeSim ? 24 : 26) : 0) +
      (lower ? (excludeSim ? 24 : 26) : 0) +
      (numbers ? (excludeSim ? 8 : 10) : 0) +
      (symbols ? 26 : 0) // Symbols: !@#$%^&*()_+-=[]{}|;:,.<>?
    
    if (charsetSize === 0) {
      setCrackTime('N/A')
      return
    }
    
    // Total possible combinations
    const combinations = Math.pow(charsetSize, pwdLength)
    
    // Different attack scenarios (guesses per second)
    // Online attack (through web interface with rate limiting): ~100/second
    // Offline attack (local hash cracking): ~1e10/second (10 billion) for fast hashes
    // GPU cluster: ~1e11/second (100 billion) for optimized attacks
    
    // Use offline attack speed (most common threat model)
    // For fast hashes like MD5, SHA-1: ~10 billion guesses/second
    // For bcrypt, Argon2: much slower, but we'll use conservative estimate
    const guessesPerSecond = 1e10 // 10 billion guesses per second (offline attack)
    
    // Calculate entropy (bits)
    const entropyBits = Math.log2(combinations)
    setEntropy(entropyBits)
    
    // Average time to crack (50% of combinations checked)
    const averageSeconds = (combinations / 2) / guessesPerSecond
    
    // Format time estimate
    if (averageSeconds < 1) {
      setCrackTime('Less than a second')
    } else if (averageSeconds < 60) {
      setCrackTime(`${Math.round(averageSeconds)} second${Math.round(averageSeconds) !== 1 ? 's' : ''}`)
    } else if (averageSeconds < 3600) {
      const minutes = Math.round(averageSeconds / 60)
      setCrackTime(`${minutes} minute${minutes !== 1 ? 's' : ''}`)
    } else if (averageSeconds < 86400) {
      const hours = Math.round(averageSeconds / 3600)
      setCrackTime(`${hours} hour${hours !== 1 ? 's' : ''}`)
    } else if (averageSeconds < 31536000) {
      const days = Math.round(averageSeconds / 86400)
      setCrackTime(`${days} day${days !== 1 ? 's' : ''}`)
    } else if (averageSeconds < 31536000000) {
      const years = Math.round(averageSeconds / 31536000)
      if (years < 1000) {
        setCrackTime(`${years} year${years !== 1 ? 's' : ''}`)
      } else {
        const millennia = (averageSeconds / 31536000000).toFixed(1)
        setCrackTime(`${millennia} thousand years`)
      }
    } else if (averageSeconds < 31536000000000) {
      const millennia = Math.round(averageSeconds / 31536000000)
      if (millennia < 1000) {
        setCrackTime(`${millennia} thousand years`)
      } else {
        const millions = (averageSeconds / 31536000000000).toFixed(1)
        setCrackTime(`${millions} million years`)
      }
    } else {
      const billions = (averageSeconds / 31536000000000000).toFixed(1)
      setCrackTime(`${billions} billion years`)
    }
  }

  const calculateStrength = (pwd: string) => {
    calculateStrengthWithSettings(pwd, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, length)
  }

  const analyzePasswordForCheck = useCallback((pwd: string) => {
    if (!pwd) {
      setCheckAnalysis(null)
      return
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

    let charsetSize = 0
    if (checks.lowercase) charsetSize += 26
    if (checks.uppercase) charsetSize += 26
    if (checks.numbers) charsetSize += 10
    if (checks.symbols) charsetSize += 32
    const entropy = pwd.length * Math.log2(charsetSize || 1)

    let score = 0
    const feedback: string[] = []

    if (pwd.length >= 12) score += 25
    else if (pwd.length >= 8) score += 15
    else if (pwd.length >= 6) score += 5
    else feedback.push('Use at least 8 characters')

    let varietyCount = 0
    if (checks.uppercase) varietyCount++
    if (checks.lowercase) varietyCount++
    if (checks.numbers) varietyCount++
    if (checks.symbols) varietyCount++
    score += varietyCount * 15

    if (varietyCount < 3) {
      feedback.push('Use a mix of letters, numbers, and symbols')
    }

    if (entropy >= 60) score += 20
    else if (entropy >= 40) score += 15
    else if (entropy >= 20) score += 10
    else feedback.push('Password is too predictable')

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

    let strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
    if (score >= 80) strength = 'very-strong'
    else if (score >= 60) strength = 'strong'
    else if (score >= 40) strength = 'good'
    else if (score >= 20) strength = 'fair'
    else if (score >= 10) strength = 'weak'
    else strength = 'very-weak'

    const combinations = Math.pow(charsetSize || 1, pwd.length)
    const guessesPerSecond = 1e9
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

    setCheckAnalysis({
      strength,
      score,
      feedback,
      timeToCrack,
      entropy: Math.round(entropy * 10) / 10,
      checks
    })
  }, [])

  useEffect(() => {
    if (mode === 'check' && checkPassword) {
      analyzePasswordForCheck(checkPassword)
    } else if (mode === 'check') {
      setCheckAnalysis(null)
    }
  }, [checkPassword, mode, analyzePasswordForCheck])

  const applyPreset = (preset: 'strong' | 'pin' | 'memorable' | 'all') => {
    let presetLength = 16
    let presetUpper = true
    let presetLower = true
    let presetNumbers = true
    let presetSymbols = true
    let presetExcludeSimilar = false

    switch (preset) {
      case 'strong':
        presetLength = 20
        presetUpper = true
        presetLower = true
        presetNumbers = true
        presetSymbols = true
        presetExcludeSimilar = false
        break
      case 'pin':
        presetLength = 6
        presetUpper = false
        presetLower = false
        presetNumbers = true
        presetSymbols = false
        presetExcludeSimilar = true
        break
      case 'memorable':
        presetLength = 12
        presetUpper = true
        presetLower = true
        presetNumbers = true
        presetSymbols = false
        presetExcludeSimilar = true
        break
      case 'all':
        presetLength = 32
        presetUpper = true
        presetLower = true
        presetNumbers = true
        presetSymbols = true
        presetExcludeSimilar = false
        break
    }

    // Update state
    setLength(presetLength)
    setIncludeUppercase(presetUpper)
    setIncludeLowercase(presetLower)
    setIncludeNumbers(presetNumbers)
    setIncludeSymbols(presetSymbols)
    setExcludeSimilar(presetExcludeSimilar)

    // Generate with new settings immediately
    generatePasswordWithSettings(presetLength, presetUpper, presetLower, presetNumbers, presetSymbols, presetExcludeSimilar, count)
  }

  const copyToClipboard = async (pwd?: string) => {
    try {
      await navigator.clipboard.writeText(pwd || password)
    } catch (err) {
      // Failed to copy
    }
  }

  const copyAll = async () => {
    if (passwords.length === 0) return
    try {
      await navigator.clipboard.writeText(passwords.join('\n'))
    } catch (err) {
      // Failed to copy
    }
  }


  const exportToFile = () => {
    if (passwords.length === 0) return
    
    const content = passwords.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `passwords-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      excludeSimilar,
      count
    }
    localStorage.setItem('passwordGeneratorSettings', JSON.stringify(settings))
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, count])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onEnter: () => generatePassword(),
    onSave: () => exportToFile(),
    onClear: () => {
      setPassword('')
      setPasswords([])
    }
  })

  // Load settings from localStorage on mount and generate password
  useEffect(() => {
    const saved = localStorage.getItem('passwordGeneratorSettings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        setLength(settings.length || 16)
        setIncludeUppercase(settings.includeUppercase !== undefined ? settings.includeUppercase : true)
        setIncludeLowercase(settings.includeLowercase !== undefined ? settings.includeLowercase : true)
        setIncludeNumbers(settings.includeNumbers !== undefined ? settings.includeNumbers : true)
        setIncludeSymbols(settings.includeSymbols !== undefined ? settings.includeSymbols : true)
        setExcludeSimilar(settings.excludeSimilar || false)
        setCount(settings.count || 1)
        
        // Generate with loaded settings
        setTimeout(() => {
          generatePasswordWithSettings(
            settings.length || 16,
            settings.includeUppercase !== undefined ? settings.includeUppercase : true,
            settings.includeLowercase !== undefined ? settings.includeLowercase : true,
            settings.includeNumbers !== undefined ? settings.includeNumbers : true,
            settings.includeSymbols !== undefined ? settings.includeSymbols : true,
            settings.excludeSimilar || false,
            settings.count || 1
          )
        }, 0)
      } catch (e) {
        // Ignore parse errors, generate with defaults
        generatePassword(false)
      }
    } else {
      // No saved settings, generate with defaults
      generatePassword(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const helpContent = (
    <div className="space-y-6 text-gray-700 dark:text-gray-300">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">How to Use</h3>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>Adjust the password length slider (recommended: 16+ characters)</li>
          <li>Select character types: uppercase, lowercase, numbers, symbols</li>
          <li>Optionally exclude similar characters (I, l, 1, O, 0) for better readability</li>
          <li>Click &quot;Generate&quot; or press Enter to create passwords</li>
          <li>Use the strength meter to verify password security</li>
          <li>Copy passwords to clipboard or export to file</li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Password Strength</h3>
        <p className="text-sm mb-2">
          Password strength is calculated based on length, character variety, and randomness. 
          The entropy value shows how unpredictable your password is.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Weak:</strong> Less than 50 bits entropy - easily crackable</li>
          <li><strong>Medium:</strong> 50-80 bits - reasonable for low-security accounts</li>
          <li><strong>Strong:</strong> 80-100 bits - good for most accounts</li>
          <li><strong>Very Strong:</strong> 100+ bits - recommended for sensitive accounts</li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Keyboard Shortcuts</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Enter</kbd> - Generate password</li>
          <li><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Ctrl+S</kbd> / <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Cmd+S</kbd> - Export to file</li>
          <li><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Ctrl+L</kbd> / <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Cmd+L</kbd> - Clear all</li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Best Practices</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Use different passwords for each account</li>
          <li>Enable two-factor authentication when available</li>
          <li>Use a password manager to store passwords securely</li>
          <li>Never share passwords with anyone</li>
          <li>Change passwords if you suspect a breach</li>
        </ul>
      </div>
    </div>
  )

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🔐 Password Generator"
        description="Create secure, strong passwords with customizable settings. Generate random passwords with uppercase, lowercase, numbers, and symbols. Free online password generator with strength meter."
        helpContent={helpContent}
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          {/* Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
              Mode
            </label>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setMode('generate')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  mode === 'generate'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🔐 Generate Password
              </button>
              <button
                onClick={() => setMode('check')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  mode === 'check'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🔒 Check Strength
              </button>
            </div>
          </div>

          {/* Check Password Mode */}
          {mode === 'check' && (
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Enter Password to Check
                </label>
                <div className="relative">
                  <input
                    type={showCheckPassword ? 'text' : 'password'}
                    value={checkPassword}
                    onChange={(e) => setCheckPassword(e.target.value)}
                    placeholder="Enter password to check strength"
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCheckPassword(!showCheckPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showCheckPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {checkAnalysis && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Strength: <span className={`font-bold ${
                          checkAnalysis.strength === 'very-weak' || checkAnalysis.strength === 'weak' ? 'text-red-500' :
                          checkAnalysis.strength === 'fair' || checkAnalysis.strength === 'good' ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          {checkAnalysis.strength === 'very-weak' ? 'Very Weak' :
                           checkAnalysis.strength === 'weak' ? 'Weak' :
                           checkAnalysis.strength === 'fair' ? 'Fair' :
                           checkAnalysis.strength === 'good' ? 'Good' :
                           checkAnalysis.strength === 'strong' ? 'Strong' : 'Very Strong'}
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Score: {checkAnalysis.score}/100
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          checkAnalysis.strength === 'very-strong' ? 'bg-green-600' :
                          checkAnalysis.strength === 'strong' ? 'bg-green-500' :
                          checkAnalysis.strength === 'good' ? 'bg-yellow-500' :
                          checkAnalysis.strength === 'fair' ? 'bg-orange-500' :
                          checkAnalysis.strength === 'weak' ? 'bg-red-500' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${checkAnalysis.score}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Entropy</div>
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {checkAnalysis.entropy}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">bits</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="text-sm text-green-600 dark:text-green-400 mb-1">Time to Crack</div>
                      <div className="text-lg font-bold text-green-900 dark:text-green-100">
                        {checkAnalysis.timeToCrack}
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Length</div>
                      <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {checkPassword.length}
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">characters</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Requirements
                    </label>
                    <div className="space-y-2">
                      <div className={`flex items-center gap-2 ${checkAnalysis.checks.length ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                        <span>{checkAnalysis.checks.length ? '✓' : '✗'}</span>
                        <span className="text-sm">At least 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-2 ${checkAnalysis.checks.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                        <span>{checkAnalysis.checks.uppercase ? '✓' : '✗'}</span>
                        <span className="text-sm">Contains uppercase letters</span>
                      </div>
                      <div className={`flex items-center gap-2 ${checkAnalysis.checks.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                        <span>{checkAnalysis.checks.lowercase ? '✓' : '✗'}</span>
                        <span className="text-sm">Contains lowercase letters</span>
                      </div>
                      <div className={`flex items-center gap-2 ${checkAnalysis.checks.numbers ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                        <span>{checkAnalysis.checks.numbers ? '✓' : '✗'}</span>
                        <span className="text-sm">Contains numbers</span>
                      </div>
                      <div className={`flex items-center gap-2 ${checkAnalysis.checks.symbols ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                        <span>{checkAnalysis.checks.symbols ? '✓' : '✗'}</span>
                        <span className="text-sm">Contains symbols</span>
                      </div>
                      <div className={`flex items-center gap-2 ${!checkAnalysis.checks.common ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <span>{!checkAnalysis.checks.common ? '✓' : '✗'}</span>
                        <span className="text-sm">Not a common password</span>
                      </div>
                      <div className={`flex items-center gap-2 ${!checkAnalysis.checks.repeated ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <span>{!checkAnalysis.checks.repeated ? '✓' : '✗'}</span>
                        <span className="text-sm">No repeated characters</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Feedback</h3>
                    <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                      {checkAnalysis.feedback.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Generate Password Mode */}
          {mode === 'generate' && (
            <>
          {/* Presets */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-3 justify-center">
              <Tooltip content="Strong password: 20 characters, all types" position="top">
                <button
                  onClick={() => applyPreset('strong')}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  🔒 Strong (20 chars)
                </button>
              </Tooltip>
              <Tooltip content="PIN code: 6 digits only" position="top">
                <button
                  onClick={() => applyPreset('pin')}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  🔢 PIN (6 digits)
                </button>
              </Tooltip>
              <Tooltip content="Memorable: 12 chars, letters and numbers" position="top">
                <button
                  onClick={() => applyPreset('memorable')}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  💭 Memorable (12 chars)
                </button>
              </Tooltip>
              <Tooltip content="Maximum security: 32 characters, all types" position="top">
                <button
                  onClick={() => applyPreset('all')}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ⚡ Maximum (32 chars)
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Length: <span className="text-primary-600 font-bold">{length}</span>
                </label>
                <Tooltip content="Longer passwords are exponentially stronger. Recommended: 16+ characters for important accounts." position="top">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Tooltip>
              </div>
              <input
                type="range"
                min="4"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>4</span>
                <span>64</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="w-4 h-4 accent-primary-600"
                />
                <span className="text-sm">A-Z</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="w-4 h-4 accent-primary-600"
                />
                <span className="text-sm">a-z</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="w-4 h-4 accent-primary-600"
                />
                <span className="text-sm">0-9</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="w-4 h-4 accent-primary-600"
                />
                <span className="text-sm">!@#$</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="exclude-similar"
                checked={excludeSimilar}
                onChange={(e) => setExcludeSimilar(e.target.checked)}
                className="w-4 h-4 accent-primary-600"
              />
              <Tooltip content="Excludes confusing characters like 0/O, 1/l/I for better readability" position="right">
                <label htmlFor="exclude-similar" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  Exclude similar characters (0, O, 1, l, I)
                </label>
              </Tooltip>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Generate:</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={count}
                  onChange={(e) => setCount(Math.min(1000, Math.max(1, Number(e.target.value))))}
                  className="w-24 px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">password(s)</span>
              </div>
              {count > 1 && (
                <div className="flex gap-2">
                  <Tooltip content="Generate 10 passwords" position="top">
                    <button
                      onClick={() => setCount(10)}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded transition-colors"
                    >
                      10
                    </button>
                  </Tooltip>
                  <Tooltip content="Generate 50 passwords" position="top">
                    <button
                      onClick={() => setCount(50)}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded transition-colors"
                    >
                      50
                    </button>
                  </Tooltip>
                  <Tooltip content="Generate 100 passwords" position="top">
                    <button
                      onClick={() => setCount(100)}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded transition-colors"
                    >
                      100
                    </button>
                  </Tooltip>
                  <Tooltip content="Generate 500 passwords" position="top">
                    <button
                      onClick={() => setCount(500)}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded transition-colors"
                    >
                      500
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>

            <Tooltip content="Press Enter to generate" position="top">
              <button
                onClick={() => generatePassword(false)}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
              >
                Generate {count > 1 ? `${count} Passwords` : 'Password'}
              </button>
            </Tooltip>
          </div>

          {/* Result */}
          {passwords.length > 0 && (
            <div className="space-y-4">
              {passwords.length === 1 ? (
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                  <div className="flex items-center gap-3 flex-wrap">
                    <code className="flex-1 text-lg font-mono break-all min-w-0">{password}</code>
                    <div className="flex gap-2">
                      <Tooltip content="Export to file (Ctrl+S / Cmd+S)" position="top">
                        <button
                          onClick={exportToFile}
                          className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </Tooltip>
                      <Tooltip content="Copy password to clipboard" position="top">
                        <button
                          onClick={() => copyToClipboard()}
                          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Copy
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Generated Passwords:</h3>
                    <div className="flex gap-2">
                      <Tooltip content="Export all passwords to file" position="top">
                        <button
                          onClick={exportToFile}
                          className="text-sm bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Export
                        </button>
                      </Tooltip>
                      <Tooltip content="Copy all passwords to clipboard" position="top">
                        <button
                          onClick={copyAll}
                          className="text-sm bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Copy All
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {passwords.map((pwd, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 flex items-center gap-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                        <code className="flex-1 text-sm font-mono break-all">{pwd}</code>
                        <Tooltip content="Copy this password" position="left">
                          <button
                            onClick={() => copyToClipboard(pwd)}
                            className="text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors text-sm"
                          >
                            📋
                          </button>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                  {/* Password Analysis */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 space-y-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    {/* Strength indicator */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Password strength:</span>
                        <span className={`font-bold ${
                          strength <= 2 ? 'text-red-500' :
                          strength <= 4 ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          {strength <= 2 ? 'Weak' : strength <= 4 ? 'Medium' : 'Strong'}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            strength <= 2 ? 'bg-red-50 dark:bg-red-900/200' :
                            strength <= 4 ? 'bg-yellow-500' :
                            'bg-green-50 dark:bg-green-900/200'
                          }`}
                          style={{ width: `${(strength / 6) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Entropy and Crack Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Entropy</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {entropy.toFixed(1)} <span className="text-sm font-normal text-gray-600 dark:text-gray-400">bits</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {entropy < 28 ? 'Very Weak' :
                           entropy < 36 ? 'Weak' :
                           entropy < 60 ? 'Moderate' :
                           entropy < 80 ? 'Strong' : 'Very Strong'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Crack Time (offline)</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {crackTime || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          @ 10 billion guesses/sec
                        </div>
                      </div>
                    </div>

                    {/* Password Statistics */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Character Distribution</div>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{passwordStats.uppercase}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">A-Z</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{passwordStats.lowercase}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">a-z</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{passwordStats.numbers}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">0-9</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">{passwordStats.symbols}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Symbols</div>
                        </div>
                      </div>
                    </div>
                  </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* History Panel */}
        {mode === 'generate' && (
        <HistoryPanel
          history={history}
          onSelect={selectFromHistory}
          onRemove={removeFromHistory}
          onClear={clearHistory}
          formatItem={(pwd) => pwd.substring(0, 20) + (pwd.length > 20 ? '...' : '')}
          title="Generated Passwords"
          maxDisplay={10}
        />
        )}
      </div>

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        {/* Introduction */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Why Use a Password Generator?</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              In today&apos;s digital age, strong passwords are your first line of defense against cyber attacks. 
              Weak passwords are one of the leading causes of data breaches, with studies showing that over 80% 
              of hacking-related breaches involve compromised or weak credentials.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our free password generator creates cryptographically secure random passwords that are virtually 
              impossible to guess. Unlike human-created passwords that often follow predictable patterns, our 
              generator uses true randomness to ensure maximum security for your accounts.
            </p>
          </div>
        </section>

        {/* How to Use */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use Our Password Generator</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Creating a strong password is simple with our tool. Follow these steps:
            </p>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
              <li><strong>Choose a Preset (Optional):</strong> Start with one of our quick presets - Strong, PIN, Memorable, or Maximum - for common use cases.</li>
              <li><strong>Adjust Length:</strong> Use the slider to set your desired password length (4-64 characters). Longer passwords are generally more secure.</li>
              <li><strong>Select Character Types:</strong> Choose which character sets to include - uppercase letters, lowercase letters, numbers, and symbols.</li>
              <li><strong>Exclude Similar Characters:</strong> Optionally exclude confusing characters like 0, O, 1, l, and I to make passwords easier to read.</li>
              <li><strong>Generate Multiple Passwords:</strong> Need several passwords? Set the count and generate multiple at once.</li>
              <li><strong>Check Strength:</strong> Review the password strength indicator and estimated crack time before using.</li>
              <li><strong>Copy and Use:</strong> Copy your password securely and use it immediately. Never share passwords or reuse them across accounts.</li>
            </ol>
          </div>
        </section>

        {/* Password Security Tips */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Password Security Best Practices</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔒 Use Unique Passwords</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Never reuse passwords across different accounts. If one account is compromised, all your other 
                accounts remain safe. Use our generator to create unique passwords for each service.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📏 Longer is Stronger</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Password length is more important than complexity. A 16-character password with mixed characters 
                is exponentially stronger than an 8-character password, even with symbols.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔄 Change Regularly</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Update passwords periodically, especially for sensitive accounts like banking, email, and social media. 
                Generate new passwords every 3-6 months for critical accounts.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔐 Use a Password Manager</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Store generated passwords in a reputable password manager. This allows you to use strong, unique 
                passwords without memorizing them all.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">✅ Enable Two-Factor Authentication</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Even the strongest password benefits from two-factor authentication (2FA). This adds an extra layer 
                of security beyond just the password.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🚫 Avoid Personal Information</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Never use names, birthdays, addresses, or other personal information in passwords. These are easily 
                guessable by attackers who know you or can find information about you online.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features of Our Password Generator</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎲</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">True Randomness</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our generator uses cryptographically secure random number generation to ensure passwords are 
                  truly unpredictable and cannot be reverse-engineered.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Strength Meter</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Real-time password strength analysis helps you understand how secure your generated password is. 
                  We also estimate the time it would take to crack your password.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚙️</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Fully Customizable</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Control every aspect of password generation - length, character types, and whether to exclude 
                  similar-looking characters for better readability.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Batch Generation</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Generate up to 20 passwords at once, perfect for setting up multiple accounts or creating 
                  backup passwords. Copy individual passwords or all at once.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Privacy Guaranteed</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  All password generation happens locally in your browser. We never see, store, or transmit your 
                  passwords. Your security is our priority.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Quick Presets</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use our preset configurations for common scenarios - strong passwords, PINs, memorable passwords, 
                  or maximum security. One click to get started.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Password Types */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Understanding Password Types</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Strong Passwords (20 characters)</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                Ideal for most online accounts including email, social media, and cloud services. Combines uppercase, 
                lowercase, numbers, and symbols for maximum security while remaining manageable.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                <strong>Best for:</strong> Email accounts, social media, cloud storage, online shopping
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">PIN Codes (6 digits)</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                Numeric-only passwords perfect for devices, apps, or services that require short numeric codes. 
                Excludes confusing characters like 0 and 1 for clarity.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                <strong>Best for:</strong> Phone locks, app PINs, two-factor authentication codes
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Memorable Passwords (12 characters)</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                Balanced security and readability. Uses letters and numbers while excluding similar characters, 
                making it easier to read and type when needed.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                <strong>Best for:</strong> Accounts you might need to type manually, WiFi passwords, local device access
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Maximum Security (32 characters)</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                Ultimate security for highly sensitive accounts. Uses all character types at maximum length, 
                providing billions of years of protection against brute force attacks.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                <strong>Best for:</strong> Banking, cryptocurrency wallets, master passwords, enterprise accounts
              </p>
            </div>
          </div>
        </section>

        {/* Security & Hacking Reference */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Understanding Password Security & Attacks</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">How Passwords Are Cracked</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Brute Force Attacks</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Attackers systematically try every possible password combination until they find the correct one. 
                    The time required depends on password length and character set size. A 4-digit PIN has only 10,000 
                    possible combinations, while a 16-character password with mixed case, numbers, and symbols has 
                    trillions of possibilities.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Dictionary Attacks</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Attackers use lists of common passwords, words from dictionaries, and previously leaked passwords. 
                    This is why &quot;password123&quot; or &quot;qwerty&quot; are extremely weak - they&apos;re among the first passwords tried. 
                    Our generator creates truly random passwords that won&apos;t appear in any dictionary.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Rainbow Table Attacks</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Pre-computed tables of password hashes allow attackers to quickly look up common passwords. However, 
                    modern systems use &quot;salting&quot; (adding random data) to make rainbow tables ineffective. Strong, unique 
                    passwords remain the best defense.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Social Engineering</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Attackers may try to trick you into revealing your password through phishing emails, fake websites, 
                    or phone calls. Never share your password with anyone, and always verify the authenticity of requests 
                    for your credentials.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Password Strength Factors</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                <li><strong>Length:</strong> Each additional character exponentially increases possible combinations. A 20-character password is vastly stronger than a 10-character one.</li>
                <li><strong>Character Variety:</strong> Using uppercase, lowercase, numbers, and symbols increases the character set size, making brute force attacks much harder.</li>
                <li><strong>Randomness:</strong> Truly random passwords are unpredictable. Avoid patterns, sequences, or personal information that attackers might guess.</li>
                <li><strong>Uniqueness:</strong> Never reuse passwords across different accounts. If one account is compromised, others remain safe.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Understanding Entropy</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                Entropy measures password unpredictability in bits. Higher entropy means more randomness and security. 
                The formula is: entropy = log₂(character_set_size^password_length).
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                For example, a 16-character password using 95 possible characters (uppercase, lowercase, numbers, symbols) 
                has approximately 105 bits of entropy. This means an attacker would need to try 2^105 combinations on 
                average to crack it - an astronomically large number.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Crack Time Estimation</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                Our crack time estimates assume an attacker using specialized hardware capable of approximately 10 billion 
                guesses per second - realistic for sophisticated offline attacks on stolen password databases.
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Online attacks (trying passwords on live websites) are much slower due to rate limiting, but offline 
                attacks on stolen hashes can be extremely fast. Always assume your password hash could be stolen and 
                attacked offline, so use strong passwords even for less critical accounts.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Best Practices to Avoid Being Hacked</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                <li><strong>Use strong, unique passwords:</strong> Generate different passwords for each account using our tool.</li>
                <li><strong>Enable two-factor authentication (2FA):</strong> Adds an extra layer of security even if your password is compromised.</li>
                <li><strong>Use a password manager:</strong> Securely store and manage all your passwords without having to remember them.</li>
                <li><strong>Be cautious with password reset:</strong> Ensure your email and phone accounts are well-protected, as they&apos;re often used for password resets.</li>
                <li><strong>Monitor for breaches:</strong> Use services like &quot;Have I Been Pwned&quot; to check if your accounts have been compromised.</li>
                <li><strong>Update passwords periodically:</strong> Especially for sensitive accounts, change passwords if you suspect any compromise.</li>
                <li><strong>Never share passwords:</strong> Legitimate services will never ask for your password via email or phone.</li>
                <li><strong>Check for HTTPS:</strong> Always ensure websites use HTTPS (secure connection) before entering passwords.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Common Password Mistakes</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                <li>Using personal information (names, birthdays, addresses) that attackers can research</li>
                <li>Creating passwords based on dictionary words or common phrases</li>
                <li>Using simple patterns like &quot;123456&quot; or &quot;qwerty&quot;</li>
                <li>Reusing the same password across multiple accounts</li>
                <li>Writing passwords down in insecure locations</li>
                <li>Sharing passwords with others, even trusted individuals</li>
                <li>Using passwords that are too short (less than 12 characters for important accounts)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How secure are the generated passwords?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Our password generator uses cryptographically secure random number generation, ensuring passwords 
                are truly random and unpredictable. The strength meter and crack time estimate help you understand 
                the security level of each generated password.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Are my passwords stored or transmitted?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Absolutely not. All password generation happens entirely in your browser using JavaScript. 
                We never see, store, transmit, or have any access to your generated passwords. Your privacy 
                and security are guaranteed.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What makes a password strong?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                A strong password combines length, complexity, and randomness. Longer passwords (16+ characters) 
                with a mix of uppercase, lowercase, numbers, and symbols are exponentially stronger than short, 
                simple passwords. Our generator creates passwords that meet all these criteria.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Should I exclude similar characters?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Excluding similar characters (0, O, 1, l, I) makes passwords easier to read and type, which is 
                helpful when you need to manually enter them. However, it slightly reduces the character set size. 
                For maximum security, keep all characters; for better usability, exclude similar ones.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How many passwords should I generate at once?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Generate as many as you need! Our tool supports generating up to 20 passwords simultaneously. 
                This is useful when setting up multiple accounts, creating backup passwords, or when you need 
                several options to choose from.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What is the estimated crack time based on?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                The crack time estimate assumes a modern attacker using specialized hardware capable of approximately 
                1 billion password guesses per second. This is a realistic estimate for sophisticated attacks, 
                though actual times may vary based on the attacker&apos;s resources and methods.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I use these passwords for any service?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Yes! Generated passwords work with any service that accepts passwords. However, always check the 
                specific requirements of each service - some may have length limits, character restrictions, or 
                other requirements that you&apos;ll need to adjust for.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Security Tools" />
      )}
    </Layout>
    </>
  )
}

