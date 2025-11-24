'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useHistory } from '@/hooks/useHistory'
import HistoryPanel from '@/components/HistoryPanel'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type UUIDFormat = 'standard' | 'no-dashes' | 'uppercase' | 'braces' | 'brackets'
type UUIDVersion = 'v4' | 'v1' | 'v3' | 'v5'
type Mode = 'generate' | 'validate'

export default function UUIDGeneratorPage() {
  const [uuids, setUuids] = useState<string[]>([])
  const [count, setCount] = useState(1)
  const [version, setVersion] = useState<UUIDVersion>('v4')
  const [format, setFormat] = useState<UUIDFormat>('standard')
  const [mode, setMode] = useState<Mode>('generate')
  const [validateInput, setValidateInput] = useState('')
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    version: string | null
    format: string
    error?: string
  } | null>(null)
  const [v3v5Namespace, setV3V5Namespace] = useState('00000000-0000-0000-0000-000000000000')
  const [v3v5Name, setV3V5Name] = useState('')
  const { history, addToHistory, removeFromHistory, clearHistory } = useHistory<string>('uuid-history', 20)

  // SEO data
  const toolPath = '/uuid-generator'
  const toolName = 'UUID Generator'
  const category = 'generators'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data (from existing FAQ section)
  const faqs = [
    {
      question: "What's the difference between UUID v1 and v4?",
      answer: "UUID v4 uses random numbers and is completely unpredictable, making it ideal for most applications. UUID v1 includes a timestamp and can be sorted chronologically, which is useful for debugging and time-based ordering. Both are unique, but v4 is more commonly used."
    },
    {
      question: "Are UUIDs really unique?",
      answer: "While technically not guaranteed to be unique (the probability of collision is extremely low), UUIDs are designed to be unique for all practical purposes. The chance of generating two identical UUID v4s is approximately 1 in 5.3 × 10³⁶, which is effectively zero for most use cases."
    },
    {
      question: "Can I use UUIDs as database primary keys?",
      answer: "Yes! UUIDs are excellent for primary keys, especially in distributed systems. However, be aware that they take more storage space (16 bytes vs 4-8 bytes for integers) and may have slightly lower performance for indexing compared to sequential integers."
    },
    {
      question: "What format should I use?",
      answer: "The standard format (with hyphens) is most common and recommended. Use \"no dashes\" if your system requires it. Uppercase format is sometimes required by certain databases or systems. Braces and brackets are used in some Microsoft technologies (GUIDs)."
    },
    {
      question: "Do you store the generated UUIDs?",
      answer: "No, absolutely not. All UUID generation happens entirely in your browser using JavaScript. We never see, store, transmit, or have any access to the UUIDs you generate. Your privacy is guaranteed."
    },
    {
      question: "How many UUIDs can I generate at once?",
      answer: "You can generate up to 100 UUIDs in a single batch. If you need more, simply generate another batch. There are no limits on the total number of UUIDs you can generate."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Choose UUID Version",
      text: "Select UUID v4 (random) for most use cases, or UUID v1 (time-based) if you need chronological ordering."
    },
    {
      name: "Select Output Format",
      text: "Choose from standard, no dashes, uppercase, braces, or brackets format depending on your system requirements."
    },
    {
      name: "Set Count",
      text: "Enter the number of UUIDs you want to generate (1-100). Use quick buttons for common counts."
    },
    {
      name: "Generate",
      text: "Click Generate to create your UUIDs. They will appear in the results area below."
    },
    {
      name: "Copy or Export",
      text: "Copy individual UUIDs or all at once. Export to a text file for easy integration into your projects."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Generate UUIDs",
      "Learn how to generate unique identifiers (UUIDs/GUIDs) in multiple formats using our free online UUID generator.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "UUID Generator",
      "Free online UUID and GUID generator. Generate unique identifiers in multiple formats with support for UUID v1 and v4.",
      "https://prylad.pro/uuid-generator",
      "UtilityApplication"
    )
  ]

  // Generate UUID v3 (MD5-based) or v5 (SHA-1-based)
  const generateUUIDv3v5 = useCallback(async (ver: 'v3' | 'v5', namespace: string, name: string): Promise<string> => {
    // Clean namespace UUID
    const cleanNamespace = namespace.replace(/[{}[\]]/g, '').replace(/-/g, '')
    if (cleanNamespace.length !== 32) {
      throw new Error('Invalid namespace UUID')
    }

    // Convert namespace to bytes
    const namespaceBytes = new Uint8Array(16)
    for (let i = 0; i < 16; i++) {
      namespaceBytes[i] = parseInt(cleanNamespace.substr(i * 2, 2), 16)
    }

    // Combine namespace and name
    const combined = new Uint8Array(namespaceBytes.length + name.length)
    combined.set(namespaceBytes)
    combined.set(new TextEncoder().encode(name), namespaceBytes.length)

    // Hash using Web Crypto API
    // Note: Web Crypto doesn't support MD5, so v3 uses SHA-1 as fallback
    const hash = await crypto.subtle.digest('SHA-1', combined)
    const hashBytes = new Uint8Array(hash)
    
    // Set version (3 or 5)
    hashBytes[6] = (hashBytes[6] & 0x0f) | (ver === 'v3' ? 0x30 : 0x50)
    // Set variant (10xxxxxx)
    hashBytes[8] = (hashBytes[8] & 0x3f) | 0x80

    // Convert to UUID string
    const hex = Array.from(hashBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20, 12)}`
  }, [])

  const generateUUIDAsync = useCallback(async (ver: UUIDVersion, namespace?: string, name?: string): Promise<string> => {
    if (ver === 'v3' || ver === 'v5') {
      if (!namespace || !name) {
        throw new Error('Namespace and name are required for v3/v5')
      }
      return await generateUUIDv3v5(ver, namespace, name)
    }

    let uuid: string
    if (ver === 'v4') {
      // RFC 4122 compliant UUID v4
      uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    } else {
      // Simplified v1 (time-based)
      const timestamp = Date.now()
      const random = Math.random().toString(16).substring(2, 14)
      const timeLow = (timestamp & 0xffffffff).toString(16).padStart(8, '0')
      const timeMid = ((timestamp >> 32) & 0xffff).toString(16).padStart(4, '0')
      const timeHigh = ((timestamp >> 48) & 0x0fff).toString(16).padStart(3, '0')
      const clockSeq = (Math.random() * 0x3fff | 0).toString(16).padStart(4, '0')
      const node = random.substring(0, 12)
      uuid = `${timeLow}-${timeMid}-1${timeHigh}-${clockSeq}-${node}`
    }
    return uuid
  }, [generateUUIDv3v5])

  const formatUUID = useCallback((uuid: string, fmt: UUIDFormat): string => {
    switch (fmt) {
      case 'no-dashes':
        return uuid.replace(/-/g, '')
      case 'uppercase':
        return uuid.toUpperCase()
      case 'braces':
        return `{${uuid}}`
      case 'brackets':
        return `[${uuid}]`
      case 'standard':
      default:
        return uuid
    }
  }, [])

  const generate = useCallback(async () => {
    try {
      const newUuids: string[] = []
      
      if (version === 'v3' || version === 'v5') {
        if (!v3v5Name.trim()) {
          setValidationResult({
            isValid: false,
            version: null,
            format: 'error',
            error: 'Name is required for v3/v5 UUID generation'
          })
          return
        }
        if (!validateUUID(v3v5Namespace.replace(/[{}[\]]/g, ''))) {
          setValidationResult({
            isValid: false,
            version: null,
            format: 'error',
            error: 'Invalid namespace UUID'
          })
          return
        }
        
        // Generate single UUID for v3/v5 (they're deterministic)
        const uuid = await generateUUIDAsync(version, v3v5Namespace, v3v5Name)
        newUuids.push(formatUUID(uuid, format))
      } else {
        // Generate multiple UUIDs for v1/v4
        for (let i = 0; i < count; i++) {
          const uuid = await generateUUIDAsync(version)
          newUuids.push(formatUUID(uuid, format))
        }
      }
      
      setUuids(newUuids)
      setValidationResult(null)
      
      // Add to history
      newUuids.forEach(uuid => {
        addToHistory(uuid, `${version.toUpperCase()} - ${format}`)
      })
      } catch (error) {
      setValidationResult({
        isValid: false,
        version: null,
        format: 'error',
        error: error instanceof Error ? error.message : 'Generation failed'
      })
    }
  }, [count, version, format, v3v5Namespace, v3v5Name, generateUUIDAsync, formatUUID, addToHistory])

  const selectFromHistory = useCallback((uuid: string) => {
    setUuids([uuid])
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Failed to copy
    }
  }

  const copyAll = async () => {
    if (uuids.length === 0) return
    try {
      await navigator.clipboard.writeText(uuids.join('\n'))
    } catch (err) {
      // Failed to copy
    }
  }

  const exportToFile = () => {
    if (uuids.length === 0) return
    
    const content = uuids.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `uuids-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const validateUUID = (uuid: string): boolean => {
    // Remove braces/brackets for validation
    const clean = uuid.replace(/[{}[\]]/g, '')
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return regex.test(clean)
  }

  // Extract UUID version from string
  const getUUIDVersion = (uuid: string): string | null => {
    const clean = uuid.replace(/[{}[\]]/g, '')
    if (!validateUUID(clean)) return null
    
    const parts = clean.split('-')
    if (parts.length !== 5) return null
    
    const versionChar = parts[2]?.[0]
    if (!versionChar) return null
    
    const version = parseInt(versionChar, 16)
    if (version >= 1 && version <= 5) {
      return `v${version}`
    }
    return null
  }

  // Validate UUID with detailed information
  const performValidation = useCallback(() => {
    if (!validateInput.trim()) {
      setValidationResult(null)
      return
    }

    const clean = validateInput.replace(/[{}[\]]/g, '').trim()
    
    if (!validateUUID(clean)) {
      setValidationResult({
        isValid: false,
        version: null,
        format: 'invalid',
        error: 'Invalid UUID format. Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
      })
      return
    }

    const detectedVersion = getUUIDVersion(clean)
    const hasBraces = validateInput.includes('{') && validateInput.includes('}')
    const hasBrackets = validateInput.includes('[') && validateInput.includes(']')
    const isUppercase = clean === clean.toUpperCase()
    const hasDashes = clean.includes('-')

    let formatType = 'standard'
    if (hasBraces) formatType = 'braces'
    else if (hasBrackets) formatType = 'brackets'
    else if (!hasDashes) formatType = 'no-dashes'
    else if (isUppercase) formatType = 'uppercase'

    setValidationResult({
      isValid: true,
      version: detectedVersion,
      format: formatType,
    })
  }, [validateInput])

  useEffect(() => {
    if (mode === 'validate') {
      performValidation()
    }
  }, [mode, validateInput, performValidation])


  // Keyboard shortcuts
  useKeyboardShortcuts({
    onEnter: () => generate(),
    onSave: () => exportToFile(),
    onClear: () => {
      setUuids([])
    }
  })

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      count,
      version,
      format
    }
    localStorage.setItem('uuidGeneratorSettings', JSON.stringify(settings))
  }, [count, version, format])

  // Load settings from localStorage on mount and generate
  useEffect(() => {
    const saved = localStorage.getItem('uuidGeneratorSettings')
    let loadedCount = 1
    let loadedVersion: UUIDVersion = 'v4'
    let loadedFormat: UUIDFormat = 'standard'
    
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        loadedCount = settings.count || 1
        loadedVersion = settings.version || 'v4'
        loadedFormat = settings.format || 'standard'
        setCount(loadedCount)
        setVersion(loadedVersion)
        setFormat(loadedFormat)
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    // Auto-generate on mount with loaded/default settings (only for v1/v4)
    if (loadedVersion === 'v1' || loadedVersion === 'v4') {
      const generateInitial = async () => {
        try {
          const newUuids: string[] = []
          for (let i = 0; i < loadedCount; i++) {
            const uuid = await generateUUIDAsync(loadedVersion)
            newUuids.push(formatUUID(uuid, loadedFormat))
          }
          setUuids(newUuids)
        } catch (e) {
          // Ignore errors on auto-generate
        }
      }
      generateInitial()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🆔 UUID/GUID Generator & Validator"
        description="Generate and validate UUIDs/GUIDs in multiple formats. Support for UUID v1 (time-based), v3 (MD5), v4 (random), and v5 (SHA-1). Free online UUID generator with validation and export options."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">Mode:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMode('generate')
                    setValidationResult(null)
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'generate'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Generate UUID
                </button>
                <button
                  onClick={() => {
                    setMode('validate')
                    setUuids([])
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'validate'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Validate UUID
                </button>
              </div>
            </div>

            {/* Validate Mode */}
            {mode === 'validate' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Enter UUID to Validate:
                  </label>
                  <textarea
                    value={validateInput}
                    onChange={(e) => setValidateInput(e.target.value)}
                    placeholder="Paste UUID here (e.g., 550e8400-e29b-41d4-a716-446655440000)"
                    className="w-full h-24 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {validationResult && (
                  <div className={`p-4 rounded-lg border-2 ${
                    validationResult.isValid
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {validationResult.isValid ? (
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={`font-semibold ${
                        validationResult.isValid
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {validationResult.isValid ? 'Valid UUID' : 'Invalid UUID'}
                      </span>
                    </div>
                    {validationResult.isValid && (
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Version: </span>
                          <span className="text-gray-900 dark:text-gray-100">{validationResult.version || 'Unknown'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Format: </span>
                          <span className="text-gray-900 dark:text-gray-100">{validationResult.format}</span>
                        </div>
                      </div>
                    )}
                    {validationResult.error && (
                      <p className="text-sm text-red-700 dark:text-red-300 mt-2">{validationResult.error}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Generate Mode */}
            {mode === 'generate' && (
              <>
            {/* Version Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">UUID Version:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => setVersion('v4')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    version === 'v4'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  v4 (Random)
                </button>
                <button
                  onClick={() => setVersion('v1')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    version === 'v1'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  v1 (Time-based)
                </button>
                <button
                  onClick={() => setVersion('v3')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    version === 'v3'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  v3 (MD5)
                </button>
                <button
                  onClick={() => setVersion('v5')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    version === 'v5'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  v5 (SHA-1)
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {version === 'v4' 
                  ? 'Random UUIDs - best for most use cases, completely unpredictable'
                  : version === 'v1'
                  ? 'Time-based UUIDs - include timestamp, useful for sorting and debugging'
                  : version === 'v3'
                  ? 'MD5-based UUIDs - deterministic, requires namespace and name'
                  : 'SHA-1-based UUIDs - deterministic, requires namespace and name'}
              </p>
            </div>

            {/* v3/v5 Namespace and Name */}
            {(version === 'v3' || version === 'v5') && (
              <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Namespace UUID:
                  </label>
                  <input
                    type="text"
                    value={v3v5Namespace}
                    onChange={(e) => setV3V5Namespace(e.target.value)}
                    placeholder="00000000-0000-0000-0000-000000000000"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setV3V5Namespace('00000000-0000-0000-0000-000000000000')}
                      className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      DNS
                    </button>
                    <button
                      onClick={() => setV3V5Namespace('6ba7b810-9dad-11d1-80b4-00c04fd430c8')}
                      className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      URL
                    </button>
                    <button
                      onClick={() => setV3V5Namespace('6ba7b811-9dad-11d1-80b4-00c04fd430c8')}
                      className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      OID
                    </button>
                    <button
                      onClick={() => setV3V5Namespace('6ba7b812-9dad-11d1-80b4-00c04fd430c8')}
                      className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      X.500
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Standard namespaces: DNS, URL, OID, X.500 DN
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Name:
                  </label>
                  <input
                    type="text"
                    value={v3v5Name}
                    onChange={(e) => setV3V5Name(e.target.value)}
                    placeholder="Enter name (e.g., example.com, /path/to/resource)"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    The name to generate UUID from (e.g., domain name, URL path, object identifier)
                  </p>
                </div>
              </div>
            )}

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Output Format:</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <button
                  onClick={() => setFormat('standard')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    format === 'standard'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setFormat('no-dashes')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    format === 'no-dashes'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  No Dashes
                </button>
                <button
                  onClick={() => setFormat('uppercase')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    format === 'uppercase'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Uppercase
                </button>
                <button
                  onClick={() => setFormat('braces')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    format === 'braces'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {`{Braces}`}
                </button>
                <button
                  onClick={() => setFormat('brackets')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    format === 'brackets'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  [Brackets]
                </button>
              </div>
            </div>

            {/* Count Input */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Generate:</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={count}
                  onChange={(e) => setCount(Math.min(10000, Math.max(1, Number(e.target.value))))}
                className="w-32 px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">UUID(s)</span>
              </div>
              {count > 1 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setCount(10)}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded transition-colors"
                  >
                    10
                  </button>
                  <button
                    onClick={() => setCount(50)}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded transition-colors"
                  >
                    50
                  </button>
                  <button
                    onClick={() => setCount(100)}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded transition-colors"
                  >
                    100
                  </button>
                  <button
                    onClick={() => setCount(1000)}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded transition-colors"
                  >
                    1000
                  </button>
                </div>
              )}
            </div>

            {/* Count Input (only for v1/v4) */}
            {(version === 'v1' || version === 'v4') && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Generate:</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={count}
                    onChange={(e) => setCount(Math.min(10000, Math.max(1, Number(e.target.value))))}
                    className="w-32 px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">UUID(s)</span>
                </div>
                {count > 1 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCount(10)}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded transition-colors"
                    >
                      10
                    </button>
                    <button
                      onClick={() => setCount(50)}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded transition-colors"
                    >
                      50
                    </button>
                    <button
                      onClick={() => setCount(100)}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded transition-colors"
                    >
                      100
                    </button>
                    <button
                      onClick={() => setCount(1000)}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded transition-colors"
                    >
                      1000
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generate}
              disabled={(version === 'v3' || version === 'v5') && !v3v5Name.trim()}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate {version === 'v3' || version === 'v5' ? 'UUID' : count > 1 ? `${count} UUIDs` : 'UUID'}
            </button>
              </>
            )}

          </div>
        </div>

        {/* Results */}
        {uuids.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-bold">Generated UUIDs:</h3>
              <div className="flex gap-2">
                <button
                  onClick={exportToFile}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
                <button
                  onClick={copyAll}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  Copy All
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uuids.map((uuid, index) => {
                const isValid = validateUUID(uuid.replace(/[{}[\]]/g, ''))
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <code className="flex-1 font-mono text-sm break-all">{uuid}</code>
                    {isValid && (
                      <span className="text-xs text-green-600 font-medium" title="Valid UUID format">✓</span>
                    )}
                    <button
                      onClick={() => copyToClipboard(uuid)}
                      className="text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors text-lg"
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is a UUID?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                A UUID (Universally Unique Identifier) is a 128-bit identifier that is guaranteed to be unique 
                across time and space. UUIDs are also known as GUIDs (Globally Unique Identifiers) in Microsoft 
                systems. They are standardized by RFC 4122 and are widely used in software development for 
                identifying resources, database records, distributed systems, and more.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                UUIDs are represented as 32 hexadecimal digits, displayed in five groups separated by hyphens: 
                8-4-4-4-12, for a total of 36 characters (32 hex characters + 4 hyphens). For example: 
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">550e8400-e29b-41d4-a716-446655440000</code>
              </p>
            </div>
          </section>

          {/* UUID Versions */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">UUID Versions Explained</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">UUID v4 (Random)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                  UUID v4 uses random or pseudo-random numbers to generate identifiers. This is the most commonly 
                  used version because it provides excellent uniqueness guarantees without requiring coordination 
                  between systems.
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1"><strong>Best for:</strong></p>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
                    <li>Most general-purpose applications</li>
                    <li>When you need unpredictable IDs</li>
                    <li>Distributed systems without coordination</li>
                    <li>Primary keys in databases</li>
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">UUID v1 (Time-based)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                  UUID v1 includes a timestamp and MAC address (or random node ID) in its generation. This makes 
                  UUIDs sortable by creation time and can be useful for debugging and chronological ordering.
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1"><strong>Best for:</strong></p>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
                    <li>When you need chronological ordering</li>
                    <li>Debugging and logging systems</li>
                    <li>Time-sensitive applications</li>
                    <li>When MAC address info is useful</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases for UUIDs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">💾 Database Primary Keys</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  UUIDs are excellent for primary keys in distributed databases where you can&apos;t use auto-incrementing 
                  integers. They prevent collisions when merging data from different sources.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🌐 API Identifiers</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use UUIDs as resource identifiers in REST APIs. They&apos;re opaque, don&apos;t reveal internal structure, 
                  and work well across different systems and services.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📦 File and Session IDs</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Generate unique file names, session tokens, transaction IDs, and other temporary identifiers. 
                  UUIDs ensure no conflicts even in high-concurrency scenarios.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔗 Distributed Systems</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  In microservices and distributed architectures, UUIDs allow different services to generate 
                  identifiers independently without coordination, reducing coupling and improving scalability.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features of Our UUID Generator</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎲</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Multiple Versions</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Generate UUID v1 (time-based) or v4 (random) identifiers. Choose the version that best fits 
                    your use case.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Multiple Formats</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Output UUIDs in standard format, without dashes, uppercase, with braces, or with brackets. 
                    Compatible with various systems and requirements.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Batch Generation</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Generate up to 100 UUIDs at once. Perfect for bulk operations, testing, or when you need 
                    multiple identifiers quickly.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📥</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Export Options</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Copy individual UUIDs or all at once. Export to a text file for easy integration into your 
                    projects or documentation.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Format Validation</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    All generated UUIDs are validated to ensure they conform to RFC 4122 standards. Visual 
                    indicators confirm valid UUID format.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Privacy First</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    All UUID generation happens locally in your browser. We never see, store, or have access 
                    to any generated identifiers.
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
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the difference between UUID v1 and v4?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  UUID v4 uses random numbers and is completely unpredictable, making it ideal for most applications. 
                  UUID v1 includes a timestamp and can be sorted chronologically, which is useful for debugging and 
                  time-based ordering. Both are unique, but v4 is more commonly used.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Are UUIDs really unique?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  While technically not guaranteed to be unique (the probability of collision is extremely low), 
                  UUIDs are designed to be unique for all practical purposes. The chance of generating two identical 
                  UUID v4s is approximately 1 in 5.3 × 10³⁶, which is effectively zero for most use cases.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I use UUIDs as database primary keys?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes! UUIDs are excellent for primary keys, especially in distributed systems. However, be aware 
                  that they take more storage space (16 bytes vs 4-8 bytes for integers) and may have slightly 
                  lower performance for indexing compared to sequential integers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What format should I use?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  The standard format (with hyphens) is most common and recommended. Use &quot;no dashes&quot; if your system 
                  requires it. Uppercase format is sometimes required by certain databases or systems. Braces and 
                  brackets are used in some Microsoft technologies (GUIDs).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Do you store the generated UUIDs?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, absolutely not. All UUID generation happens entirely in your browser using JavaScript. We never 
                  see, store, transmit, or have any access to the UUIDs you generate. Your privacy is guaranteed.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How many UUIDs can I generate at once?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  You can generate up to 100 UUIDs in a single batch. If you need more, simply generate another batch. 
                  There are no limits on the total number of UUIDs you can generate.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* History Panel */}
        <div className="max-w-4xl mx-auto mt-6">
          <HistoryPanel
            history={history}
            onSelect={selectFromHistory}
            onRemove={removeFromHistory}
            onClear={clearHistory}
            formatItem={(uuid) => uuid}
            title="Generated UUIDs"
            maxDisplay={10}
          />
        </div>
      </div>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Generator Tools" />
      )}
    </Layout>
    </>
  )
}

