'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type Mode = 'encode' | 'decode'

// Morse code dictionary
const morseCode: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/'
}

// Reverse dictionary for decoding
const reverseMorseCode: Record<string, string> = {}
Object.entries(morseCode).forEach(([char, code]) => {
  reverseMorseCode[code] = char
})

const examples = {
  encode: [
    { name: 'Hello', input: 'HELLO', output: '.... . .-.. .-.. ---' },
    { name: 'SOS', input: 'SOS', output: '... --- ...' },
    { name: 'Hello World', input: 'HELLO WORLD', output: '.... . .-.. .-.. --- / .-- --- .-. .-.. -..' },
    { name: 'Numbers', input: '123', output: '.---- ..--- ...--' },
    { name: 'Question', input: 'HOW ARE YOU?', output: '.... --- .-- / .- .-. . / -.-- --- ..- ..--..' },
  ],
  decode: [
    { name: 'Hello', input: '.... . .-.. .-.. ---', output: 'HELLO' },
    { name: 'SOS', input: '... --- ...', output: 'SOS' },
    { name: 'Hello World', input: '.... . .-.. .-.. --- / .-- --- .-. .-.. -..', output: 'HELLO WORLD' },
    { name: 'Numbers', input: '.---- ..--- ...--', output: '123' },
    { name: 'Question', input: '.... --- .-- / .- .-. . / -.-- --- ..- ..--..', output: 'HOW ARE YOU?' },
  ],
}

export default function MorseCodeEncoderPage() {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('HELLO')
  const [output, setOutput] = useState('')
  const [autoConvert, setAutoConvert] = useState(true)
  const [totalConversions, setTotalConversions] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  // SEO data
  const toolPath = '/morse-code-encoder'
  const toolName = 'Morse Code Encoder'
  const category = 'converters'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is Morse code?",
      answer: "Morse code is a method of encoding text characters using sequences of dots (.) and dashes (-) to represent letters, numbers, and punctuation. It was developed in the 1830s for telegraph communication and is still used today in radio communications and emergency signaling."
    },
    {
      question: "How does Morse code encoding work?",
      answer: "Each letter, number, and punctuation mark has a unique sequence of dots and dashes. For example, 'A' is '.-', 'B' is '-...', and 'SOS' (distress signal) is '... --- ...'. Words are separated by '/' and letters within words are separated by spaces."
    },
    {
      question: "Can I hear the Morse code audio?",
      answer: "Yes! Our tool includes audio playback functionality. You can play the encoded Morse code as audio tones, with dots as short beeps and dashes as longer beeps. This helps you learn Morse code by sound."
    },
    {
      question: "What characters are supported?",
      answer: "Our Morse code encoder supports all letters (A-Z), numbers (0-9), and common punctuation marks including period, comma, question mark, exclamation mark, and more. Spaces between words are represented by '/'."
    },
    {
      question: "Is the Morse code encoder free to use?",
      answer: "Yes, absolutely! Our Morse code encoder is completely free to use. There are no hidden fees, subscriptions, or usage limits. You can encode and decode as much text as you need."
    },
    {
      question: "Do you store my encoded/decoded text?",
      answer: "No, absolutely not. All encoding and decoding happens entirely in your browser. We never see, store, transmit, or have any access to your text or Morse code. Your privacy is completely protected."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Choose Mode",
      text: "Select Encode to convert text to Morse code, or Decode to convert Morse code back to text."
    },
    {
      name: "Enter Your Text or Morse Code",
      text: "Type or paste your text (for encoding) or Morse code (for decoding) into the input field."
    },
    {
      name: "Enable Auto-Convert (Optional)",
      text: "Turn on auto-convert to automatically encode or decode as you type for real-time conversion."
    },
    {
      name: "Play Audio (Encode Mode)",
      text: "Click the play button to hear the Morse code as audio tones. This helps you learn Morse code by sound."
    },
    {
      name: "Copy Result",
      text: "Copy the encoded or decoded result to your clipboard for use in your projects or communications."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Encode and Decode Morse Code",
      "Learn how to encode text to Morse code and decode Morse code back to text using our free online Morse code translator with audio playback.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Morse Code Encoder",
      "Free online Morse code encoder and decoder. Convert text to Morse code and Morse code to text with audio playback support.",
      "https://prylad.pro/morse-code-encoder",
      "UtilityApplication"
    )
  ]

  const encodeMorse = useCallback((text: string): string => {
    const words = text.toUpperCase().split(/\s+/).filter(w => w.length > 0)
    
    return words.map(word => {
      return word.split('').map(char => {
        return morseCode[char] || char
      }).join(' ')
    }).join(' / ')
  }, [])

  const decodeMorse = useCallback((morse: string): string => {
    return morse
      .split(' / ')
      .map((word) => {
        return word
          .split(' ')
          .map((code) => {
            if (code === '' || code === '/') return ' '
            return reverseMorseCode[code] || code
          })
          .join('')
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
  }, [])

  const handleConvert = useCallback(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      const result = mode === 'encode' ? encodeMorse(input) : decodeMorse(input)
      setOutput(result)
      setTotalConversions(prev => prev + 1)
    } catch (error) {
      setOutput('Error: Invalid input')
    }
  }, [input, mode, encodeMorse, decodeMorse])

  useEffect(() => {
    if (autoConvert) {
      if (input.trim()) {
        const timer = setTimeout(() => {
          try {
            const result = mode === 'encode' ? encodeMorse(input) : decodeMorse(input)
            setOutput(result)
            setTotalConversions(prev => prev + 1)
          } catch (error) {
            setOutput('Error: Invalid input')
          }
        }, 100)
        return () => clearTimeout(timer)
      } else {
        setOutput('')
      }
    }
  }, [input, mode, autoConvert, encodeMorse, decodeMorse])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Failed to copy
    }
  }

  const applyExample = (example: typeof examples.encode[0]) => {
    setInput(example.input)
    if (!autoConvert) {
      setOutput(example.output)
    }
  }

  const playMorseCode = useCallback(async () => {
    if (!output || mode !== 'encode' || isPlaying) return

    try {
      // Resume audio context if suspended (required for user interaction)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const audioContext = audioContextRef.current
      
      // Resume if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      setIsPlaying(true)

      const dotDuration = 0.08 // seconds
      const dashDuration = 0.24 // seconds (3x dot)
      const symbolGap = 0.08 // seconds
      const letterGap = 0.24 // seconds (3x dot)
      const wordGap = 0.56 // seconds (7x dot)

      let currentTime = audioContext.currentTime

      // Create a single oscillator that we'll control with gain
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = 600 // Hz
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Start oscillator immediately (but silent)
      gainNode.gain.setValueAtTime(0, currentTime)
      oscillator.start(currentTime)

      // Process each character
      for (const char of output) {
        if (char === '.') {
          // Dot: beep for dotDuration
          gainNode.gain.setValueAtTime(0.3, currentTime)
          gainNode.gain.setValueAtTime(0, currentTime + dotDuration)
          currentTime += dotDuration + symbolGap
        } else if (char === '-') {
          // Dash: beep for dashDuration
          gainNode.gain.setValueAtTime(0.3, currentTime)
          gainNode.gain.setValueAtTime(0, currentTime + dashDuration)
          currentTime += dashDuration + symbolGap
        } else if (char === ' ') {
          // Space between letters
          currentTime += letterGap
        } else if (char === '/') {
          // Space between words
          currentTime += wordGap
        }
      }

      // Stop oscillator after all sounds
      oscillator.stop(currentTime + 0.1)

      // Reset playing state after audio finishes
      const totalDuration = (currentTime - audioContext.currentTime) * 1000
      setTimeout(() => {
        setIsPlaying(false)
      }, totalDuration + 100)
    } catch (error) {
      setIsPlaying(false)
      console.error('Error playing Morse code:', error)
    }
  }, [output, mode, isPlaying])

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="📡 Morse Code Encoder/Decoder"
        description="Encode and decode Morse code. Convert text to Morse code and Morse code to text. Free online Morse code translator with audio playback."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Main Tool */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Conversion Mode:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMode('encode')
                    setOutput('')
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'encode'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  📡 Encode (Text → Morse Code)
                </button>
                <button
                  onClick={() => {
                    setMode('decode')
                    setOutput('')
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'decode'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  🔊 Decode (Morse Code → Text)
                </button>
              </div>
            </div>

            {/* Auto Convert Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto-convert"
                checked={autoConvert}
                onChange={(e) => setAutoConvert(e.target.checked)}
                className="w-4 h-4 accent-primary-600 rounded"
              />
              <label htmlFor="auto-convert" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                Auto-convert on input change
              </label>
            </div>

            {/* Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {mode === 'encode' ? 'Text to Encode' : 'Morse Code to Decode'}
                </label>
                <button
                  onClick={() => {
                    setInput('')
                    setOutput('')
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' 
                  ? 'Enter text to convert to Morse code (e.g., HELLO)...' 
                  : 'Enter Morse code (dots and dashes, e.g., .... . .-.. .-.. ---)...'}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm min-h-[150px] resize-y"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {input.length} characters
                </span>
                {input && (
                  <button
                    onClick={() => copyToClipboard(input)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Copy Input
                  </button>
                )}
              </div>
            </div>

            {/* Convert Button */}
            {!autoConvert && (
              <button
                onClick={handleConvert}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
              >
                {mode === 'encode' ? 'Encode' : 'Decode'}
              </button>
            )}

            {/* Output */}
            {output && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {mode === 'encode' ? 'Morse Code' : 'Decoded Text'}
                  </label>
                  <div className="flex items-center gap-3">
                    {totalConversions > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Conversions: {totalConversions}
                      </span>
                    )}
                    {mode === 'encode' && output && (
                      <button
                        onClick={playMorseCode}
                        disabled={isPlaying}
                        className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPlaying ? '🔊 Playing...' : '🔊 Play Audio'}
                      </button>
                    )}
                    <button
                      onClick={() => copyToClipboard(output)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Copy Output
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    value={output}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-primary-200 dark:border-primary-800 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-gray-900 dark:text-gray-100 font-mono text-lg min-h-[150px] resize-y"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => copyToClipboard(output)}
                      className="px-3 py-1.5 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 transition-colors shadow-md"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {output.length} characters
                  </span>
                  {mode === 'encode' && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {output.split(' ').filter(c => c && c !== '/').length} symbols
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Examples */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Quick Examples:
              </label>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                {examples[mode].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => applyExample(example)}
                    className="px-3 py-2 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {example.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate">
                      {example.input}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Morse Code Reference Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Morse Code Reference</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm">Letters</h3>
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {Object.entries(morseCode)
                  .filter(([char]) => /[A-Z]/.test(char))
                  .map(([char, code]) => (
                    <div key={char} className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-gray-100 font-bold">{char}</span>
                      <span className="text-gray-600 dark:text-gray-400">{code}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm">Numbers</h3>
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {Object.entries(morseCode)
                  .filter(([char]) => /[0-9]/.test(char))
                  .map(([char, code]) => (
                    <div key={char} className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-gray-100 font-bold">{char}</span>
                      <span className="text-gray-600 dark:text-gray-400">{code}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm">Punctuation</h3>
              <div className="grid grid-cols-1 gap-2 text-sm font-mono">
                {Object.entries(morseCode)
                  .filter(([char]) => !/[A-Z0-9\s]/.test(char))
                  .slice(0, 10)
                  .map(([char, code]) => (
                    <div key={char} className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-gray-100 font-bold">{char === ' ' ? 'SPACE' : char}</span>
                      <span className="text-gray-600 dark:text-gray-400">{code}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is Morse Code?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Morse code is a method of encoding text characters using sequences of dots (.) and dashes (-), 
                also known as dits and dahs. It was developed in the 1830s and 1840s by Samuel Morse and Alfred 
                Vail for use with the telegraph system.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Each letter, number, and punctuation mark has a unique combination of dots and dashes. Letters are 
                separated by spaces, and words are separated by a forward slash (/). Morse code is still used today 
                in radio communications, aviation, and by amateur radio operators.
              </p>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use Our Morse Code Translator</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li><strong>Choose Mode:</strong> Select &quot;Encode&quot; to convert text to Morse code, or &quot;Decode&quot; to convert Morse code back to text.</li>
                <li><strong>Enter Your Text:</strong> For encoding, type or paste your text. For decoding, enter Morse code using dots (.), dashes (-), and spaces.</li>
                <li><strong>View Results:</strong> The converted text will appear automatically (if auto-convert is enabled) or click the convert button.</li>
                <li><strong>Play Audio:</strong> When encoding, click &quot;Play Audio&quot; to hear the Morse code as sound (dots are short beeps, dashes are long beeps).</li>
                <li><strong>Copy Results:</strong> Click the copy button to copy the converted text to your clipboard.</li>
              </ol>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📻 Radio Communications</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Amateur radio operators and emergency services use Morse code for reliable communication, 
                  especially in situations where voice communication is difficult or impossible.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">✈️ Aviation</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Pilots and air traffic controllers use Morse code for navigation beacons and identification 
                  signals. Each airport has a unique Morse code identifier.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎓 Education & Learning</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Students and hobbyists learn Morse code as a skill, for historical interest, or as part 
                  of amateur radio licensing requirements.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔐 Secret Messages</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Create encoded messages for games, puzzles, or educational activities. Morse code adds an 
                  element of mystery and fun to communication.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Understanding Morse Code Timing</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic Units</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-sm ml-4">
                  <li><strong>Dot (.)</strong> - The basic unit of time (1 unit)</li>
                  <li><strong>Dash (-)</strong> - Three times the length of a dot (3 units)</li>
                  <li><strong>Space between symbols</strong> - 1 unit (within a letter)</li>
                  <li><strong>Space between letters</strong> - 3 units</li>
                  <li><strong>Space between words</strong> - 7 units (represented by /)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Famous Morse Code Messages</h3>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">... --- ...</span>
                    <span><strong>SOS</strong> - The international distress signal (Save Our Souls)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">-.-. --.-</span>
                    <span><strong>CQ</strong> - General call to all stations (Come Quick)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">-.. .</span>
                    <span><strong>DE</strong> - From (used in radio communications)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What are dots and dashes?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Dots (.) are short signals, and dashes (-) are long signals. A dash is typically three times 
                  the length of a dot. In audio, dots are short beeps and dashes are long beeps.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How do I separate words in Morse code?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Words are separated by a forward slash (/) or seven units of space. For example, &quot;HELLO WORLD&quot; 
                  becomes &quot;.... . .-.. .-.. --- / .-- --- .-. .-.. -..&quot;
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I use lowercase letters?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes! Our encoder automatically converts lowercase letters to uppercase before encoding. Morse code 
                  doesn&apos;t distinguish between uppercase and lowercase.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What characters are supported?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our translator supports all letters (A-Z), numbers (0-9), and common punctuation marks including 
                  period, comma, question mark, exclamation mark, and more.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Is my data stored or transmitted?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, all encoding and decoding happens entirely in your browser. We never see, store, or transmit any 
                  of your text. Your privacy is completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Converter Tools" />
      )}
    </Layout>
    </>
  )
}

