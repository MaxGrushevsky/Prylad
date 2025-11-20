'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'

type Tab = 'encoder' | 'parser' | 'query'

// Utility function - вынесено наружу для оптимизации
const isEncoded = (text: string): boolean => {
  try {
    const decoded = decodeURIComponent(text)
    return decoded !== text && text.includes('%')
  } catch {
    return false
  }
}

// URL Encoder/Decoder types
interface EncoderStats {
  originalLength: number
  encodedLength: number
  encodedPercent: number
}

// URL Parser types
interface ParsedURL {
  href: string
  protocol: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  origin: string
  host: string
  username: string
  password: string
  queryParams: Array<{ key: string; value: string }>
  isValid: boolean
  error?: string
}

// Query String Builder types
interface QueryParam {
  key: string
  value: string
  id: string
}

export default function URLToolsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('encoder')

  // Check URL hash for tab switching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash === '#parser') {
        setActiveTab('parser')
      } else if (hash === '#query') {
        setActiveTab('query')
      } else if (hash === '#encoder') {
        setActiveTab('encoder')
      } else {
        setActiveTab('encoder')
      }
    }
  }, [])

  // Update URL hash when tab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = activeTab === 'encoder' ? '' : activeTab === 'parser' ? '#parser' : '#query'
      if (window.location.hash !== hash) {
        window.history.replaceState(null, '', hash || window.location.pathname)
      }
    }
  }, [activeTab])

  // ========== URL ENCODER/DECODER STATE ==========
  const [input, setInput] = useState('')
  const [encoded, setEncoded] = useState('')
  const [decoded, setDecoded] = useState('')
  const [encodingType, setEncodingType] = useState<'component' | 'uri'>('component')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<'encoded' | 'decoded' | null>(null)
  const [stats, setStats] = useState<EncoderStats>({ originalLength: 0, encodedLength: 0, encodedPercent: 0 })

  // ========== URL PARSER STATE ==========
  const [parseInput, setParseInput] = useState('')
  const [parsed, setParsed] = useState<ParsedURL | null>(null)
  const [parseError, setParseError] = useState('')
  const [parseCopied, setParseCopied] = useState<string | null>(null)
  const [autoParse, setAutoParse] = useState(true)

  // ========== QUERY STRING BUILDER STATE ==========
  const [baseUrl, setBaseUrl] = useState('https://example.com')
  const [params, setParams] = useState<QueryParam[]>([
    { key: 'page', value: '1', id: '1' },
    { key: 'sort', value: 'name', id: '2' },
  ])
  const [queryString, setQueryString] = useState('')
  const [fullUrl, setFullUrl] = useState('')
  const [parseQueryInput, setParseQueryInput] = useState('')
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [totalOperations, setTotalOperations] = useState(0)

  // ========== URL ENCODER/DECODER FUNCTIONS ==========

  const encode = useCallback(() => {
    if (!input.trim()) {
      setEncoded('')
      setError('')
      return
    }

    try {
      setError('')
      let result = ''
      if (encodingType === 'component') {
        result = encodeURIComponent(input)
      } else {
        result = encodeURI(input)
      }
      setEncoded(result)
      setDecoded('')
      setStats({
        originalLength: input.length,
        encodedLength: result.length,
        encodedPercent: Math.round((result.length / input.length) * 100)
      })
    } catch (e) {
      setError('Encoding error occurred')
      setEncoded('')
    }
  }, [input, encodingType])

  const decode = useCallback(() => {
    if (!input.trim()) {
      setDecoded('')
      setError('')
      return
    }

    try {
      setError('')
      const result = decodeURIComponent(input)
      setDecoded(result)
      setEncoded('')
      setStats({
        originalLength: input.length,
        encodedLength: result.length,
        encodedPercent: Math.round((result.length / input.length) * 100)
      })
    } catch (e) {
      setError('Decoding error: Invalid encoded URL format')
      setDecoded('')
    }
  }, [input])

  const autoProcess = useCallback(() => {
    if (!input.trim()) return
    
    if (isEncoded(input)) {
      decode()
    } else {
      encode()
    }
  }, [input, encode, decode])

  const copyToClipboard = useCallback(async (text: string, type: 'encoded' | 'decoded') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (e) {
      setError('Failed to copy to clipboard')
    }
  }, [])

  // ========== URL PARSER FUNCTIONS ==========
  const parseURL = useCallback((urlString: string): ParsedURL | null => {
    if (!urlString.trim()) {
      return null
    }

    try {
      let urlToParse = urlString.trim()
      if (!urlToParse.match(/^[a-zA-Z][a-zA-Z\d+\-.]*:/)) {
        urlToParse = 'https://' + urlToParse
      }

      const url = new URL(urlToParse)
      
      const queryParams: Array<{ key: string; value: string }> = []
      url.searchParams.forEach((value, key) => {
        queryParams.push({ key, value })
      })

      return {
        href: url.href,
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || '',
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        origin: url.origin,
        host: url.host,
        username: url.username || '',
        password: url.password || '',
        queryParams,
        isValid: true,
      }
    } catch (e) {
      return {
        href: '',
        protocol: '',
        hostname: '',
        port: '',
        pathname: '',
        search: '',
        hash: '',
        origin: '',
        host: '',
        username: '',
        password: '',
        queryParams: [],
        isValid: false,
        error: (e as Error).message || 'Invalid URL format',
      }
    }
  }, [])

  const handleParse = useCallback(() => {
    if (!parseInput.trim()) {
      setParsed(null)
      setParseError('')
      return
    }

    const result = parseURL(parseInput)
    if (result) {
      if (result.isValid) {
        setParsed(result)
        setParseError('')
      } else {
        setParseError(result.error || 'Invalid URL format')
        setParsed(null)
      }
    }
  }, [parseInput, parseURL])

  useEffect(() => {
    if (autoParse) {
      const timer = setTimeout(() => {
        handleParse()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [parseInput, autoParse, handleParse])

  const copyParseToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setParseCopied(label)
      setTimeout(() => setParseCopied(null), 2000)
    } catch (e) {
      setParseError('Failed to copy to clipboard')
    }
  }

  // ========== QUERY STRING BUILDER FUNCTIONS ==========
  const updateQueryString = useCallback(() => {
    const validParams = params.filter(p => p.key.trim() !== '')
    const searchParams = new URLSearchParams()
    
    validParams.forEach(param => {
      if (param.key.trim()) {
        searchParams.append(param.key.trim(), param.value)
      }
    })
    
    const query = searchParams.toString()
    setQueryString(query)
    
    const url = baseUrl.trim() + (query ? `?${query}` : '')
    setFullUrl(url)
    setTotalOperations(prev => prev + 1)
  }, [params, baseUrl])

  useEffect(() => {
    if (autoUpdate) {
      updateQueryString()
    }
  }, [params, baseUrl, autoUpdate, updateQueryString])

  const addParam = () => {
    const newParam: QueryParam = {
      key: '',
      value: '',
      id: Date.now().toString()
    }
    setParams([...params, newParam])
  }

  const removeParam = (id: string) => {
    setParams(params.filter(p => p.id !== id))
  }

  const updateParam = (id: string, field: 'key' | 'value', newValue: string) => {
    setParams(params.map(p => 
      p.id === id ? { ...p, [field]: newValue } : p
    ))
  }

  const parseQueryString = useCallback((input: string) => {
    try {
      let url = input.trim()
      
      let base = ''
      let query = ''
      
      if (url.includes('?')) {
        const parts = url.split('?')
        base = parts[0]
        query = parts.slice(1).join('?')
      } else if (url.startsWith('http://') || url.startsWith('https://')) {
        base = url
        query = ''
      } else {
        query = url
        base = baseUrl
      }
      
      if (base) {
        setBaseUrl(base)
      }
      
      if (query) {
        const searchParams = new URLSearchParams(query)
        const newParams: QueryParam[] = []
        
        searchParams.forEach((value, key) => {
          newParams.push({
            key,
            value,
            id: Date.now().toString() + Math.random()
          })
        })
        
        if (newParams.length > 0) {
          setParams(newParams)
        }
      }
      
      setParseQueryInput('')
    } catch (error) {
      // Silent error
    }
  }, [baseUrl])

  const copyQueryToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Silent fail
    }
  }

  useEffect(() => {
    if (input.trim() && encoded) {
      encode()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encodingType, input, encoded, encode])

  return (
    <Layout
      title="🔗 URL Tools - Encoder, Parser & Query Builder"
      description="All-in-one URL tools: encode/decode URLs, parse URL components, and build query strings. Free online URL encoder, decoder, parser, and query string builder for developers."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Tabs */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('encoder')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'encoder'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Encoder/Decoder
            </button>
            <button
              onClick={() => setActiveTab('parser')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'parser'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Parser
            </button>
            <button
              onClick={() => setActiveTab('query')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'query'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Query Builder
            </button>
          </div>
        </div>

        {/* ENCODER/DECODER TAB */}
        {activeTab === 'encoder' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Encoding Type:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setEncodingType('component')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                    encodingType === 'component'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  encodeURIComponent
                </button>
                <button
                  onClick={() => setEncodingType('uri')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                    encodingType === 'uri'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  encodeURI
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {encodingType === 'component' 
                  ? 'Encodes all special characters (recommended for URL parameters)'
                  : 'Encodes only characters that are not valid in a URL (for full URLs)'}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Input Text or URL</label>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={() => setTimeout(autoProcess, 100)}
                className="w-full h-32 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Enter text or URL to encode/decode..."
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={encode}
                  className="flex-1 bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors shadow-md"
                >
                  Encode
                </button>
                <button
                  onClick={decode}
                  className="flex-1 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors shadow-md"
                >
                  Decode
                </button>
                <button
                  onClick={autoProcess}
                  className="flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                  Auto
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {stats.originalLength > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Original</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.originalLength} chars</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Result</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.encodedLength} chars</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Size</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.encodedPercent}%</p>
                  </div>
                </div>
              </div>
            )}

            {encoded && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Encoded URL</label>
                  <button
                    onClick={() => copyToClipboard(encoded, 'encoded')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      copied === 'encoded'
                        ? 'bg-green-600 text-white'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {copied === 'encoded' ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  value={encoded}
                  readOnly
                  className="w-full h-32 px-4 py-3 border-2 border-primary-200 dark:border-primary-800 rounded-lg bg-primary-50/50 dark:bg-primary-900/20 resize-none font-mono text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
            )}

            {decoded && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Decoded URL</label>
                  <button
                    onClick={() => copyToClipboard(decoded, 'decoded')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      copied === 'decoded'
                        ? 'bg-green-600 text-white'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {copied === 'decoded' ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  value={decoded}
                  readOnly
                  className="w-full h-32 px-4 py-3 border-2 border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 resize-none font-mono text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
            )}
          </div>
        )}

        {/* PARSER TAB */}
        {activeTab === 'parser' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Enter URL to Parse</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="auto-parse"
                    checked={autoParse}
                    onChange={(e) => setAutoParse(e.target.checked)}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <label htmlFor="auto-parse" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                    Auto-parse
                  </label>
                </div>
              </div>
              <textarea
                value={parseInput}
                onChange={(e) => {
                  setParseInput(e.target.value)
                  setParseError('')
                }}
                onPaste={() => setTimeout(handleParse, 100)}
                className="w-full h-32 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Enter URL to parse (e.g., https://example.com/path?query=value#hash)..."
              />
              {!autoParse && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleParse}
                    disabled={!parseInput.trim()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Parse URL
                  </button>
                </div>
              )}
            </div>

            {parseError && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-400 text-sm font-medium">{parseError}</p>
              </div>
            )}

            {parsed && parsed.isValid && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <label className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Protocol</label>
                      <button
                        onClick={() => copyParseToClipboard(parsed.protocol, 'protocol')}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium"
                      >
                        {parseCopied === 'protocol' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-lg font-mono font-bold text-blue-900 dark:text-blue-100 break-all">{parsed.protocol}</p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <label className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Hostname</label>
                      <button
                        onClick={() => copyParseToClipboard(parsed.hostname, 'hostname')}
                        className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-xs font-medium"
                      >
                        {parseCopied === 'hostname' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-lg font-mono font-bold text-green-900 dark:text-green-100 break-all">{parsed.hostname}</p>
                  </div>

                  {parsed.port && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <label className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Port</label>
                        <button
                          onClick={() => copyParseToClipboard(parsed.port, 'port')}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-xs font-medium"
                        >
                          {parseCopied === 'port' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-lg font-mono font-bold text-purple-900 dark:text-purple-100">{parsed.port}</p>
                    </div>
                  )}

                  <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <label className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide">Pathname</label>
                      <button
                        onClick={() => copyParseToClipboard(parsed.pathname, 'pathname')}
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 text-xs font-medium"
                      >
                        {parseCopied === 'pathname' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-lg font-mono font-bold text-orange-900 dark:text-orange-100 break-all">{parsed.pathname || '/'}</p>
                  </div>

                  {parsed.hash && (
                    <div className="bg-pink-50 dark:bg-pink-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <label className="text-xs font-semibold text-pink-700 dark:text-pink-300 uppercase tracking-wide">Hash</label>
                        <button
                          onClick={() => copyParseToClipboard(parsed.hash, 'hash')}
                          className="text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 text-xs font-medium"
                        >
                          {parseCopied === 'hash' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-lg font-mono font-bold text-pink-900 dark:text-pink-100 break-all">{parsed.hash}</p>
                    </div>
                  )}

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <label className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">Origin</label>
                      <button
                        onClick={() => copyParseToClipboard(parsed.origin, 'origin')}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs font-medium"
                      >
                        {parseCopied === 'origin' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-lg font-mono font-bold text-indigo-900 dark:text-indigo-100 break-all">{parsed.origin}</p>
                  </div>
                </div>

                {parsed.queryParams.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Query Parameters</label>
                      <button
                        onClick={() => copyParseToClipboard(parsed.search, 'query')}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-xs font-medium"
                      >
                        {parseCopied === 'query' ? '✓ Copied All' : 'Copy Query String'}
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-300 dark:border-gray-600">
                            <th className="text-left py-2 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Parameter</th>
                            <th className="text-left py-2 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Value</th>
                            <th className="text-right py-2 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsed.queryParams.map((param, idx) => (
                            <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                              <td className="py-2 px-4 font-mono text-sm text-gray-900 dark:text-gray-100">{param.key}</td>
                              <td className="py-2 px-4 font-mono text-sm text-gray-700 dark:text-gray-300 break-all">{param.value}</td>
                              <td className="py-2 px-4 text-right">
                                <button
                                  onClick={() => copyParseToClipboard(`${param.key}=${param.value}`, `param-${idx}`)}
                                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-xs font-medium"
                                >
                                  {parseCopied === `param-${idx}` ? '✓' : 'Copy'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              <div className="bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full URL</label>
                  <button
                    onClick={() => copyParseToClipboard(parsed.href, 'full-url')}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    {parseCopied === 'full-url' ? '✓ Copied!' : 'Copy Full URL'}
                  </button>
                </div>
                <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                  {parsed.href}
                </p>
              </div>
              </div>
            )}
          </div>
        )}

        {/* QUERY BUILDER TAB */}
        {activeTab === 'query' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Parse URL or Query String
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={parseQueryInput}
                  onChange={(e) => setParseQueryInput(e.target.value)}
                  placeholder="Paste URL or query string here (e.g., https://example.com?page=1&sort=name)"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
                />
                <button
                  onClick={() => parseQueryString(parseQueryInput)}
                  className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Parse
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Base URL
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto-update"
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
                className="w-4 h-4 accent-primary-600 rounded"
              />
              <label htmlFor="auto-update" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                Auto-update on change
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Query Parameters
                </label>
                <button
                  onClick={addParam}
                  className="px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  + Add Parameter
                </button>
              </div>

              <div className="space-y-2">
                {params.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                    No parameters. Click &quot;Add Parameter&quot; to add one.
                  </div>
                ) : (
                  params.map((param) => (
                    <div
                      key={param.id}
                      className="flex gap-2 items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <input
                        type="text"
                        value={param.key}
                        onChange={(e) => updateParam(param.id, 'key', e.target.value)}
                        placeholder="Parameter name"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
                      />
                      <span className="text-gray-400 dark:text-gray-500">=</span>
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => updateParam(param.id, 'value', e.target.value)}
                        placeholder="Parameter value"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
                      />
                      <button
                        onClick={() => removeParam(param.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove parameter"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {!autoUpdate && (
              <button
                onClick={updateQueryString}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
              >
                Update Query String
              </button>
            )}

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Query String
                  </label>
                  {queryString && (
                    <button
                      onClick={() => copyQueryToClipboard(queryString)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Copy
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={queryString}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-primary-200 dark:border-primary-800 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-gray-900 dark:text-gray-100 font-mono text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Full URL
                  </label>
                  {fullUrl && (
                    <button
                      onClick={() => copyQueryToClipboard(fullUrl)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Copy URL
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={fullUrl}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-primary-200 dark:border-primary-800 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-gray-900 dark:text-gray-100 font-mono text-sm break-all"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

