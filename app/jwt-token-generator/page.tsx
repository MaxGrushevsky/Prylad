'use client'

import { useState, useCallback, useMemo } from 'react'
import Layout from '@/components/Layout'
type Algorithm = 'HS256' | 'none'

export default function JWTTokenGeneratorPage() {
  const [header, setHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}')
  const [payload, setPayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}')
  const [secret, setSecret] = useState('your-secret-key')
  const [algorithm, setAlgorithm] = useState<Algorithm>('HS256')
  const [generatedToken, setGeneratedToken] = useState('')
  const base64UrlEncode = useCallback((str: string): string => {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }, [])

  const generateHMAC = useCallback(async (message: string, secretKey: string): Promise<string> => {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secretKey)
    const messageData = encoder.encode(message)

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    const signatureArray = Array.from(new Uint8Array(signature))
    const signatureBase64 = btoa(String.fromCharCode(...signatureArray))
    
    return signatureBase64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }, [])

  const generateToken = useCallback(async () => {
    try {
      // Parse and validate header
      let headerObj: Record<string, any>
      try {
        headerObj = JSON.parse(header)
      } catch (e) {
        return
      }

      // Parse and validate payload
      let payloadObj: Record<string, any>
      try {
        payloadObj = JSON.parse(payload)
      } catch (e) {
        return
      }

      // Update algorithm in header
      headerObj.alg = algorithm
      headerObj.typ = headerObj.typ || 'JWT'

      // Encode header and payload
      const encodedHeader = base64UrlEncode(JSON.stringify(headerObj))
      const encodedPayload = base64UrlEncode(JSON.stringify(payloadObj))

      // Create signature
      let signature = ''
      if (algorithm === 'HS256') {
        if (!secret.trim()) {
          return
        }
        const message = `${encodedHeader}.${encodedPayload}`
        signature = await generateHMAC(message, secret)
      } else if (algorithm === 'none') {
        signature = ''
      }

      // Combine all parts
      const token = `${encodedHeader}.${encodedPayload}.${signature}`
      setGeneratedToken(token)
    } catch (error) {
      // Silent error handling
    }
  }, [header, payload, secret, algorithm, base64UrlEncode, generateHMAC, ])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
    }
  }

  const addClaim = useCallback((claim: string, value: any) => {
    try {
      const payloadObj = JSON.parse(payload)
      payloadObj[claim] = value
      setPayload(JSON.stringify(payloadObj, null, 2))
    } catch (e) {
      // Silent fail
    }
  }, [payload])

  const quickClaims = useMemo(() => {
    const now = Math.floor(Date.now() / 1000)
    return [
      { name: 'iat (Issued At)', value: now },
      { name: 'exp (Expiration)', value: now + 3600 },
      { name: 'nbf (Not Before)', value: now },
      { name: 'jti (JWT ID)', value: `jwt-${Date.now()}` }
    ]
  }, [])

  return (
    <Layout
      title="🔐 JWT Token Generator"
      description="Generate JWT (JSON Web Token) tokens online. Create signed tokens with custom payload and headers."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* Algorithm Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => {
                  setAlgorithm(e.target.value as Algorithm)
                  const headerObj = JSON.parse(header)
                  headerObj.alg = e.target.value
                  setHeader(JSON.stringify(headerObj, null, 2))
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="HS256">HS256 (HMAC SHA-256)</option>
                <option value="none">None (Unsigned)</option>
              </select>
            </div>

            {/* Header */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Header
              </label>
              <textarea
                value={header}
                onChange={(e) => setHeader(e.target.value)}
                placeholder='{"alg": "HS256", "typ": "JWT"}'
                className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none"
              />
            </div>

            {/* Payload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Payload
                </label>
                <div className="flex gap-2">
                  {quickClaims.map((claim) => (
                    <button
                      key={claim.name}
                      onClick={() => addClaim(claim.name.split(' ')[0], claim.value)}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300"
                    >
                      +{claim.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder='{"sub": "1234567890", "name": "John Doe"}'
                className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none"
              />
            </div>

            {/* Secret Key */}
            {algorithm === 'HS256' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Secret Key
                </label>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="your-secret-key"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  The secret key used to sign the token
                </p>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex justify-center">
              <button
                onClick={generateToken}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Generate JWT Token
              </button>
            </div>

            {/* Generated Token */}
            {generatedToken && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Generated Token
                  </label>
                  <button
                    onClick={() => copyToClipboard(generatedToken)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Copy Token
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <code className="text-sm font-mono break-all text-gray-800 dark:text-gray-200">
                    {generatedToken}
                  </code>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Token length: {generatedToken.length} characters
                </p>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">About JWT Tokens</h3>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <p>
                  <strong>Header:</strong> Contains metadata about the token (algorithm, type)
                </p>
                <p>
                  <strong>Payload:</strong> Contains the claims (data) of the token
                </p>
                <p>
                  <strong>Signature:</strong> Used to verify the token hasn&apos;t been tampered with
                </p>
                <p className="mt-2">
                  <strong>Common Claims:</strong> iat (issued at), exp (expiration), sub (subject), iss (issuer), aud (audience)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 mt-10">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Generate JWT Tokens</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>Add header claims (alg, typ, kid, etc.) in valid JSON format.</li>
            <li>Fill the payload with user data or standard claims (sub, exp, iss, aud…).</li>
            <li>Choose the algorithm (HS256 for shared secret or None for unsigned demos).</li>
            <li>Provide the secret key for HMAC signing and click &ldquo;Generate JWT Token&rdquo;.</li>
            <li>Copy the token or share it with your QA/testing environment.</li>
          </ol>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Common JWT Claims</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Registered Claims</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><code className="font-mono">iss</code> – Issuer of the token</li>
                <li><code className="font-mono">sub</code> – Subject (user ID)</li>
                <li><code className="font-mono">aud</code> – Intended audience</li>
                <li><code className="font-mono">exp</code> – Expiration timestamp</li>
                <li><code className="font-mono">iat</code> – Issued at time</li>
                <li><code className="font-mono">nbf</code> – Not before time</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Custom Claims</h3>
              <p>Store any application-specific metadata (roles, permissions, feature flags). Use namespaces (e.g., <code className="font-mono">&quot;https://example.com/roles&quot;</code>) to avoid collisions.</p>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Security Tips</h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed list-disc list-inside">
            <li>Never share production secrets. Generate tokens with mock or staging secrets only.</li>
            <li>Always set <code className="font-mono">exp</code> to keep tokens short-lived and revokable.</li>
            <li>Use HTTPS when transmitting JWTs to protect against interception.</li>
            <li>Validate tokens on the server side (signature, expiration, issuer, audience).</li>
            <li>Consider RS256/ES256 for asymmetric signing when services don&rsquo;t share secrets.</li>
          </ul>
        </section>
      </div>

      </Layout>
  )
}

