'use client'

import { useState, useCallback } from 'react'
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
  const [token, setToken] = useState('')
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null)
  const [totalDecoded, setTotalDecoded] = useState(0)
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

  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrlKey: true,
      handler: handleDecode
    }
  ])

  const claims = decoded?.valid && decoded.payload ? getClaimInfo(decoded.payload) : null
  const expired = claims?.exp ? isExpired(claims.exp) : null

  return (
    <Layout
      title="🔐 JWT Decoder"
      description="Decode and validate JWT (JSON Web Token) tokens online. View header, payload, and signature. Check expiration and claims."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6">
          <div className="space-y-6">
            {/* Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                JWT Token
              </label>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{decoded.error}</p>
              </div>
            )}

            {/* Decoded Results */}
            {decoded && decoded.valid && (
              <div className="space-y-6">
                {/* Claims Summary */}
                {claims && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Token Claims</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {claims.exp && (
                        <div>
                          <span className="font-medium text-blue-800">Expiration:</span>
                          <span className={`ml-2 ${expired ? 'text-red-600' : 'text-blue-600'}`}>
                            {formatDate(claims.exp)} {expired ? '(Expired)' : '(Valid)'}
                          </span>
                        </div>
                      )}
                      {claims.iat && (
                        <div>
                          <span className="font-medium text-blue-800">Issued At:</span>
                          <span className="ml-2 text-blue-600">{formatDate(claims.iat)}</span>
                        </div>
                      )}
                      {claims.nbf && (
                        <div>
                          <span className="font-medium text-blue-800">Not Before:</span>
                          <span className="ml-2 text-blue-600">{formatDate(claims.nbf)}</span>
                        </div>
                      )}
                      {claims.iss && (
                        <div>
                          <span className="font-medium text-blue-800">Issuer:</span>
                          <span className="ml-2 text-blue-600">{claims.iss}</span>
                        </div>
                      )}
                      {claims.sub && (
                        <div>
                          <span className="font-medium text-blue-800">Subject:</span>
                          <span className="ml-2 text-blue-600">{claims.sub}</span>
                        </div>
                      )}
                      {claims.aud && (
                        <div>
                          <span className="font-medium text-blue-800">Audience:</span>
                          <span className="ml-2 text-blue-600">
                            {Array.isArray(claims.aud) ? claims.aud.join(', ') : claims.aud}
                          </span>
                        </div>
                      )}
                      {claims.jti && (
                        <div>
                          <span className="font-medium text-blue-800">JWT ID:</span>
                          <span className="ml-2 text-blue-600">{claims.jti}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Header
                    </label>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2))}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-sm font-mono">
                    {JSON.stringify(decoded.header, null, 2)}
                  </pre>
                </div>

                {/* Payload */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Payload
                    </label>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2))}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-sm font-mono">
                    {JSON.stringify(decoded.payload, null, 2)}
                  </pre>
                </div>

                {/* Signature */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Signature
                    </label>
                    <button
                      onClick={() => copyToClipboard(decoded.signature)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <code className="text-sm font-mono break-all">{decoded.signature}</code>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Note: Signature verification requires the secret key and is not performed here.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={exportToFile}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Export to File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {totalDecoded > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
            <p className="text-sm text-gray-600">
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
            stateless authentication, meaning the server doesn't need to store session information.
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
              <p className="text-sm">Used to verify that the token hasn't been tampered with. Created by encoding the header and payload and signing with a secret key.</p>
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

      <Toast toast={toast} onClose={hideToast} />
    </Layout>
  )
}


