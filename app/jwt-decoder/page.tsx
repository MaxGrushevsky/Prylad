'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
interface DecodedJWT {
  header: Record<string, any>
  payload: Record<string, any>
  signature: string
  valid: boolean
  error?: string
}

interface JWTClaims {
  exp?: number
  iat?: number
  nbf?: number
  iss?: string
  sub?: string
  aud?: string | string[]
  jti?: string
}

export default function JWTDecoderPage() {
  const [mode, setMode] = useState<'decode' | 'generate'>('decode')
  const [token, setToken] = useState('')
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null)
  const [totalDecoded, setTotalDecoded] = useState(0)
  
  // Generation state
  const [headerJson, setHeaderJson] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}')
  const [payloadJson, setPayloadJson] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}')
  const [secret, setSecret] = useState('')
  const [algorithm, setAlgorithm] = useState<'HS256' | 'HS384' | 'HS512'>('HS256')
  const [generatedToken, setGeneratedToken] = useState('')
  const [generateError, setGenerateError] = useState('')

  // Check URL hash for mode switching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash === '#generate') {
        setMode('generate')
      } else if (hash === '#decode') {
        setMode('decode')
      }
    }
  }, [])

  // Update URL hash when mode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = mode === 'decode' ? '' : '#generate'
      if (window.location.hash !== hash) {
        window.history.replaceState(null, '', hash || window.location.pathname)
      }
    }
  }, [mode])

  const base64UrlDecode = useCallback((str: string): string => {
    try {
      // Replace URL-safe characters
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
      
      // Add padding if needed
      while (base64.length % 4) {
        base64 += '='
      }
      
      // Decode base64
      const decoded = atob(base64)
      return decoded
    } catch (e) {
      throw new Error('Invalid base64 encoding')
    }
  }, [])

  const base64UrlEncode = useCallback((str: string): string => {
    try {
      const base64 = btoa(str)
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    } catch (e) {
      throw new Error('Invalid encoding')
    }
  }, [])

  // Generate JWT token
  const generateJWT = useCallback(async () => {
    setGenerateError('')
    setGeneratedToken('')
    
    if (!secret.trim()) {
      setGenerateError('Secret key is required')
      return
    }

    try {
      // Parse header and payload
      const header = JSON.parse(headerJson)
      const payload = JSON.parse(payloadJson)

      // Encode header and payload
      const encodedHeader = base64UrlEncode(JSON.stringify(header))
      const encodedPayload = base64UrlEncode(JSON.stringify(payload))

      // Create signature
      const data = `${encodedHeader}.${encodedPayload}`
      const encoder = new TextEncoder()
      const keyData = encoder.encode(secret)
      const messageData = encoder.encode(data)

      // Get algorithm name for Web Crypto API
      let algorithmName: string
      switch (algorithm) {
        case 'HS256':
          algorithmName = 'HS256'
          break
        case 'HS384':
          algorithmName = 'HS384'
          break
        case 'HS512':
          algorithmName = 'HS512'
          break
        default:
          algorithmName = 'HS256'
      }

      // Import key
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        {
          name: 'HMAC',
          hash: { name: algorithmName === 'HS256' ? 'SHA-256' : algorithmName === 'HS384' ? 'SHA-384' : 'SHA-512' }
        },
        false,
        ['sign']
      )

      // Sign
      const signature = await crypto.subtle.sign('HMAC', key, messageData)
      const signatureArray = Array.from(new Uint8Array(signature))
      const signatureBase64 = btoa(String.fromCharCode(...signatureArray))
      const encodedSignature = signatureBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

      // Combine
      const jwt = `${encodedHeader}.${encodedPayload}.${encodedSignature}`
      setGeneratedToken(jwt)
    } catch (e) {
      setGenerateError(`Generation error: ${(e as Error).message}`)
    }
  }, [headerJson, payloadJson, secret, algorithm, base64UrlEncode])

  const decodeJWT = useCallback((jwtToken: string): DecodedJWT => {
    if (!jwtToken.trim()) {
      return {
        header: {},
        payload: {},
        signature: '',
        valid: false,
        error: 'Please enter a JWT token'
      }
    }

    try {
      // Split JWT into parts
      const parts = jwtToken.trim().split('.')
      
      if (parts.length !== 3) {
        return {
          header: {},
          payload: {},
          signature: '',
          valid: false,
          error: 'Invalid JWT format. JWT should have 3 parts separated by dots (header.payload.signature)'
        }
      }

      const [headerBase64, payloadBase64, signature] = parts

      // Decode header
      const headerJson = base64UrlDecode(headerBase64)
      const header = JSON.parse(headerJson)

      // Decode payload
      const payloadJson = base64UrlDecode(payloadBase64)
      const payload = JSON.parse(payloadJson)

      return {
        header,
        payload,
        signature,
        valid: true
      }
    } catch (e) {
      return {
        header: {},
        payload: {},
        signature: '',
        valid: false,
        error: `Decode error: ${(e as Error).message}`
      }
    }
  }, [base64UrlDecode])

  const handleDecode = useCallback(() => {
    const result = decodeJWT(token)
    setDecoded(result)
    if (result.valid) {
      setTotalDecoded(prev => prev + 1)
    } else {
    }
  }, [token, decodeJWT, ])

  const formatDate = useCallback((timestamp: number): string => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    })
  }, [])

  const getClaimInfo = useCallback((payload: Record<string, any>): JWTClaims => {
    return {
      exp: payload.exp,
      iat: payload.iat,
      nbf: payload.nbf,
      iss: payload.iss,
      sub: payload.sub,
      aud: payload.aud,
      jti: payload.jti
    }
  }, [])

  const isExpired = useCallback((exp?: number): boolean | null => {
    if (!exp) return null
    return Date.now() / 1000 > exp
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
    }
  }

  const exportToFile = () => {
    if (!decoded || !decoded.valid) return
    
    const content = `JWT Token: ${token}\n\nHeader:\n${JSON.stringify(decoded.header, null, 2)}\n\nPayload:\n${JSON.stringify(decoded.payload, null, 2)}\n\nSignature: ${decoded.signature}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'jwt-decoded.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useKeyboardShortcuts({
    onEnter: handleDecode
  })

  const claims = decoded?.valid && decoded.payload ? getClaimInfo(decoded.payload) : null
  const expired = claims?.exp ? isExpired(claims.exp) : null

  return (
    <Layout
      title="🔐 JWT Decoder"
      description="Decode and validate JWT (JSON Web Token) tokens online. View header, payload, and signature. Check expiration and claims."
    >
      <div className="max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('decode')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                mode === 'decode'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Decode JWT
            </button>
            <button
              onClick={() => setMode('generate')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                mode === 'generate'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Generate JWT
            </button>
          </div>
        </div>

        {/* Decode Mode */}
        {mode === 'decode' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
            <div className="space-y-6">
              {/* Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  JWT Token
                </label>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter a JWT token to decode (header.payload.signature)
                </p>
                <button
                  onClick={handleDecode}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Decode JWT
                </button>
              </div>
            </div>

            {/* Error */}
            {decoded && !decoded.valid && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{decoded.error}</p>
              </div>
            )}

            {/* Decoded Results */}
            {decoded && decoded.valid && (
              <div className="space-y-6">
                {/* Claims Summary */}
                {claims && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Token Claims</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {claims.exp && (
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">Expiration:</span>
                          <span className={`ml-2 ${expired ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-300'}`}>
                            {formatDate(claims.exp)} {expired ? '(Expired)' : '(Valid)'}
                          </span>
                        </div>
                      )}
                      {claims.iat && (
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">Issued At:</span>
                          <span className="ml-2 text-blue-600 dark:text-blue-300">{formatDate(claims.iat)}</span>
                        </div>
                      )}
                      {claims.nbf && (
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">Not Before:</span>
                          <span className="ml-2 text-blue-600 dark:text-blue-300">{formatDate(claims.nbf)}</span>
                        </div>
                      )}
                      {claims.iss && (
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">Issuer:</span>
                          <span className="ml-2 text-blue-600 dark:text-blue-300">{claims.iss}</span>
                        </div>
                      )}
                      {claims.sub && (
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">Subject:</span>
                          <span className="ml-2 text-blue-600 dark:text-blue-300">{claims.sub}</span>
                        </div>
                      )}
                      {claims.aud && (
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">Audience:</span>
                          <span className="ml-2 text-blue-600 dark:text-blue-300">
                            {Array.isArray(claims.aud) ? claims.aud.join(', ') : claims.aud}
                          </span>
                        </div>
                      )}
                      {claims.jti && (
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">JWT ID:</span>
                          <span className="ml-2 text-blue-600 dark:text-blue-300">{claims.jti}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Header
                    </label>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2))}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-800 dark:text-gray-200">
                    {JSON.stringify(decoded.header, null, 2)}
                  </pre>
                </div>

                {/* Payload */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Payload
                    </label>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2))}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-800 dark:text-gray-200">
                    {JSON.stringify(decoded.payload, null, 2)}
                  </pre>
                </div>

                {/* Signature */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Signature
                    </label>
                    <button
                      onClick={() => copyToClipboard(decoded.signature)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <code className="text-sm font-mono break-all text-gray-800 dark:text-gray-200">{decoded.signature}</code>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Note: Signature verification requires the secret key and is not performed here.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={exportToFile}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Export to File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Generate Mode */}
        {mode === 'generate' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Header (JSON)
                </label>
                <textarea
                  value={headerJson}
                  onChange={(e) => setHeaderJson(e.target.value)}
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder='{"alg": "HS256", "typ": "JWT"}'
                />
              </div>

              {/* Payload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Payload (JSON)
                </label>
                <textarea
                  value={payloadJson}
                  onChange={(e) => setPayloadJson(e.target.value)}
                  className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder='{"sub": "1234567890", "name": "John Doe", "iat": 1516239022}'
                />
              </div>

              {/* Algorithm and Secret */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Algorithm
                  </label>
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value as 'HS256' | 'HS384' | 'HS512')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="HS256">HS256 (HMAC SHA-256)</option>
                    <option value="HS384">HS384 (HMAC SHA-384)</option>
                    <option value="HS512">HS512 (HMAC SHA-512)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Secret Key
                  </label>
                  <input
                    type="text"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
                    placeholder="Enter secret key"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateJWT}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Generate JWT Token
              </button>

              {/* Error */}
              {generateError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{generateError}</p>
                </div>
              )}

              {/* Generated Token */}
              {generatedToken && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Generated JWT Token
                      </label>
                      <button
                        onClick={() => copyToClipboard(generatedToken)}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <code className="text-sm font-mono break-all text-gray-800 dark:text-gray-200">{generatedToken}</code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        {mode === 'decode' && totalDecoded > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total tokens decoded: <span className="font-semibold text-primary-600">{totalDecoded}</span>
            </p>
          </div>
        )}
      </div>

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is a JWT Token?</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            JWT (JSON Web Token) is a compact, URL-safe token format used for securely transmitting information 
            between parties. A JWT consists of three parts separated by dots: header, payload, and signature.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            JWTs are commonly used for authentication and authorization in web applications and APIs. They allow 
            stateless authentication, meaning the server doesn&apos;t need to store session information.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">JWT Structure</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">1. Header</h3>
              <p className="text-sm mb-2">Contains metadata about the token, including the algorithm used for signing:</p>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto"><code>{`{
  "alg": "HS256",
  "typ": "JWT"
}`}</code></pre>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">2. Payload</h3>
              <p className="text-sm mb-2">Contains the claims (data) about the user and additional metadata:</p>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto"><code>{`{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516242622
}`}</code></pre>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">3. Signature</h3>
              <p className="text-sm">Used to verify that the token hasn&apos;t been tampered with. Created by encoding the header and payload and signing with a secret key.</p>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common JWT Claims</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong className="text-gray-900 dark:text-gray-100">iss (Issuer):</strong> Who issued the token
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">sub (Subject):</strong> The subject of the token (usually user ID)
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">aud (Audience):</strong> Who the token is intended for
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">exp (Expiration):</strong> Token expiration timestamp
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">iat (Issued At):</strong> When the token was issued
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">nbf (Not Before):</strong> Token not valid before this timestamp
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">jti (JWT ID):</strong> Unique identifier for the token
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Security Best Practices</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Expiration:</strong> Always set reasonable expiration times for tokens to limit exposure if compromised.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Secret Keys:</strong> Use strong, randomly generated secret keys and never expose them in client-side code.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>HTTPS:</strong> Always transmit JWTs over HTTPS to prevent interception.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Validation:</strong> Always validate token signature, expiration, and claims on the server side.</span>
            </li>
          </ul>
        </section>
      </div>
    </Layout>
  )
}


