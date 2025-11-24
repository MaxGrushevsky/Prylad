'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import FileDropZone from '@/components/FileDropZone'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type Mode = 'text' | 'image'
type Format = 'standard' | 'url-safe'
type EncodingType = 'base64' | 'base32' | 'base16'

export default function Base64ConverterPage() {
  const [text, setText] = useState('')
  const [base64, setBase64] = useState('')
  const [mode, setMode] = useState<Mode>('text')
  const [format, setFormat] = useState<Format>('standard')
  const [encodingType, setEncodingType] = useState<EncodingType>('base64')
  const [autoConvert, setAutoConvert] = useState(true)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')
  const [totalOperations, setTotalOperations] = useState(0)
  const [base64Format, setBase64Format] = useState<'data-uri' | 'raw'>('data-uri')
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showExamples, setShowExamples] = useState(false)
  const [autoDetectFormat, setAutoDetectFormat] = useState(true)
  const [detectedFormat, setDetectedFormat] = useState<EncodingType | null>(null)

  // SEO data
  const toolPath = '/base64-converter'
  const toolName = 'Base64 Converter'
  const category = 'converters'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // Show notification helper
  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  // Example Base64 strings
  const examples = {
    text: {
      input: 'Hello, World!',
      base64: 'SGVsbG8sIFdvcmxkIQ==',
      description: 'Simple text encoding example'
    },
    url: {
      input: 'https://example.com/page?q=test',
      base64: 'aHR0cHM6Ly9leGFtcGxlLmNvbS9wYWdlP3E9dGVzdA==',
      description: 'URL encoding example'
    },
    json: {
      input: '{"name":"John","age":30}',
      base64: 'eyJuYW1lIjoiSm9obiIsImFnZSI6MzB9',
      description: 'JSON data encoding example'
    }
  }

  // FAQ data
  const faqs = [
    {
      question: "What's the difference between standard and URL-safe Base64?",
      answer: "Standard Base64 uses + and / characters, which need URL encoding in URLs. URL-safe Base64 replaces + with - and / with _, making it safe to use directly in URLs without additional encoding."
    },
    {
      question: "How much does Base64 encoding increase file size?",
      answer: "Base64 encoding increases data size by approximately 33%. This is because every 3 bytes of binary data becomes 4 Base64 characters. The exact increase depends on the original data."
    },
    {
      question: "Can I encode images larger than 10MB?",
      answer: "Our tool limits image uploads to 10MB to ensure good performance. For larger images, consider compressing them first or using server-side encoding tools."
    },
    {
      question: "Is Base64 encoding secure?",
      answer: "Base64 is an encoding scheme, not encryption. It doesn't provide security or privacy - it's just a way to represent binary data as text. Anyone can decode Base64-encoded data."
    },
    {
      question: "Do you store my encoded/decoded data?",
      answer: "No, absolutely not. All encoding and decoding happens entirely in your browser. We never see, store, transmit, or have any access to your data. Your privacy is completely protected."
    },
    {
      question: "Can I use Base64 for binary files other than images?",
      answer: "Yes! While our tool focuses on text and images, Base64 can encode any binary data. You can encode documents, audio files, or any other binary content using Base64 encoding."
    },
    {
      question: "What is a Data URI and when should I use it?",
      answer: "A Data URI is a Base64-encoded string prefixed with 'data:image/png;base64,'. It's used to embed images directly in HTML or CSS without separate image files. Use Data URI format for web development, or raw Base64 for API payloads."
    },
    {
      question: "How do I decode a Base64 image string?",
      answer: "Paste your Base64 string (with or without Data URI prefix) into the Base64 Output field, then click 'Decode Base64 → Image' button. The tool will automatically detect the format and display the image preview."
    },
    {
      question: "Can I use Base64 in CSS background images?",
      answer: "Yes! Use the Data URI format for CSS. For example: background-image: url('data:image/png;base64,iVBORw0KGgo...'). This eliminates the need for separate image files."
    },
    {
      question: "What characters are used in Base64 encoding?",
      answer: "Base64 uses 64 characters: A-Z (26), a-z (26), 0-9 (10), plus + and / (2). URL-safe Base64 replaces + with - and / with _. Padding uses = characters."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Choose Mode",
      text: "Select Text mode for encoding/decoding text strings, or Image mode for converting images to Base64."
    },
    {
      name: "Enter Your Data",
      text: "For text mode, paste or type your text. For image mode, upload an image file (up to 10MB)."
    },
    {
      name: "Select Format (Text Mode)",
      text: "Choose between Standard Base64 or URL-safe Base64 encoding. URL-safe is better for use in URLs."
    },
    {
      name: "Enable Auto-Convert (Optional)",
      text: "Turn on auto-convert to automatically encode text as you type or decode Base64 strings in real-time."
    },
    {
      name: "Copy or Export",
      text: "Copy the Base64 string to your clipboard or export it to a file. For images, download the decoded image."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Use Base64 Encoder and Decoder",
      "Learn how to encode and decode text and images using Base64 encoding with our free online converter tool.",
      howToSteps,
      "PT3M"
    ),
    generateSoftwareApplicationSchema(
      "Base64 Converter",
      "Free online Base64 encoder and decoder. Encode text and images to Base64 format with support for standard and URL-safe encoding.",
      "https://prylad.pro/base64-converter",
      "UtilityApplication"
    )
  ]
  // Base32 encoding/decoding
  const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const base32Pad = '='

  const encodeBase32 = useCallback((input: string): string => {
    const bytes = new TextEncoder().encode(input)
    let bits = 0
    let value = 0
    let output = ''

    for (let i = 0; i < bytes.length; i++) {
      value = (value << 8) | bytes[i]
      bits += 8

      while (bits >= 5) {
        output += base32Alphabet[(value >>> (bits - 5)) & 31]
        bits -= 5
      }
    }

    if (bits > 0) {
      output += base32Alphabet[(value << (5 - bits)) & 31]
    }

    while (output.length % 8) {
      output += base32Pad
    }

    return output
  }, [])

  const decodeBase32 = useCallback((input: string): string => {
    const cleaned = input.toUpperCase().replace(/[^A-Z2-7]/g, '').replace(/=+$/, '')
    const bytes: number[] = []
    let bits = 0
    let value = 0

    for (let i = 0; i < cleaned.length; i++) {
      const index = base32Alphabet.indexOf(cleaned[i])
      if (index === -1) continue

      value = (value << 5) | index
      bits += 5

      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 255)
        bits -= 8
      }
    }

    return new TextDecoder().decode(new Uint8Array(bytes))
  }, [])

  // Base16 (HEX) encoding/decoding
  const encodeBase16 = useCallback((input: string): string => {
    const bytes = new TextEncoder().encode(input)
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join('')
  }, [])

  const decodeBase16 = useCallback((input: string): string => {
    const cleaned = input.replace(/[^0-9A-Fa-f]/g, '')
    if (cleaned.length % 2 !== 0) {
      throw new Error('Invalid Base16 string: odd length')
    }
    const bytes = new Uint8Array(cleaned.length / 2)
    for (let i = 0; i < cleaned.length; i += 2) {
      bytes[i / 2] = parseInt(cleaned.substr(i, 2), 16)
    }
    return new TextDecoder().decode(bytes)
  }, [])

  const encodeText = useCallback((input: string, fmt: Format, encType: EncodingType): string => {
    try {
      if (encType === 'base32') {
        return encodeBase32(input)
      } else if (encType === 'base16') {
        return encodeBase16(input)
      } else {
        // Base64
        const encoded = btoa(unescape(encodeURIComponent(input)))
        if (fmt === 'url-safe') {
          return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        }
        return encoded
      }
    } catch (e) {
      throw new Error('Encoding failed')
    }
  }, [encodeBase32, encodeBase16])

  const decodeText = useCallback((input: string, fmt: Format, encType: EncodingType): string => {
    try {
      if (encType === 'base32') {
        return decodeBase32(input)
      } else if (encType === 'base16') {
        return decodeBase16(input)
      } else {
        // Base64
        let cleaned = input.trim()
        if (fmt === 'url-safe') {
          cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/')
          // Add padding if needed
          while (cleaned.length % 4) {
            cleaned += '='
          }
        }
        return decodeURIComponent(escape(atob(cleaned)))
      }
    } catch (e) {
      throw new Error(`Invalid ${encType.toUpperCase()} string`)
    }
  }, [decodeBase32, decodeBase16])

  const encode = useCallback(() => {
    setError('')
    if (mode === 'text' && text) {
      try {
        const encoded = encodeText(text, format, encodingType)
        setBase64(encoded)
        setTotalOperations(prev => prev + 1)
        if (!autoConvert) {
          const typeName = encodingType === 'base64' ? 'Base64' : encodingType === 'base32' ? 'Base32' : 'Base16'
          showNotification(`Text encoded to ${typeName} successfully!`, 'success')
        }
      } catch (e) {
        setError('Encoding failed. Please check your input.')
      }
    }
  }, [text, mode, format, encodingType, encodeText, autoConvert, showNotification])

  const decode = useCallback(() => {
    setError('')
    if (mode === 'text' && base64) {
      try {
        const decoded = decodeText(base64, format, encodingType)
        setText(decoded)
        setTotalOperations(prev => prev + 1)
        if (!autoConvert) {
          const typeName = encodingType === 'base64' ? 'Base64' : encodingType === 'base32' ? 'Base32' : 'Base16'
          showNotification(`${typeName} decoded to text successfully!`, 'success')
        }
      } catch (e) {
        const typeName = encodingType === 'base64' ? 'Base64' : encodingType === 'base32' ? 'Base32' : 'Base16'
        setError(`Decoding failed. Invalid ${typeName} string.`)
      }
    }
  }, [base64, mode, format, encodingType, decodeText, autoConvert, showNotification])

  // Auto-convert on text change
  useEffect(() => {
    if (autoConvert && mode === 'text' && text) {
      const timer = setTimeout(() => {
        encode()
      }, 300)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoConvert, mode, format, encodingType])

  // Auto-detect encoding format
  const detectEncodingFormat = useCallback((input: string): EncodingType | null => {
    if (!input.trim()) return null
    
    const clean = input.trim().replace(/[{}[\]]/g, '')
    
    // Check for Base64 (standard or URL-safe)
    const base64Regex = /^[A-Za-z0-9+/=_-]+$/
    if (base64Regex.test(clean)) {
      // Base64 typically has padding (=) or URL-safe characters (-, _)
      if (clean.includes('=') || clean.includes('-') || clean.includes('_')) {
        return 'base64'
      }
      // If length is multiple of 4 and contains + or /, likely Base64
      if (clean.length % 4 === 0 && (clean.includes('+') || clean.includes('/'))) {
        return 'base64'
      }
    }
    
    // Check for Base32 (A-Z, 2-7, with optional padding)
    const base32Regex = /^[A-Z2-7=]+$/i
    if (base32Regex.test(clean) && clean.length % 8 === 0) {
      return 'base32'
    }
    
    // Check for Base16/HEX (0-9, A-F, even length)
    const base16Regex = /^[0-9A-Fa-f]+$/
    if (base16Regex.test(clean) && clean.length % 2 === 0) {
      return 'base16'
    }
    
    return null
  }, [])

  // Auto-detect format when base64 changes
  useEffect(() => {
    if (autoDetectFormat && mode === 'text' && base64) {
      const detected = detectEncodingFormat(base64)
      if (detected && detected !== encodingType) {
        setDetectedFormat(detected)
        // Auto-switch if format is different
        if (autoConvert) {
          setEncodingType(detected)
          showNotification(`Auto-detected format: ${detected.toUpperCase()}`, 'success')
        }
      } else {
        setDetectedFormat(null)
      }
    }
  }, [base64, autoDetectFormat, mode, encodingType, detectEncodingFormat, autoConvert, showNotification])

  // Auto-decode on base64 change
  useEffect(() => {
    if (autoConvert && mode === 'text' && base64 && !text) {
      const timer = setTimeout(() => {
        decode()
      }, 300)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base64, autoConvert, mode, format, encodingType])

  const handleImageUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      const dataUri = result
      setImagePreview(dataUri)
      
      // Extract base64 part based on format preference
      if (base64Format === 'raw') {
        // Remove data URI prefix (e.g., "data:image/png;base64,")
        const base64Part = dataUri.split(',')[1] || dataUri
        setBase64(base64Part)
      } else {
        setBase64(dataUri)
      }
      setTotalOperations(prev => prev + 1)
      showNotification('Image encoded to Base64 successfully!', 'success')
    }
    reader.onerror = () => {
      setError('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  const decodeBase64ToImage = useCallback(() => {
    setError('')
    if (!base64) {
      setError('Please enter a Base64 string')
      return
    }
    
    try {
      let base64String = base64.trim()
      
      // Remove data URI prefix if present
      if (base64String.includes(',')) {
        base64String = base64String.split(',')[1]
      }
      
      // Detect and handle URL-safe format (contains - or _)
      const isUrlSafe = base64String.includes('-') || base64String.includes('_')
      if (isUrlSafe) {
        base64String = base64String.replace(/-/g, '+').replace(/_/g, '/')
      }
      
      // Add padding if needed
      while (base64String.length % 4) {
        base64String += '='
      }
      
      // Validate base64
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
      if (!base64Regex.test(base64String)) {
        throw new Error('Invalid Base64 string')
      }
      
      // Try to decode and create image
      const dataUri = `data:image/png;base64,${base64String}`
      
      // Test if it's a valid image by creating an Image object
      const img = new Image()
      img.onload = () => {
        setImagePreview(dataUri)
        setBase64(base64Format === 'data-uri' ? dataUri : base64String)
        setTotalOperations(prev => prev + 1)
        showNotification('Base64 decoded to image successfully!', 'success')
      }
      img.onerror = () => {
        throw new Error('Base64 string does not represent a valid image')
      }
      img.src = dataUri
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to decode Base64 to image')
    }
  }, [base64, base64Format])

  const downloadImage = () => {
    if (!imagePreview) return
    const link = document.createElement('a')
    link.href = imagePreview
    link.download = `decoded-image-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotification('Image downloaded successfully!', 'success')
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showNotification('Copied to clipboard!', 'success')
    } catch (err) {
      showNotification('Failed to copy to clipboard', 'error')
    }
  }

  const loadExample = (example: keyof typeof examples) => {
    if (mode === 'text') {
      setText(examples[example].input)
      setBase64(examples[example].base64)
      showNotification(`Loaded example: ${examples[example].description}`, 'success')
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
    showNotification('File exported successfully!', 'success')
  }

  const clearAll = () => {
    setText('')
    setBase64('')
    setImagePreview('')
    setError('')
    if (mode === 'image') {
      setBase64Format('data-uri')
    }
  }

  const textSize = new Blob([text]).size
  const base64Size = new Blob([base64]).size
  const sizeIncrease = text ? ((base64Size / textSize - 1) * 100).toFixed(1) : '0'

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="📦 Base64/Base32/Base16 Encoder/Decoder - Free Online Converter"
        description="Free online Base64, Base32, and Base16 (HEX) encoder and decoder. Convert text and images to multiple encoding formats instantly. Support for standard and URL-safe Base64, Data URI format, auto-convert, image preview, and more. 100% client-side processing."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto">
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Mode:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMode('text')
                    setImagePreview('')
                    setError('')
                    setBase64Format('data-uri')
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'text'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => {
                    setMode('image')
                    setText('')
                    setBase64('')
                    setImagePreview('')
                    setError('')
                    setBase64Format('data-uri')
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'image'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Image
                </button>
              </div>
            </div>

            {/* Encoding Type Selection (for text mode) */}
            {mode === 'text' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Encoding Type:</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoDetectFormat}
                      onChange={(e) => setAutoDetectFormat(e.target.checked)}
                      className="w-4 h-4 accent-primary-600"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Auto-detect</span>
                  </label>
                </div>
                {detectedFormat && autoDetectFormat && detectedFormat !== encodingType && (
                  <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                    💡 Detected format: <strong>{detectedFormat.toUpperCase()}</strong>. Click to switch.
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    onClick={() => {
                      setEncodingType('base64')
                      setFormat('standard')
                    }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      encodingType === 'base64'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Base64
                  </button>
                  <button
                    onClick={() => {
                      setEncodingType('base32')
                      setFormat('standard')
                    }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      encodingType === 'base32'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Base32
                  </button>
                  <button
                    onClick={() => {
                      setEncodingType('base16')
                      setFormat('standard')
                    }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      encodingType === 'base16'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Base16 (HEX)
                  </button>
                </div>
                
                {/* Base64 Format Selection (only for Base64) */}
                {encodingType === 'base64' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Base64 Format:</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFormat('standard')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          format === 'standard'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Standard
                      </button>
                      <button
                        onClick={() => setFormat('url-safe')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          format === 'url-safe'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        URL-Safe
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      URL-Safe replaces + with - and / with _ for use in URLs
                    </p>
                  </div>
                )}
                
                {encodingType === 'base32' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Base32 uses A-Z and 2-7 characters. More compact than Base16, less compact than Base64.
                  </p>
                )}
                
                {encodingType === 'base16' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Base16 (HEX) uses 0-9 and A-F characters. Most compact representation, but larger output size.
                  </p>
                )}
              </div>
            )}

            {/* Text Mode */}
            {mode === 'text' && (
              <>
                {/* Examples Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300">Quick Examples:</label>
                    <button
                      onClick={() => setShowExamples(!showExamples)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {showExamples ? 'Hide' : 'Show'} Examples
                    </button>
                  </div>
                  {showExamples && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                      {Object.entries(examples).map(([key, example]) => (
                        <button
                          key={key}
                          onClick={() => loadExample(key as keyof typeof examples)}
                          className="text-left p-2 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">{key.toUpperCase()}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{example.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Text Input:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="auto-convert"
                        checked={autoConvert}
                        onChange={(e) => setAutoConvert(e.target.checked)}
                        className="w-4 h-4 accent-primary-600"
                      />
                      <label htmlFor="auto-convert" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
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
                    className="w-full h-40 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Enter text to encode...&#10;&#10;Tip: Try our quick examples above or paste any text here. The Base64 output will appear automatically if auto-convert is enabled."
                  />
                  {text && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {text.length} characters, {textSize} bytes
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={encode}
                    disabled={!text}
                    className="flex-1 bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    title="Encode text to Base64"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Encode → {encodingType === 'base64' ? 'Base64' : encodingType === 'base32' ? 'Base32' : 'Base16'}
                  </button>
                  <button
                    onClick={decode}
                    disabled={!base64}
                    className="flex-1 bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    title="Decode Base64 to text"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    Decode ← {encodingType === 'base64' ? 'Base64' : encodingType === 'base32' ? 'Base32' : 'Base16'}
                  </button>
                  <button
                    onClick={clearAll}
                    className="bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    title="Clear all fields"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                </div>
              </>
            )}

            {/* Image Mode */}
            {mode === 'image' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload Image:</label>
                  <FileDropZone
                    onFileSelect={handleImageUpload}
                    accept="image/*"
                    maxSize={10 * 1024 * 1024}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Base64 Format:</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setBase64Format('data-uri')
                        if (base64 && imagePreview) {
                          setBase64(imagePreview)
                        }
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        base64Format === 'data-uri'
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Data URI
                    </button>
                    <button
                      onClick={() => {
                        setBase64Format('raw')
                        if (base64 && base64.includes(',')) {
                          const rawBase64 = base64.split(',')[1]
                          setBase64(rawBase64)
                        }
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        base64Format === 'raw'
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Raw Base64
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Data URI includes prefix (data:image/...), Raw is Base64 only
                  </p>
                </div>
                
                <div>
                  <button
                    onClick={decodeBase64ToImage}
                    disabled={!base64}
                    className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    title="Decode Base64 string to image"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Decode Base64 → Image
                  </button>
                </div>
              </>
            )}

            {/* Base64 Output */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {encodingType === 'base64' ? 'Base64' : encodingType === 'base32' ? 'Base32' : 'Base16'} Output:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={exportToFile}
                    disabled={!base64}
                    className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    title="Export Base64 string to text file"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                  <button
                    onClick={() => copyToClipboard(base64)}
                    disabled={!base64}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    title="Copy Base64 string to clipboard"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
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
                className="w-full h-40 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder={mode === 'image' 
                  ? "Base64 string will appear here after uploading an image...\n\nOr paste a Base64 string here and click 'Decode Base64 → Image' to convert it back to an image."
                  : `${encodingType === 'base64' ? 'Base64' : encodingType === 'base32' ? 'Base32' : 'Base16'} string will appear here...\n\nTip: You can also paste a ${encodingType === 'base64' ? 'Base64' : encodingType === 'base32' ? 'Base32' : 'Base16'} string here to decode it back to text.`}
              />
              {base64 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {base64.length} characters, {base64Size} bytes
                  {mode === 'text' && text && (
                    <span className="ml-2">({sizeIncrease}% size increase)</span>
                  )}
                  {mode === 'image' && imagePreview && (
                    <span className="ml-2">
                      ({Math.round((base64Size / 1024) * 100) / 100} KB)
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Image Preview:</label>
                  <button
                    onClick={downloadImage}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                    title="Download the decoded image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Image
                  </button>
                </div>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-w-full h-auto max-h-96 rounded-lg border-2 border-gray-200 dark:border-gray-700 mx-auto block bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" 
                />
              </div>
            )}

            {/* Statistics */}
            {totalOperations > 0 && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                Total operations: <span className="font-semibold text-primary-600">{totalOperations}</span>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is Base64 Encoding?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. 
                It&apos;s commonly used to encode data that needs to be stored or transferred over media designed to 
                deal with text. Base64 encoding converts binary data into a string of 64 characters (A-Z, a-z, 0-9, +, /).
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Base64 encoding increases the size of the data by approximately 33%, but it ensures that the data 
                can be safely transmitted through text-based protocols like email, JSON, XML, or URLs. It&apos;s widely 
                used in web development, data storage, and API communications.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our free online Base64 converter supports both text and image encoding/decoding, with options for 
                standard Base64, URL-safe Base64, and Data URI formats. All processing happens entirely in your browser 
                for maximum privacy and security.
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How Base64 Encoding Works</h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Base64 encoding works by converting binary data into a text representation using a 64-character alphabet. 
                The process involves:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Binary to 6-bit chunks:</strong> The input data is divided into 6-bit chunks (since 2^6 = 64)</li>
                <li><strong>Character mapping:</strong> Each 6-bit chunk is mapped to one of 64 characters (A-Z, a-z, 0-9, +, /)</li>
                <li><strong>Padding:</strong> If the input length isn&apos;t divisible by 3, padding characters (=) are added</li>
                <li><strong>Output:</strong> The result is a Base64-encoded string that can be safely transmitted as text</li>
              </ol>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                Decoding reverses this process, converting the Base64 string back to its original binary or text format.
              </p>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🌐 Web Development</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Embed images directly in HTML/CSS using data URIs. Encode API payloads, authentication tokens, 
                  or binary data for JSON transmission.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📧 Email Attachments</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Encode binary attachments (images, documents) for email transmission. Many email systems use 
                  Base64 encoding for attachments.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔐 Data Storage</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Store binary data in text-based storage systems like databases, configuration files, or JSON 
                  documents that don&apos;t support binary data natively.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔗 URL Encoding</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use URL-safe Base64 encoding for data in URLs. URL-safe Base64 replaces + with - and / with _ 
                  to avoid URL encoding issues.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📱 API Development</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Encode binary data, authentication tokens, or payloads for API requests. Base64 is commonly used 
                  in REST APIs and GraphQL for transmitting binary data in JSON format.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🖼️ Inline Images</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Embed images directly in HTML or CSS using Data URIs. This eliminates HTTP requests for small images 
                  and improves page load performance for critical assets.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Text & Image Support</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Encode and decode both text strings and images. Upload images to get Base64 data URIs or raw Base64 strings. 
                    Decode Base64 strings back to images with automatic format detection.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔗</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">URL-Safe Encoding</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Choose between standard Base64 or URL-safe Base64 encoding. URL-safe format is perfect for 
                    embedding in URLs or query parameters.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Auto-Convert</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Enable auto-convert to automatically encode text as you type or decode Base64 strings. 
                    Real-time conversion for faster workflow.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Size Information</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    See character count, byte size, and size increase percentage. Understand the encoding 
                    overhead for your data.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📥</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Export Options</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Copy Base64 strings to clipboard or export to text files. Download decoded images directly 
                    from Base64 data URIs. Choose between Data URI format (with prefix) or raw Base64 strings.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Privacy First</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    All encoding and decoding happens locally in your browser. We never see, store, or have 
                    access to your data.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the difference between standard and URL-safe Base64?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Standard Base64 uses + and / characters, which need URL encoding in URLs. URL-safe Base64 
                  replaces + with - and / with _, making it safe to use directly in URLs without additional encoding.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How much does Base64 encoding increase file size?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Base64 encoding increases data size by approximately 33%. This is because every 3 bytes of 
                  binary data becomes 4 Base64 characters. The exact increase depends on the original data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I encode images larger than 10MB?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our tool limits image uploads to 10MB to ensure good performance. For larger images, consider 
                  compressing them first or using server-side encoding tools.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Is Base64 encoding secure?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Base64 is an encoding scheme, not encryption. It doesn&apos;t provide security or privacy - it&apos;s 
                  just a way to represent binary data as text. Anyone can decode Base64-encoded data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Do you store my encoded/decoded data?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, absolutely not. All encoding and decoding happens entirely in your browser. We never see, 
                  store, transmit, or have any access to your data. Your privacy is completely protected.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What is a Data URI and when should I use it?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  A Data URI is a Base64-encoded string prefixed with &apos;data:image/png;base64,&apos;. It&apos;s used to embed images 
                  directly in HTML or CSS without separate image files. Use Data URI format for web development, or raw Base64 for API payloads.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How do I decode a Base64 image string?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Paste your Base64 string (with or without Data URI prefix) into the Base64 Output field, then click 
                  &apos;Decode Base64 → Image&apos; button. The tool will automatically detect the format and display the image preview.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I use Base64 in CSS background images?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes! Use the Data URI format for CSS. For example: background-image: url(&apos;data:image/png;base64,iVBORw0KGgo...&apos;). 
                  This eliminates the need for separate image files.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What characters are used in Base64 encoding?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Base64 uses 64 characters: A-Z (26), a-z (26), 0-9 (10), plus + and / (2). URL-safe Base64 replaces + with - 
                  and / with _. Padding uses = characters.
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

