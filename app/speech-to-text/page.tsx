'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

export default function SpeechToTextPage() {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLang, setSelectedLang] = useState('en-US')
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef<any>(null)

  // Check browser support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        setIsSupported(true)
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = selectedLang

        recognition.onstart = () => {
          setIsListening(true)
          setError(null)
        }

        recognition.onresult = (event: any) => {
          let finalTranscript = ''
          let interim = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' '
            } else {
              interim += transcript
            }
          }

          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript)
          }
          setInterimTranscript(interim)
        }

        recognition.onerror = (event: any) => {
          setIsListening(false)
          let errorMessage = 'Speech recognition error: '
          
          switch (event.error) {
            case 'no-speech':
              errorMessage = 'No speech detected. Please try again.'
              break
            case 'audio-capture':
              errorMessage = 'No microphone found. Please check your microphone settings.'
              break
            case 'not-allowed':
              errorMessage = 'Microphone permission denied. Please allow microphone access and try again.'
              break
            case 'network':
              errorMessage = 'Network error. Please check your internet connection.'
              break
            case 'aborted':
              errorMessage = 'Speech recognition was aborted.'
              break
            default:
              errorMessage = `Error: ${event.error}`
          }
          
          setError(errorMessage)
        }

        recognition.onend = () => {
          setIsListening(false)
          setInterimTranscript('')
        }

        recognitionRef.current = recognition
      } else {
        setIsSupported(false)
        setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [selectedLang])

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition is not available')
      return
    }

    try {
      recognitionRef.current.start()
    } catch (err) {
      setError('Failed to start speech recognition. Please try again.')
    }
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setInterimTranscript('')
  }, [])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
  }, [])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcript)
    } catch (err) {
      setError('Failed to copy to clipboard')
    }
  }

  const exportToFile = () => {
    if (!transcript) return
    
    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `transcript-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'es-MX', name: 'Spanish (Mexico)' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'pt-PT', name: 'Portuguese (Portugal)' },
    { code: 'ru-RU', name: 'Russian' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'zh-TW', name: 'Chinese (Traditional)' },
    { code: 'ar-SA', name: 'Arabic' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'nl-NL', name: 'Dutch' },
    { code: 'pl-PL', name: 'Polish' },
    { code: 'tr-TR', name: 'Turkish' },
    { code: 'sv-SE', name: 'Swedish' },
  ]

  const breadcrumbs = generateBreadcrumbs('Speech to Text', '/speech-to-text', 'text')

  const relatedTools = getRelatedTools('/speech-to-text', 'text', 6)

  const faqSchema = generateFAQSchema([
    {
      question: 'How does speech-to-text work?',
      answer: 'Our speech-to-text tool uses the Web Speech API built into your browser. It listens to your voice through your microphone and converts it to text in real-time. All processing happens in your browser - no data is sent to any server.'
    },
    {
      question: 'Is speech-to-text free?',
      answer: 'Yes, completely free! Our tool uses your browser\'s built-in speech recognition capabilities, so there are no costs, limits, or registration required.'
    },
    {
      question: 'What browsers support speech-to-text?',
      answer: 'Speech-to-text works in Chrome, Edge, and Safari. Firefox support is limited. The feature requires microphone access and an internet connection for some browsers.'
    },
    {
      question: 'Do I need to allow microphone access?',
      answer: 'Yes, you need to allow microphone access when prompted by your browser. This is required for the speech recognition to work. Your audio is processed locally and not stored.'
    },
    {
      question: 'Can I use different languages?',
      answer: 'Yes! You can select from various languages from the language dropdown. The recognition accuracy is best when you speak in the selected language.'
    }
  ])

  const howToSchema = generateHowToSchema(
    'Convert Speech to Text',
    'Learn how to use our free speech-to-text tool to convert your voice into text',
    [
      {
        name: 'Allow microphone access',
        text: 'When you click "Start Listening", your browser will ask for microphone permission. Click "Allow" to proceed',
        image: '/og-image.jpg'
      },
      {
        name: 'Select language',
        text: 'Choose the language you will be speaking from the language dropdown menu',
        image: '/og-image.jpg'
      },
      {
        name: 'Start speaking',
        text: 'Click "Start Listening" and begin speaking. Your words will appear in real-time as you speak',
        image: '/og-image.jpg'
      },
      {
        name: 'Stop and review',
        text: 'Click "Stop Listening" when finished. Review and edit the transcribed text, then copy or export it',
        image: '/og-image.jpg'
      }
    ],
    'PT2M'
  )

  const softwareSchema = generateSoftwareApplicationSchema(
    'Speech to Text',
    'Free online speech-to-text converter with real-time transcription and multiple language support',
    'https://prylad.pro/speech-to-text',
    'UtilityApplication',
    'Web Browser'
  )

  return (
    <Layout
      title="🎤 Speech to Text"
      description="Convert your speech to text online for free. Real-time transcription with multiple language support. Works entirely in your browser."
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
                  {error || 'Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.'}
                </p>
              </div>
            )}

            {/* Language Selection */}
            {isSupported && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Language
                </label>
                <select
                  value={selectedLang}
                  onChange={(e) => {
                    setSelectedLang(e.target.value)
                    if (isListening) {
                      stopListening()
                    }
                  }}
                  disabled={isListening}
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Controls */}
            {isSupported && (
              <div className="flex gap-3">
                {!isListening ? (
                  <button
                    onClick={startListening}
                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">🎤</span>
                    <span>Start Listening</span>
                  </button>
                ) : (
                  <button
                    onClick={stopListening}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <span className="text-xl animate-pulse">🔴</span>
                    <span>Stop Listening</span>
                  </button>
                )}
              </div>
            )}

            {/* Status Indicator */}
            {isListening && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl animate-pulse">🔴</span>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Listening... Speak now
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && !isListening && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Transcript Display */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Transcript
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    disabled={!transcript.trim()}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Copy
                  </button>
                  <button
                    onClick={exportToFile}
                    disabled={!transcript.trim()}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Export
                  </button>
                  <button
                    onClick={clearTranscript}
                    disabled={!transcript.trim()}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="relative">
                <textarea
                  value={transcript + (interimTranscript ? ' ' + interimTranscript : '')}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={isListening ? 'Start speaking...' : 'Click "Start Listening" and begin speaking. Your words will appear here.'}
                  className="w-full h-64 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
                />
                {interimTranscript && (
                  <div className="absolute bottom-4 right-4 text-xs text-gray-400 dark:text-gray-500 italic">
                    Listening...
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {transcript.length} character{transcript.length !== 1 ? 's' : ''}
                </p>
                {transcript.trim() && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transcript.trim().split(/\s+/).length} word{transcript.trim().split(/\s+/).length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Tips */}
            {isSupported && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">Tips for Best Results</h3>
                <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                  <li>• Speak clearly and at a moderate pace</li>
                  <li>• Use a quiet environment to reduce background noise</li>
                  <li>• Position your microphone close to your mouth</li>
                  <li>• Select the correct language for better accuracy</li>
                  <li>• Speak punctuation marks (e.g., &quot;period&quot;, &quot;comma&quot;) if needed</li>
                </ul>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is Speech-to-Text?</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Speech-to-Text (STT), also known as voice recognition or speech recognition, is a technology that converts 
            spoken words into written text. Our free online tool uses the Web Speech API built into your browser to 
            transcribe your speech in real-time.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            All processing happens in your browser - your voice is processed locally and not stored on any server, 
            ensuring complete privacy and security. The tool is completely free to use with no limits or registration required.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Features</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Real-time Transcription:</strong> See your words appear as you speak</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Multiple Languages:</strong> Support for 20+ languages including English, Spanish, French, German, and more</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Continuous Recognition:</strong> Keep speaking without interruption</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Interim Results:</strong> See partial transcriptions as you speak</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Export Options:</strong> Copy to clipboard or export to text file</span>
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
              <span><strong>Dictation:</strong> Quickly convert your thoughts to text without typing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Note Taking:</strong> Take notes during meetings or lectures</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Accessibility:</strong> Help users who have difficulty typing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Content Creation:</strong> Transcribe audio content or create written content by speaking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>Language Practice:</strong> Practice speaking and see how your words are transcribed</span>
            </li>
          </ul>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Browser Compatibility</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Speech-to-Text is supported in modern browsers:
          </p>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span><strong>Chrome/Edge:</strong> Full support with high accuracy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span><strong>Safari:</strong> Full support with system speech recognition</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">⚠</span>
              <span><strong>Firefox:</strong> Limited support (may require additional setup)</span>
            </li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4 text-sm">
            <strong>Note:</strong> You need to allow microphone access when prompted. Some browsers may require an 
            internet connection for speech recognition processing.
          </p>
        </section>
      </div>
    </Layout>
  )
}


