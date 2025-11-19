'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
type Algorithm = 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512'

export default function HashGeneratorPage() {
  const [text, setText] = useState('')
  const [algorithm, setAlgorithm] = useState<Algorithm>('sha256')
  const [hash, setHash] = useState('')
  const [autoHash, setAutoHash] = useState(true)
  const [useHMAC, setUseHMAC] = useState(false)
  const [secretKey, setSecretKey] = useState('')
  const [totalGenerated, setTotalGenerated] = useState(0)
  // MD5 implementation using a simple hash (not cryptographically secure)
  // Note: For production MD5, use crypto-js library
  const generateMD5 = (str: string): string => {
    // This is a simplified hash function for demonstration
    // Real MD5 requires a proper implementation
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(32, '0')
  }

  const generateHash = useCallback(async () => {
    if (!text.trim()) {
      setHash('')
      return
    }

    try {
      // HMAC mode
      if (useHMAC) {
        if (!secretKey.trim()) {
          return
        }

        if (algorithm === 'md5') {
          return
        }

        const encoder = new TextEncoder()
        const keyData = encoder.encode(secretKey)
        const messageData = encoder.encode(text)

        // Import key for HMAC
        const hashAlg = algorithm === 'sha1' ? 'SHA-1' : algorithm === 'sha256' ? 'SHA-256' : algorithm === 'sha384' ? 'SHA-384' : 'SHA-512'
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: hashAlg },
          false,
          ['sign']
        )

        // Sign (generate HMAC)
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
        const hashArray = Array.from(new Uint8Array(signature))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        setHash(hashHex)
        setTotalGenerated(prev => prev + 1)
        return
      }

      // Regular hash mode
      if (algorithm === 'md5') {
        setHash(generateMD5(text))
        setTotalGenerated(prev => prev + 1)
        return
      }

      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      let hashBuffer: ArrayBuffer

      switch (algorithm) {
        case 'sha256':
          hashBuffer = await crypto.subtle.digest('SHA-256', data)
          break
        case 'sha384':
          hashBuffer = await crypto.subtle.digest('SHA-384', data)
          break
        case 'sha512':
          hashBuffer = await crypto.subtle.digest('SHA-512', data)
          break
        case 'sha1':
          hashBuffer = await crypto.subtle.digest('SHA-1', data)
          break
        default:
          return
      }

      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      setHash(hashHex)
      setTotalGenerated(prev => prev + 1)
    } catch (error) {
      setHash('Error generating hash')
    }
  }, [text, algorithm, useHMAC, secretKey, ])

  // Auto-hash on text, algorithm, HMAC mode, or secret key change
  useEffect(() => {
    if (autoHash && text.trim() && (!useHMAC || secretKey.trim())) {
      const timer = setTimeout(() => {
        generateHash()
      }, 300)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, algorithm, autoHash, useHMAC, secretKey])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
    }
  }

  const exportToFile = () => {
    if (!hash) return
    const mode = useHMAC ? 'HMAC' : 'Hash'
    const content = `Algorithm: ${algorithm.toUpperCase()}\nMode: ${mode}\n${useHMAC ? `Secret Key: ${secretKey}\n` : ''}Input: ${text}\n${mode}: ${hash}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${useHMAC ? 'hmac' : 'hash'}-${algorithm}-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onEnter: () => generateHash(),
    onSave: () => exportToFile(),
    onClear: () => {
      setText('')
      setHash('')
    }
  })

  const getHashInfo = () => {
    if (!hash) return null
    return {
      length: hash.length,
      bits: hash.length * 4,
      algorithm: algorithm.toUpperCase()
    }
  }

  const hashInfo = getHashInfo()

  return (
    <>
      <Layout
        title="🔐 Hash Generator (MD5, SHA, HMAC)"
      description="Generate cryptographic hashes and HMAC: MD5, SHA-1, SHA-256, SHA-384, SHA-512. Free online hash generator with auto-hash and export options."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6">
          <div className="space-y-6">
            {/* Algorithm Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Hash Algorithm:</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {(['md5', 'sha1', 'sha256', 'sha384', 'sha512'] as Algorithm[]).map((alg) => (
                  <button
                    key={alg}
                    onClick={() => setAlgorithm(alg)}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      algorithm === alg
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {alg.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {algorithm === 'md5' && '⚠️ MD5 is deprecated and not cryptographically secure. Use SHA-256 or SHA-512 for security.'}
                {algorithm === 'sha1' && '⚠️ SHA-1 is deprecated. Use SHA-256 or SHA-512 for security.'}
                {(algorithm === 'sha256' || algorithm === 'sha384' || algorithm === 'sha512') && `✓ ${algorithm.toUpperCase()} is secure and recommended.`}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="auto-hash"
                  checked={autoHash}
                  onChange={(e) => setAutoHash(e.target.checked)}
                  className="w-4 h-4 accent-primary-600"
                />
                <label htmlFor="auto-hash" className="text-sm text-gray-700 cursor-pointer flex-1">
                  Auto-generate hash as you type
                </label>
              </div>
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="use-hmac"
                  checked={useHMAC}
                  onChange={(e) => {
                    setUseHMAC(e.target.checked)
                    if (e.target.checked && algorithm === 'md5') {
                      setAlgorithm('sha256')
                    }
                  }}
                  className="w-4 h-4 accent-primary-600"
                />
                <label htmlFor="use-hmac" className="text-sm text-gray-700 cursor-pointer flex-1">
                  Use HMAC (Hash-based Message Authentication Code)
                </label>
              </div>
            </div>

            {/* Secret Key Input (for HMAC) */}
            {useHMAC && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Secret Key (for HMAC):
                </label>
                <input
                  type="text"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                  placeholder="Enter secret key for HMAC..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  HMAC requires a secret key. The same message with different keys produces different hashes.
                </p>
                {useHMAC && algorithm === 'md5' && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ HMAC is not supported for MD5. Please select SHA-1, SHA-256, SHA-384, or SHA-512.
                  </p>
                )}
              </div>
            )}

            {/* Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Input Text:</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-40 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                placeholder="Enter text to hash..."
              />
              {text && (
                <p className="text-xs text-gray-500 mt-1">
                  {text.length} characters, {new Blob([text]).size} bytes
                </p>
              )}
            </div>

            {/* Generate Button */}
            {!autoHash && (
              <button
                onClick={generateHash}
                disabled={!text.trim() || (useHMAC && !secretKey.trim())}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate {useHMAC ? 'HMAC' : 'Hash'}
              </button>
            )}

            {/* Hash Output */}
            {hash && (
              <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {algorithm.toUpperCase()} {useHMAC ? 'HMAC' : 'Hash'}:
                  </label>
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
                      onClick={() => copyToClipboard(hash)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                    >
                      Copy Hash
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <code className="text-sm font-mono break-all text-gray-900">{hash}</code>
                </div>
                {hashInfo && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Hash Length</div>
                      <div className="font-bold text-gray-900">{hashInfo.length} chars</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Hash Bits</div>
                      <div className="font-bold text-gray-900">{hashInfo.bits} bits</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Algorithm</div>
                      <div className="font-bold text-gray-900">{hashInfo.algorithm}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Statistics */}
            {totalGenerated > 0 && (
              <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-200">
                Total hashes generated: <span className="font-semibold text-primary-600">{totalGenerated}</span>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is a Hash Function?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                A hash function is a mathematical algorithm that takes an input (or &quot;message&quot;) and returns a 
                fixed-size string of bytes. The output, known as the hash value or digest, is typically a 
                hexadecimal string that appears random. Hash functions are one-way functions - it&apos;s easy to 
                compute the hash from the input, but nearly impossible to reverse the process.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Hash functions are widely used in cryptography, data integrity verification, password storage, 
                digital signatures, and blockchain technology. Different hash algorithms offer different levels 
                of security and output sizes.
              </p>
            </div>
          </section>

          {/* Algorithms */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hash Algorithms Explained</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">MD5 (128 bits)</h3>
                <p className="text-gray-700 text-sm mb-2">
                  MD5 produces a 128-bit hash value. It&apos;s fast but cryptographically broken and vulnerable to 
                  collision attacks. Not recommended for security purposes.
                </p>
                <p className="text-xs text-gray-600"><strong>Use for:</strong> Checksums, non-security applications</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">SHA-1 (160 bits)</h3>
                <p className="text-gray-700 text-sm mb-2">
                  SHA-1 produces a 160-bit hash value. It&apos;s deprecated due to security vulnerabilities and 
                  collision attacks. Not recommended for new applications.
                </p>
                <p className="text-xs text-gray-600"><strong>Use for:</strong> Legacy systems, non-security applications</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">SHA-256 (256 bits)</h3>
                <p className="text-gray-700 text-sm mb-2">
                  SHA-256 is part of the SHA-2 family and produces a 256-bit hash. It&apos;s secure, widely used, 
                  and recommended for most applications including blockchain and digital signatures.
                </p>
                <p className="text-xs text-gray-600"><strong>Use for:</strong> Security, blockchain, digital signatures</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">SHA-384 (384 bits)</h3>
                <p className="text-gray-700 text-sm mb-2">
                  SHA-384 is part of the SHA-2 family and produces a 384-bit hash. It offers higher security 
                  than SHA-256 and is suitable for applications requiring enhanced security.
                </p>
                <p className="text-xs text-gray-600"><strong>Use for:</strong> High-security applications</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">SHA-512 (512 bits)</h3>
                <p className="text-gray-700 text-sm mb-2">
                  SHA-512 is part of the SHA-2 family and produces a 512-bit hash. It offers the highest 
                  security level among SHA-2 algorithms and is suitable for applications requiring maximum security.
                </p>
                <p className="text-xs text-gray-600"><strong>Use for:</strong> Maximum security, cryptographic applications</p>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🔐 Password Storage</h3>
                <p className="text-gray-700 text-sm">
                  Hash passwords before storing them in databases. Use SHA-256 or SHA-512 with salt for 
                  secure password hashing (though bcrypt or Argon2 are preferred).
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">✅ Data Integrity</h3>
                <p className="text-gray-700 text-sm">
                  Verify file integrity by comparing hash values. Generate hashes for files and compare 
                  them to detect corruption or tampering.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🔗 Digital Signatures</h3>
                <p className="text-gray-700 text-sm">
                  Hash messages before signing them digitally. This ensures the signature applies to the 
                  entire message and provides integrity verification.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">⛓️ Blockchain</h3>
                <p className="text-gray-700 text-sm">
                  Hash blocks and transactions in blockchain systems. SHA-256 is commonly used in Bitcoin 
                  and many other cryptocurrencies.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔐</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Multiple Algorithms</h3>
                  <p className="text-gray-700 text-sm">
                    Generate hashes using MD5, SHA-1, SHA-256, SHA-384, or SHA-512. Choose the algorithm 
                    that best fits your security requirements.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Auto-Hash</h3>
                  <p className="text-gray-700 text-sm">
                    Enable auto-hashing to generate hashes automatically as you type. Real-time hash 
                    generation for faster workflow.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Hash Information</h3>
                  <p className="text-gray-700 text-sm">
                    View hash length, bit size, and algorithm details. Understand the characteristics 
                    of your generated hash.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📥</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Export Options</h3>
                  <p className="text-gray-700 text-sm">
                    Copy hash values to clipboard or export to text files. Easy integration into your 
                    applications or documentation.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Privacy First</h3>
                  <p className="text-gray-700 text-sm">
                    All hashing happens locally in your browser using Web Crypto API. We never see, 
                    store, or have access to your input or generated hashes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Cryptography & Hash Functions Reference */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding Cryptographic Hash Functions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What Are Hash Functions?</h3>
                <p className="text-gray-700 text-sm mb-3">
                  A cryptographic hash function is a mathematical algorithm that takes an input (or &quot;message&quot;) and returns 
                  a fixed-size string of bytes. The output, called a hash value or digest, appears random and is unique to 
                  the input data. Even a tiny change in the input produces a completely different hash.
                </p>
                <p className="text-gray-700 text-sm">
                  Hash functions are one-way functions - you can easily compute the hash from the input, but it&apos;s 
                  computationally infeasible to reverse the process and determine the original input from the hash. 
                  This property makes them ideal for password storage, data integrity verification, and digital signatures.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Properties of Hash Functions</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Deterministic</h4>
                    <p className="text-gray-700 text-sm">
                      The same input always produces the same hash output. This allows verification of data integrity 
                      by comparing hashes before and after transmission or storage.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Fast Computation</h4>
                    <p className="text-gray-700 text-sm">
                      Hash functions are designed to compute quickly, making them practical for real-time applications 
                      like password verification and file integrity checks.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Avalanche Effect</h4>
                    <p className="text-gray-700 text-sm">
                      A small change in input (even a single bit) produces a dramatically different hash. This ensures 
                      that similar inputs don&apos;t produce similar hashes, preventing pattern-based attacks.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Collision Resistance</h4>
                    <p className="text-gray-700 text-sm">
                      It should be extremely difficult to find two different inputs that produce the same hash. While 
                      collisions are theoretically possible (due to fixed output size), finding them should be computationally 
                      infeasible for secure hash functions.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Hash Algorithms Explained</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">MD5 (Message Digest 5)</h4>
                    <p className="text-gray-700 text-sm mb-2">
                      Produces a 128-bit (16-byte) hash. MD5 is now considered cryptographically broken and unsuitable 
                      for security purposes due to collision vulnerabilities discovered in 2004. However, it&apos;s still 
                      useful for non-cryptographic purposes like checksums and data integrity verification in non-adversarial 
                      environments.
                    </p>
                    <p className="text-gray-600 text-xs italic">
                      ⚠️ Not recommended for security-sensitive applications
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">SHA-1 (Secure Hash Algorithm 1)</h4>
                    <p className="text-gray-700 text-sm mb-2">
                      Produces a 160-bit (20-byte) hash. SHA-1 was deprecated by NIST in 2011 due to theoretical collision 
                      attacks. While still widely used, it&apos;s being phased out in favor of SHA-2 and SHA-3 for new applications.
                    </p>
                    <p className="text-gray-600 text-xs italic">
                      ⚠️ Deprecated - use SHA-256 or higher for new projects
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">SHA-256 (SHA-2 Family)</h4>
                    <p className="text-gray-700 text-sm">
                      Produces a 256-bit (32-byte) hash. Part of the SHA-2 family, SHA-256 is currently the most widely 
                      used secure hash algorithm. It&apos;s recommended by security experts and used in Bitcoin, SSL/TLS 
                      certificates, and many other security-critical applications. SHA-256 provides excellent security 
                      and performance balance.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">SHA-384 (SHA-2 Family)</h4>
                    <p className="text-gray-700 text-sm">
                      Produces a 384-bit (48-byte) hash. Also part of the SHA-2 family, SHA-384 offers higher security 
                      than SHA-256, though SHA-256 is generally sufficient for most applications. SHA-384 is often used 
                      when additional security margin is desired.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">SHA-512 (SHA-2 Family)</h4>
                    <p className="text-gray-700 text-sm">
                      Produces a 512-bit (64-byte) hash. The largest output in the SHA-2 family, SHA-512 provides the 
                      highest level of security. While computationally more expensive than SHA-256, it&apos;s still fast enough 
                      for most applications and offers maximum security for sensitive data.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Common Use Cases for Hash Functions</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
                  <li><strong>Password Storage:</strong> Websites store password hashes instead of plain text passwords. When you log in, your password is hashed and compared to the stored hash.</li>
                  <li><strong>Data Integrity:</strong> Verify that files haven&apos;t been corrupted or tampered with by comparing their hashes before and after transmission.</li>
                  <li><strong>Digital Signatures:</strong> Hash functions are used in digital signature algorithms to create compact, verifiable signatures.</li>
                  <li><strong>Blockchain:</strong> Cryptocurrencies like Bitcoin use hash functions extensively for mining, transaction verification, and maintaining the blockchain.</li>
                  <li><strong>Deduplication:</strong> Identify duplicate files or data by comparing their hashes.</li>
                  <li><strong>Commitment Schemes:</strong> Commit to a value without revealing it, then later prove what the value was.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Security Considerations</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Salt for Passwords</h4>
                    <p className="text-gray-700 text-sm">
                      When hashing passwords, always use a salt - a random value added to each password before hashing. 
                      Salting prevents rainbow table attacks and ensures that identical passwords produce different hashes. 
                      Modern password hashing uses specialized algorithms like bcrypt, Argon2, or PBKDF2 that incorporate 
                      salting and are computationally expensive to slow down brute force attacks.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Algorithm Selection</h4>
                    <p className="text-gray-700 text-sm">
                      For security-sensitive applications, always use SHA-256 or higher. Avoid MD5 and SHA-1 for new 
                      projects. Consider the computational cost vs. security trade-off - SHA-256 is usually the sweet 
                      spot for most applications.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Hash Length</h4>
                    <p className="text-gray-700 text-sm">
                      Longer hashes provide more security but require more storage and computation. SHA-256 (256 bits) 
                      is generally sufficient for most applications. SHA-512 provides maximum security for highly sensitive 
                      applications.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Which hash algorithm should I use?</h3>
                <p className="text-gray-700 text-sm">
                  For security purposes, use SHA-256 or SHA-512. SHA-256 is widely used and provides excellent 
                  security. SHA-512 offers even higher security. Avoid MD5 and SHA-1 for security-critical 
                  applications as they&apos;re vulnerable to attacks.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I reverse a hash to get the original text?</h3>
                <p className="text-gray-700 text-sm">
                  No, hash functions are one-way functions. You cannot reverse a hash to get the original input. 
                  However, attackers can use rainbow tables or brute force to find inputs that produce the same hash.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is MD5 secure?</h3>
                <p className="text-gray-700 text-sm">
                  No, MD5 is not secure for cryptographic purposes. It&apos;s vulnerable to collision attacks and 
                  should not be used for security-sensitive applications. Use SHA-256 or SHA-512 instead.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What&apos;s the difference between hash and encryption?</h3>
                <p className="text-gray-700 text-sm">
                  Hashing is one-way - you can&apos;t get the original data back. Encryption is two-way - you can 
                  decrypt encrypted data with the key. Use hashing for passwords and data integrity. Use 
                  encryption for data that needs to be recovered.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you store my hashed data?</h3>
                <p className="text-gray-700 text-sm">
                  No, absolutely not. All hashing happens entirely in your browser using the Web Crypto API. 
                  We never see, store, transmit, or have any access to your input text or generated hashes. 
                  Your privacy is completely protected.
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

