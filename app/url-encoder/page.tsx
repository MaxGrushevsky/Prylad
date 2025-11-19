'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'

export default function URLEncoderPage() {
  const [input, setInput] = useState('')
  const [encoded, setEncoded] = useState('')
  const [decoded, setDecoded] = useState('')
  const [encodingType, setEncodingType] = useState<'component' | 'uri'>('component')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<'encoded' | 'decoded' | null>(null)
  const [stats, setStats] = useState({ originalLength: 0, encodedLength: 0, encodedPercent: 0 })

  const examples = [
    { name: 'Simple URL', value: 'https://example.com/search?q=hello world' },
    { name: 'URL with special chars', value: 'https://example.com/?name=John Doe&age=30' },
    { name: 'Unicode text', value: 'Привет мир! Hello 世界' },
    { name: 'Encoded URL', value: 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world' },
  ]

  const isEncoded = (text: string): boolean => {
    try {
      const decoded = decodeURIComponent(text)
      return decoded !== text && text.includes('%')
    } catch {
      return false
    }
  }

  const encode = () => {
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
  }

  const decode = () => {
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
  }

  const autoProcess = () => {
    if (!input.trim()) return
    
    if (isEncoded(input)) {
      decode()
    } else {
      encode()
    }
  }

  const copyToClipboard = async (text: string, type: 'encoded' | 'decoded') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (e) {
      setError('Failed to copy to clipboard')
    }
  }

  const clearAll = () => {
    setInput('')
    setEncoded('')
    setDecoded('')
    setError('')
    setStats({ originalLength: 0, encodedLength: 0, encodedPercent: 0 })
  }

  const loadExample = (value: string) => {
    setInput(value)
    if (isEncoded(value)) {
      setTimeout(() => decode(), 100)
    } else {
      setTimeout(() => encode(), 100)
    }
  }

  useEffect(() => {
    // Re-encode when encoding type changes, if we have encoded result
    if (input.trim() && encoded) {
      encode()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encodingType])

  return (
    <Layout
      title="🔗 URL Encoder/Decoder"
      description="Encode and decode URLs online for free. Convert special characters, spaces, and Unicode to URL-encoded format. Perfect for web developers and API testing."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Main Tool */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
          {/* Encoding Type Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Encoding Type:</label>
            <div className="flex gap-3">
              <button
                onClick={() => setEncodingType('component')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  encodingType === 'component'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                encodeURIComponent
              </button>
              <button
                onClick={() => setEncodingType('uri')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  encodingType === 'uri'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                encodeURI
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {encodingType === 'component' 
                ? 'Encodes all special characters (recommended for URL parameters)'
                : 'Encodes only characters that are not valid in a URL (for full URLs)'}
            </p>
          </div>

          {/* Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">Input Text or URL</label>
              {input && (
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={() => setTimeout(autoProcess, 100)}
              className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Statistics */}
          {stats.originalLength > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Original</p>
                  <p className="text-lg font-bold text-gray-900">{stats.originalLength} chars</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Result</p>
                  <p className="text-lg font-bold text-gray-900">{stats.encodedLength} chars</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Size</p>
                  <p className="text-lg font-bold text-gray-900">{stats.encodedPercent}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Encoded Result */}
          {encoded && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Encoded URL</label>
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
                className="w-full h-32 px-4 py-3 border-2 border-primary-200 rounded-lg bg-primary-50/50 resize-none font-mono text-sm"
              />
            </div>
          )}

          {/* Decoded Result */}
          {decoded && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Decoded URL</label>
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
                className="w-full h-32 px-4 py-3 border-2 border-purple-200 rounded-lg bg-purple-50/50 resize-none font-mono text-sm"
              />
            </div>
          )}
        </div>

        {/* Examples */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Try Examples</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => loadExample(example.value)}
                className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <p className="text-sm font-semibold text-gray-900 mb-1">{example.name}</p>
                <p className="text-xs text-gray-600 font-mono truncate">{example.value}</p>
              </button>
            ))}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is URL Encoding?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                URL encoding, also known as percent encoding, is a mechanism for encoding information in a Uniform Resource Identifier (URI). 
                It converts special characters, spaces, and non-ASCII characters into a format that can be safely transmitted over the internet. 
                This encoding is essential because URLs can only contain a limited set of characters from the ASCII character set.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you see characters like <code className="bg-gray-100 px-2 py-1 rounded">%20</code> (space), 
                <code className="bg-gray-100 px-2 py-1 rounded">%3D</code> (=), or <code className="bg-gray-100 px-2 py-1 rounded">%C3%A9</code> (é), 
                these are URL-encoded characters. Each special character is replaced with a percent sign (%) followed by two hexadecimal digits 
                representing the character&apos;s ASCII or Unicode value.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free URL encoder/decoder tool makes it easy to convert between encoded and decoded formats, helping developers, 
                testers, and anyone working with URLs to understand and manipulate URL parameters effectively.
              </p>
            </div>
          </section>

          {/* How to Use */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Our URL Encoder/Decoder</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Our tool is simple and intuitive. Here&apos;s how to use it:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li><strong>Choose Encoding Type:</strong> Select between <code className="bg-gray-100 px-2 py-1 rounded">encodeURIComponent</code> (for URL parameters) or <code className="bg-gray-100 px-2 py-1 rounded">encodeURI</code> (for full URLs).</li>
                <li><strong>Enter Your Text:</strong> Paste or type the text or URL you want to encode or decode in the input field.</li>
                <li><strong>Encode or Decode:</strong> Click &quot;Encode&quot; to convert text to URL-encoded format, &quot;Decode&quot; to convert encoded URLs back to readable text, or &quot;Auto&quot; to automatically detect and process.</li>
                <li><strong>Copy Results:</strong> Click the &quot;Copy&quot; button to copy the encoded or decoded result to your clipboard.</li>
                <li><strong>Try Examples:</strong> Use the example buttons to see how different types of URLs are encoded and decoded.</li>
              </ol>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases for URL Encoding</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🌐 Web Development</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Encode URL parameters before sending them in HTTP requests. Essential for API calls, form submissions, 
                  and query string construction in web applications.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 API Testing</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Test APIs with properly encoded parameters. Decode responses to understand what data is being transmitted 
                  and verify encoding correctness.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Data Analysis</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Decode encoded URLs from web analytics, logs, or tracking systems to understand user behavior and 
                  analyze traffic patterns.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🔐 Security Testing</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Inspect encoded URLs for security vulnerabilities. Decode suspicious links to understand their content 
                  before clicking or processing.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🌍 Internationalization</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Encode URLs containing non-ASCII characters (like Chinese, Arabic, or Cyrillic) to ensure they work 
                  correctly across different browsers and systems.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📧 Email & Marketing</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Encode tracking parameters in email links and marketing campaigns. Decode to verify link destinations 
                  and parameter values.
                </p>
              </div>
            </div>
          </section>

          {/* Technical Details */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Details</h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">encodeURIComponent vs encodeURI</h3>
              <div className="space-y-4 text-gray-700">
                <div>
                  <p className="font-semibold mb-2">encodeURIComponent:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Encodes <strong>all</strong> special characters except: <code className="bg-gray-100 px-1 rounded">A-Z a-z 0-9 - _ . ! ~ * &apos; ( )</code></li>
                    <li>Use for encoding <strong>URL parameters</strong> (values after <code className="bg-gray-100 px-1 rounded">=</code> in query strings)</li>
                    <li>Example: <code className="bg-gray-100 px-2 py-1 rounded">hello world</code> → <code className="bg-gray-100 px-2 py-1 rounded">hello%20world</code></li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">encodeURI:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Encodes only characters that are <strong>not valid</strong> in a URL</li>
                    <li>Preserves characters like <code className="bg-gray-100 px-1 rounded">: / ? # [ ] @</code></li>
                    <li>Use for encoding <strong>entire URLs</strong></li>
                    <li>Example: <code className="bg-gray-100 px-2 py-1 rounded">https://example.com/search?q=hello world</code> → <code className="bg-gray-100 px-2 py-1 rounded">https://example.com/search?q=hello%20world</code></li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">Common Encoded Characters</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Character</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Encoded</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">Space</td>
                      <td className="border border-gray-300 px-4 py-2 font-mono">%20</td>
                      <td className="border border-gray-300 px-4 py-2">Space character</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">!</td>
                      <td className="border border-gray-300 px-4 py-2 font-mono">%21</td>
                      <td className="border border-gray-300 px-4 py-2">Exclamation mark</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">#</td>
                      <td className="border border-gray-300 px-4 py-2 font-mono">%23</td>
                      <td className="border border-gray-300 px-4 py-2">Hash/pound sign</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">$</td>
                      <td className="border border-gray-300 px-4 py-2 font-mono">%24</td>
                      <td className="border border-gray-300 px-4 py-2">Dollar sign</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">%</td>
                      <td className="border border-gray-300 px-4 py-2 font-mono">%25</td>
                      <td className="border border-gray-300 px-4 py-2">Percent sign</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">&</td>
                      <td className="border border-gray-300 px-4 py-2 font-mono">%26</td>
                      <td className="border border-gray-300 px-4 py-2">Ampersand</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">=</td>
                      <td className="border border-gray-300 px-4 py-2 font-mono">%3D</td>
                      <td className="border border-gray-300 px-4 py-2">Equals sign</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">?</td>
                      <td className="border border-gray-300 px-4 py-2 font-mono">%3F</td>
                      <td className="border border-gray-300 px-4 py-2">Question mark</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-mono">@</td>
                      <td className="border border-gray-300 px-4 py-2 font-mono">%40</td>
                      <td className="border border-gray-300 px-4 py-2">At sign</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What is the difference between encodeURI and encodeURIComponent?</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  <code className="bg-gray-100 px-2 py-1 rounded">encodeURI</code> is used for encoding entire URLs and preserves characters like <code className="bg-gray-100 px-1 rounded">: / ? #</code> that are valid in URLs. 
                  <code className="bg-gray-100 px-2 py-1 rounded">encodeURIComponent</code> encodes URL parameters and encodes all special characters, making it suitable for values in query strings.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">When should I use URL encoding?</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Use URL encoding when you need to include special characters, spaces, or non-ASCII characters in URLs or URL parameters. 
                  This is especially important when working with APIs, form submissions, or any situation where user input is included in URLs.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is this tool secure?</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Yes! All encoding and decoding happens entirely in your browser. No data is sent to any server, ensuring complete privacy and security for your URLs and text.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I encode Unicode characters?</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Yes! Our tool supports Unicode characters including Chinese, Japanese, Arabic, Cyrillic, and emoji. 
                  These characters are properly encoded using UTF-8 encoding, which is the standard for modern web applications.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}

