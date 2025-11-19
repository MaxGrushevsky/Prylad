'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import FileDropZone from '@/components/FileDropZone'
type Mode = 'text' | 'image'
type Format = 'standard' | 'url-safe'

export default function Base64ConverterPage() {
  const [text, setText] = useState('')
  const [base64, setBase64] = useState('')
  const [mode, setMode] = useState<Mode>('text')
  const [format, setFormat] = useState<Format>('standard')
  const [autoConvert, setAutoConvert] = useState(true)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')
  const [totalOperations, setTotalOperations] = useState(0)
  const encodeText = useCallback((input: string, fmt: Format): string => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)))
      if (fmt === 'url-safe') {
        return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      }
      return encoded
    } catch (e) {
      throw new Error('Encoding failed')
    }
  }, [])

  const decodeText = useCallback((input: string, fmt: Format): string => {
    try {
      let cleaned = input.trim()
      if (fmt === 'url-safe') {
        cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/')
        // Add padding if needed
        while (cleaned.length % 4) {
          cleaned += '='
        }
      }
      return decodeURIComponent(escape(atob(cleaned)))
    } catch (e) {
      throw new Error('Invalid Base64 string')
    }
  }, [])

  const encode = useCallback(() => {
    setError('')
    if (mode === 'text' && text) {
      try {
        const encoded = encodeText(text, format)
        setBase64(encoded)
        setTotalOperations(prev => prev + 1)
      } catch (e) {
        setError('Encoding failed. Please check your input.')
      }
    }
  }, [text, mode, format, encodeText])

  const decode = useCallback(() => {
    setError('')
    if (mode === 'text' && base64) {
      try {
        const decoded = decodeText(base64, format)
        setText(decoded)
        setTotalOperations(prev => prev + 1)
      } catch (e) {
        setError('Decoding failed. Invalid Base64 string.')
      }
    }
  }, [base64, mode, format, decodeText])

  // Auto-convert on text change
  useEffect(() => {
    if (autoConvert && mode === 'text' && text) {
      const timer = setTimeout(() => {
        encode()
      }, 300)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoConvert, mode, format])

  // Auto-decode on base64 change
  useEffect(() => {
    if (autoConvert && mode === 'text' && base64 && !text) {
      const timer = setTimeout(() => {
        decode()
      }, 300)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base64, autoConvert, mode, format])

  const handleImageUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setBase64(result)
      setImagePreview(result)
      setTotalOperations(prev => prev + 1)
    }
    reader.onerror = () => {
      setError('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  const downloadImage = () => {
    if (!imagePreview) return
    const link = document.createElement('a')
    link.href = imagePreview
    link.download = `decoded-image-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
    }
  }

  const exportToFile = () => {
    if (!base64) return
    const blob = new Blob([base64], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `base64-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setText('')
    setBase64('')
    setImagePreview('')
    setError('')
  }

  const textSize = new Blob([text]).size
  const base64Size = new Blob([base64]).size
  const sizeIncrease = text ? ((base64Size / textSize - 1) * 100).toFixed(1) : '0'

  return (
    <>
      <Layout
        title="📦 Base64 Encoder/Decoder"
      description="Encode and decode text and images to Base64 format. Free online Base64 converter with URL-safe encoding, auto-convert, and image support."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6">
          <div className="space-y-6">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Mode:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMode('text')
                    setImagePreview('')
                    setError('')
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'text'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => {
                    setMode('image')
                    setText('')
                    setBase64('')
                    setError('')
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'image'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Image
                </button>
              </div>
            </div>

            {/* Format Selection (for text mode) */}
            {mode === 'text' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Base64 Format:</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormat('standard')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      format === 'standard'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setFormat('url-safe')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      format === 'url-safe'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    URL-Safe
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  URL-Safe replaces + with - and / with _ for use in URLs
                </p>
              </div>
            )}

            {/* Text Mode */}
            {mode === 'text' && (
              <>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Text Input:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="auto-convert"
                        checked={autoConvert}
                        onChange={(e) => setAutoConvert(e.target.checked)}
                        className="w-4 h-4 accent-primary-600"
                      />
                      <label htmlFor="auto-convert" className="text-xs text-gray-600 cursor-pointer">
                        Auto-convert
                      </label>
                    </div>
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value)
                      setError('')
                    }}
                    className="w-full h-40 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                    placeholder="Enter text to encode..."
                  />
                  {text && (
                    <p className="text-xs text-gray-500 mt-1">
                      {text.length} characters, {textSize} bytes
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={encode}
                    disabled={!text}
                    className="flex-1 bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Encode → Base64
                  </button>
                  <button
                    onClick={decode}
                    disabled={!base64}
                    className="flex-1 bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Decode ← Base64
                  </button>
                  <button
                    onClick={clearAll}
                    className="bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </>
            )}

            {/* Image Mode */}
            {mode === 'image' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Image:</label>
                <FileDropZone
                  onFileSelect={handleImageUpload}
                  accept="image/*"
                  maxSize={10 * 1024 * 1024}
                />
              </div>
            )}

            {/* Base64 Output */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Base64 Output:</label>
                <div className="flex gap-2">
                  <button
                    onClick={exportToFile}
                    disabled={!base64}
                    className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                  <button
                    onClick={() => copyToClipboard(base64)}
                    disabled={!base64}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <textarea
                value={base64}
                onChange={(e) => {
                  setBase64(e.target.value)
                  setError('')
                }}
                className="w-full h-40 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-xs"
                placeholder="Base64 string will appear here..."
              />
              {base64 && (
                <p className="text-xs text-gray-500 mt-1">
                  {base64.length} characters, {base64Size} bytes
                  {mode === 'text' && text && (
                    <span className="ml-2">({sizeIncrease}% size increase)</span>
                  )}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Image Preview:</label>
                  <button
                    onClick={downloadImage}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Download Image
                  </button>
                </div>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-w-full h-auto max-h-96 rounded-lg border-2 border-gray-200 mx-auto block" 
                />
              </div>
            )}

            {/* Statistics */}
            {totalOperations > 0 && (
              <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-200">
                Total operations: <span className="font-semibold text-primary-600">{totalOperations}</span>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Base64 Encoding?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. 
                It's commonly used to encode data that needs to be stored or transferred over media designed to 
                deal with text. Base64 encoding converts binary data into a string of 64 characters (A-Z, a-z, 0-9, +, /).
              </p>
              <p className="text-gray-700 leading-relaxed">
                Base64 encoding increases the size of the data by approximately 33%, but it ensures that the data 
                can be safely transmitted through text-based protocols like email, JSON, XML, or URLs. It's widely 
                used in web development, data storage, and API communications.
              </p>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🌐 Web Development</h3>
                <p className="text-gray-700 text-sm">
                  Embed images directly in HTML/CSS using data URIs. Encode API payloads, authentication tokens, 
                  or binary data for JSON transmission.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📧 Email Attachments</h3>
                <p className="text-gray-700 text-sm">
                  Encode binary attachments (images, documents) for email transmission. Many email systems use 
                  Base64 encoding for attachments.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🔐 Data Storage</h3>
                <p className="text-gray-700 text-sm">
                  Store binary data in text-based storage systems like databases, configuration files, or JSON 
                  documents that don't support binary data natively.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🔗 URL Encoding</h3>
                <p className="text-gray-700 text-sm">
                  Use URL-safe Base64 encoding for data in URLs. URL-safe Base64 replaces + with - and / with _ 
                  to avoid URL encoding issues.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Text & Image Support</h3>
                  <p className="text-gray-700 text-sm">
                    Encode and decode both text strings and images. Upload images to get Base64 data URIs, or 
                    decode Base64 back to images.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔗</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">URL-Safe Encoding</h3>
                  <p className="text-gray-700 text-sm">
                    Choose between standard Base64 or URL-safe Base64 encoding. URL-safe format is perfect for 
                    embedding in URLs or query parameters.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Auto-Convert</h3>
                  <p className="text-gray-700 text-sm">
                    Enable auto-convert to automatically encode text as you type or decode Base64 strings. 
                    Real-time conversion for faster workflow.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Size Information</h3>
                  <p className="text-gray-700 text-sm">
                    See character count, byte size, and size increase percentage. Understand the encoding 
                    overhead for your data.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📥</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Export Options</h3>
                  <p className="text-gray-700 text-sm">
                    Copy Base64 strings to clipboard or export to text files. Download decoded images directly 
                    from Base64 data URIs.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Privacy First</h3>
                  <p className="text-gray-700 text-sm">
                    All encoding and decoding happens locally in your browser. We never see, store, or have 
                    access to your data.
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
                <h3 className="font-semibold text-gray-900 mb-2">What's the difference between standard and URL-safe Base64?</h3>
                <p className="text-gray-700 text-sm">
                  Standard Base64 uses + and / characters, which need URL encoding in URLs. URL-safe Base64 
                  replaces + with - and / with _, making it safe to use directly in URLs without additional encoding.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How much does Base64 encoding increase file size?</h3>
                <p className="text-gray-700 text-sm">
                  Base64 encoding increases data size by approximately 33%. This is because every 3 bytes of 
                  binary data becomes 4 Base64 characters. The exact increase depends on the original data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I encode images larger than 10MB?</h3>
                <p className="text-gray-700 text-sm">
                  Our tool limits image uploads to 10MB to ensure good performance. For larger images, consider 
                  compressing them first or using server-side encoding tools.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is Base64 encoding secure?</h3>
                <p className="text-gray-700 text-sm">
                  Base64 is an encoding scheme, not encryption. It doesn't provide security or privacy - it's 
                  just a way to represent binary data as text. Anyone can decode Base64-encoded data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you store my encoded/decoded data?</h3>
                <p className="text-gray-700 text-sm">
                  No, absolutely not. All encoding and decoding happens entirely in your browser. We never see, 
                  store, transmit, or have any access to your data. Your privacy is completely protected.
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

