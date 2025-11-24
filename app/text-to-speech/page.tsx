'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

interface Voice {
  name: string
  lang: string
  default?: boolean
  localService?: boolean
}

export default function TextToSpeechPage() {
  const [text, setText] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Check browser support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true)
      loadVoices()
      
      // Some browsers load voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
    } else {
      setIsSupported(false)
      setError('Text-to-Speech is not supported in your browser. Please use Chrome, Edge, Safari, or Firefox.')
    }
  }, [])

  const loadVoices = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)
      
      // Set default voice (prefer English, non-local service)
      if (availableVoices.length > 0 && !selectedVoice) {
        const defaultVoice = availableVoices.find(v => 
          v.lang.startsWith('en') && !v.localService
        ) || availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0]
        setSelectedVoice(defaultVoice)
      }
    }
  }, [selectedVoice])

  const speak = useCallback(() => {
    if (!text.trim()) {
      setError('Please enter some text to speak')
      return
    }

    if (!isSupported) {
      setError('Text-to-Speech is not supported in your browser')
      return
    }

    // Stop any current speech
    window.speechSynthesis.cancel()

    setError(null)
    setIsPlaying(true)

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Set voice
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    // Set properties
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    // Event handlers
    utterance.onend = () => {
      setIsPlaying(false)
      utteranceRef.current = null
    }

    utterance.onerror = (event) => {
      setIsPlaying(false)
      setError(`Speech error: ${event.error}`)
      utteranceRef.current = null
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [text, selectedVoice, rate, pitch, volume, isSupported])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    utteranceRef.current = null
  }, [])

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
    }
  }, [])

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
  }, [])

  const clearText = useCallback(() => {
    setText('')
    stop()
  }, [stop])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      setError('Failed to copy to clipboard')
    }
  }

  const breadcrumbs = generateBreadcrumbs('Text to Speech', '/text-to-speech', 'text')

  const relatedTools = getRelatedTools('/text-to-speech', 'text', 6)

  const faqSchema = generateFAQSchema([
    {
      question: 'How does text-to-speech work?',
      answer: 'Our text-to-speech tool uses the Web Speech API built into your browser. It converts your text into natural-sounding speech using synthetic voices. All processing happens locally in your browser - no data is sent to any server.'
    },
    {
      question: 'Is text-to-speech free?',
      answer: 'Yes, completely free! Our tool uses your browser\'s built-in text-to-speech capabilities, so there are no costs, limits, or registration required.'
    },
    {
      question: 'What browsers support text-to-speech?',
      answer: 'Text-to-speech works in Chrome, Edge, Safari, and Firefox. The available voices depend on your operating system and browser.'
    },
    {
      question: 'Can I adjust the voice speed and pitch?',
      answer: 'Yes! You can adjust the speech rate (speed), pitch, and volume using the sliders. Rate ranges from 0.1 (very slow) to 10 (very fast), pitch from 0 (low) to 2 (high), and volume from 0 (silent) to 1 (maximum).'
    },
    {
      question: 'Are there different voices available?',
      answer: 'Yes! The available voices depend on your browser and operating system. You can select from different voices and languages from the voice dropdown menu.'
    }
  ])

  const howToSchema = generateHowToSchema(
    'Convert Text to Speech',
    'Learn how to use our free text-to-speech tool to convert any text into natural-sounding speech',
    [
      {
        name: 'Enter your text',
        text: 'Type or paste the text you want to convert to speech into the text area',
        image: '/og-image.jpg'
      },
      {
        name: 'Select voice and settings',
        text: 'Choose a voice from the dropdown, and adjust the rate, pitch, and volume sliders to your preference',
        image: '/og-image.jpg'
      },
      {
        name: 'Click Speak',
        text: 'Click the "Speak" button to start the text-to-speech conversion. You can pause, resume, or stop at any time',
        image: '/og-image.jpg'
      },
      {
        name: 'Listen and adjust',
        text: 'Listen to the speech and adjust the settings if needed. You can change voices or modify speed/pitch/volume for better results',
        image: '/og-image.jpg'
      }
    ],
    'PT2M'
  )

  const softwareSchema = generateSoftwareApplicationSchema(
    'Text to Speech',
    'Free online text-to-speech converter with multiple voices, languages, and customizable settings',
    'https://prylad.pro/text-to-speech',
    'UtilityApplication',
    'Web Browser'
  )

  // Group voices by language
  const voicesByLang = voices.reduce((acc, voice) => {
    const lang = voice.lang.split('-')[0]
    if (!acc[lang]) {
      acc[lang] = []
    }
    acc[lang].push(voice)
    return acc
  }, {} as Record<string, SpeechSynthesisVoice[]>)

  return (
    <Layout
      title="🔊 Text to Speech"
      description="Convert any text to speech online for free. Multiple voices, languages, and customizable settings. Works entirely in your browser."
      breadcrumbs={breadcrumbs}
    >
      <StructuredData data={[faqSchema, howToSchema, softwareSchema]} />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* Browser Support Warning */}
            {!isSupported && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  {error || 'Text-to-Speech is not supported in your browser. Please use Chrome, Edge, Safari, or Firefox.'}
                </p>
              </div>
            )}

            {/* Text Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Enter Text to Speak
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here... For example: Hello, this is a text-to-speech demonstration."
                className="w-full h-40 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {text.length} character{text.length !== 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    disabled={!text.trim()}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Copy
                  </button>
                  <button
                    onClick={clearText}
                    disabled={!text.trim()}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Selection */}
            {isSupported && voices.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Voice
                </label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = voices.find(v => v.name === e.target.value)
                    setSelectedVoice(voice || null)
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  {Object.entries(voicesByLang).map(([lang, langVoices]) => (
                    <optgroup key={lang} label={lang.toUpperCase()}>
                      {langVoices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} {voice.localService ? '(Local)' : ''} - {voice.lang}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {selectedVoice && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Language: {selectedVoice.lang} {selectedVoice.localService ? '(Local Service)' : '(Online Service)'}
                  </p>
                )}
              </div>
            )}

            {/* Settings */}
            {isSupported && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Rate: {rate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0.1x (Slow)</span>
                    <span>1.0x (Normal)</span>
                    <span>10x (Fast)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Pitch: {pitch.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0 (Low)</span>
                    <span>1 (Normal)</span>
                    <span>2 (High)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Volume: {Math.round(volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0% (Silent)</span>
                    <span>50%</span>
                    <span>100% (Max)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Controls */}
            {isSupported && (
              <div className="flex gap-3">
                <button
                  onClick={speak}
                  disabled={!text.trim() || isPlaying}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlaying ? 'Speaking...' : '🔊 Speak'}
                </button>
                {isPlaying && (
                  <>
                    <button
                      onClick={window.speechSynthesis.paused ? resume : pause}
                      className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                    >
                      {window.speechSynthesis.paused ? '▶️ Resume' : '⏸️ Pause'}
                    </button>
                    <button
                      onClick={stop}
                      className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      ⏹️ Stop
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Tools */}
      <RelatedTools tools={relatedTools} />

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is Text-to-Speech?</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Text-to-Speech (TTS) is a technology that converts written text into spoken words. Our free online tool 
            uses the Web Speech API built into your browser to synthesize natural-sounding speech from any text you provide.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            All processing happens locally in your browser - your text is never sent to any server, ensuring complete 
            privacy and security. The tool is completely free to use with no limits or registration required.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Features</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Multiple Voices:</strong> Choose from various voices and languages available in your browser</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Adjustable Speed:</strong> Control speech rate from 0.1x (very slow) to 10x (very fast)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Pitch Control:</strong> Adjust voice pitch from low (0) to high (2)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Volume Control:</strong> Adjust volume from 0% to 100%</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Playback Controls:</strong> Pause, resume, and stop speech at any time</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Privacy:</strong> All processing happens in your browser - no data is sent to servers</span>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Use Cases</h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Accessibility:</strong> Help users with visual impairments or reading difficulties</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Language Learning:</strong> Listen to correct pronunciation of words and phrases</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Content Review:</strong> Listen to your written content to catch errors and improve flow</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Multitasking:</strong> Listen to text while doing other tasks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Proofreading:</strong> Hear your text read aloud to identify mistakes</span>
            </li>
          </ul>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Browser Compatibility</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Text-to-Speech is supported in all modern browsers:
          </p>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span><strong>Chrome/Edge:</strong> Full support with multiple voices</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span><strong>Safari:</strong> Full support with system voices</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span><strong>Firefox:</strong> Full support with system voices</span>
            </li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4 text-sm">
            The available voices depend on your operating system. Windows, macOS, and Linux each provide different 
            voice options that you can use with our tool.
          </p>
        </section>
      </div>
    </Layout>
  )
}

