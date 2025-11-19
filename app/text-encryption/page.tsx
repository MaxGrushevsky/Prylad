'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
type EncryptionMethod = 'caesar' | 'base64' | 'rot13' | 'atbash' | 'xor' | 'vigenere'

interface EncryptionStats {
  originalLength: number
  encryptedLength: number
  ratio: number
}

const encryptionExamples = [
  { method: 'caesar', text: 'Hello World', shift: 3, result: 'Khoor Zruog' },
  { method: 'rot13', text: 'Hello World', result: 'Uryyb Jbeyq' },
  { method: 'atbash', text: 'Hello', result: 'Svool' },
  { method: 'base64', text: 'Hello World', result: 'SGVsbG8gV29ybGQ=' }
]

export default function TextEncryptionPage() {
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [method, setMethod] = useState<EncryptionMethod>('caesar')
  const [operation, setOperation] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [caesarShift, setCaesarShift] = useState(3)
  const [xorKey, setXorKey] = useState('key')
  const [vigenereKey, setVigenereKey] = useState('KEY')
  const [autoProcess, setAutoProcess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalOperations, setTotalOperations] = useState(0)
  const caesarCipher = useCallback((str: string, shift: number, encrypt: boolean): string => {
    const actualShift = encrypt ? shift : -shift
    return str.split('').map(char => {
      if (char >= 'A' && char <= 'Z') {
        return String.fromCharCode(((char.charCodeAt(0) - 65 + actualShift + 26) % 26) + 65)
      }
      if (char >= 'a' && char <= 'z') {
        return String.fromCharCode(((char.charCodeAt(0) - 97 + actualShift + 26) % 26) + 97)
      }
      if (char >= 'А' && char <= 'Я') {
        return String.fromCharCode(((char.charCodeAt(0) - 1040 + actualShift + 32) % 32) + 1040)
      }
      if (char >= 'а' && char <= 'я') {
        return String.fromCharCode(((char.charCodeAt(0) - 1072 + actualShift + 32) % 32) + 1072)
      }
      return char
    }).join('')
  }, [])

  const rot13Cipher = useCallback((str: string): string => {
    return str.split('').map(char => {
      if (char >= 'A' && char <= 'Z') {
        return String.fromCharCode(((char.charCodeAt(0) - 65 + 13) % 26) + 65)
      }
      if (char >= 'a' && char <= 'z') {
        return String.fromCharCode(((char.charCodeAt(0) - 97 + 13) % 26) + 97)
      }
      return char
    }).join('')
  }, [])

  const atbashCipher = useCallback((str: string): string => {
    return str.split('').map(char => {
      if (char >= 'A' && char <= 'Z') {
        return String.fromCharCode(90 - (char.charCodeAt(0) - 65))
      }
      if (char >= 'a' && char <= 'z') {
        return String.fromCharCode(122 - (char.charCodeAt(0) - 97))
      }
      return char
    }).join('')
  }, [])

  const xorCipher = useCallback((str: string, key: string, encrypt: boolean): string => {
    if (!key) return str
    const result: string[] = []
    for (let i = 0; i < str.length; i++) {
      const keyChar = key.charCodeAt(i % key.length)
      const strChar = str.charCodeAt(i)
      const xorResult = strChar ^ keyChar
      // Convert to hex for better display of non-printable characters
      if (xorResult < 32 || xorResult > 126) {
        result.push('\\x' + xorResult.toString(16).padStart(2, '0'))
      } else {
        result.push(String.fromCharCode(xorResult))
      }
    }
    return result.join('')
  }, [])

  const vigenereCipher = useCallback((str: string, key: string, encrypt: boolean): string => {
    if (!key) return str
    const keyUpper = key.toUpperCase()
    let keyIndex = 0
    return str.split('').map(char => {
      if (char >= 'A' && char <= 'Z') {
        const shift = (keyUpper.charCodeAt(keyIndex % keyUpper.length) - 65) * (encrypt ? 1 : -1)
        keyIndex++
        return String.fromCharCode(((char.charCodeAt(0) - 65 + shift + 26) % 26) + 65)
      }
      if (char >= 'a' && char <= 'z') {
        const shift = (keyUpper.charCodeAt(keyIndex % keyUpper.length) - 65) * (encrypt ? 1 : -1)
        keyIndex++
        return String.fromCharCode(((char.charCodeAt(0) - 97 + shift + 26) % 26) + 97)
      }
      return char
    }).join('')
  }, [])

  const base64Cipher = useCallback((str: string, encrypt: boolean): string => {
    try {
      if (encrypt) {
        return btoa(unescape(encodeURIComponent(str)))
      } else {
        return decodeURIComponent(escape(atob(str)))
      }
    } catch (e) {
      throw new Error('Invalid Base64 format')
    }
  }, [])

  const process = useCallback(() => {
    if (!text.trim()) {
      setResult('')
      setError(null)
      return
    }

    try {
      setError(null)
      let encrypted = ''

      switch (method) {
        case 'caesar':
          encrypted = caesarCipher(text, caesarShift, operation === 'encrypt')
          break
        case 'rot13':
          encrypted = rot13Cipher(text)
          break
        case 'atbash':
          encrypted = atbashCipher(text)
          break
        case 'xor':
          encrypted = xorCipher(text, xorKey, operation === 'encrypt')
          break
        case 'vigenere':
          encrypted = vigenereCipher(text, vigenereKey, operation === 'encrypt')
          break
        case 'base64':
          encrypted = base64Cipher(text, operation === 'encrypt')
          break
      }

      setResult(encrypted)
      setTotalOperations(prev => prev + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Encryption error')
      setResult('')
    }
  }, [text, method, operation, caesarShift, xorKey, vigenereKey, caesarCipher, rot13Cipher, atbashCipher, xorCipher, vigenereCipher, base64Cipher])

  useEffect(() => {
    if (autoProcess && text) {
      const timeoutId = setTimeout(() => {
        process()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [autoProcess, text, method, operation, caesarShift, xorKey, vigenereKey, process])

  const getStats = useCallback((): EncryptionStats => {
    const originalLength = text.length
    const encryptedLength = result.length
    const ratio = originalLength > 0 ? (encryptedLength / originalLength) : 0
    return { originalLength, encryptedLength, ratio }
  }, [text, result])

  const stats = getStats()

  const copyResult = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
    } catch (err) {
    }
  }

  const exportToFile = () => {
    if (!result) return
    const content = `Original: ${text}\n\n${operation === 'encrypt' ? 'Encrypted' : 'Decrypted'}: ${result}\n\nMethod: ${method}\nOperation: ${operation}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `encryption-${Date.now()}.txt`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const loadExample = (example: typeof encryptionExamples[0]) => {
    setMethod(example.method as EncryptionMethod)
    setText(example.text)
    if ('shift' in example && example.shift !== undefined) {
      setCaesarShift(example.shift)
    }
    setOperation('encrypt')
  }

  const clearAll = () => {
    setText('')
    setResult('')
    setError(null)
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onEnter: () => process(),
    onSave: () => exportToFile(),
    onClear: () => clearAll()
  })

  return (
    <>
      <Layout
        title="🔒 Text Encryption & Decryption - Secure Text Cipher Online"
      description="Encrypt and decrypt text using multiple methods: Caesar cipher, ROT13, Atbash, XOR, Vigenère, and Base64. Free online text encryption tool with real-time processing. Perfect for learning cryptography and securing messages."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Encryption Settings</h2>
              {totalOperations > 0 && (
                <div className="text-sm text-gray-500">
                  Operations: <span className="font-semibold text-gray-900">{totalOperations}</span>
                </div>
              )}
            </div>

            {/* Method Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Encryption Method:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['caesar', 'rot13', 'atbash', 'xor', 'vigenere', 'base64'] as EncryptionMethod[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      method === m
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Operation Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Operation:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOperation('encrypt')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    operation === 'encrypt'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🔒 Encrypt
                </button>
                <button
                  onClick={() => setOperation('decrypt')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    operation === 'decrypt'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🔓 Decrypt
                </button>
              </div>
            </div>

            {/* Method-specific Settings */}
            {method === 'caesar' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Shift: <span className="text-primary-600 font-bold">{caesarShift}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={caesarShift}
                  onChange={(e) => setCaesarShift(Number(e.target.value))}
                  className="w-full accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>25</span>
                </div>
              </div>
            )}

            {method === 'xor' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">XOR Key:</label>
                <input
                  type="text"
                  value={xorKey}
                  onChange={(e) => setXorKey(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                  placeholder="Enter key..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  The same key must be used for encryption and decryption
                </p>
              </div>
            )}

            {method === 'vigenere' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vigenère Key:</label>
                <input
                  type="text"
                  value={vigenereKey}
                  onChange={(e) => setVigenereKey(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm uppercase"
                  placeholder="Enter key..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Key will be converted to uppercase. Use the same key for encryption and decryption.
                </p>
              </div>
            )}

            {/* Quick Examples */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Quick Examples:</label>
              <div className="grid grid-cols-2 gap-2">
                {encryptionExamples.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => loadExample(example)}
                    className="px-3 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-xs transition-colors"
                  >
                    <div className="font-semibold text-gray-900">{example.method.toUpperCase()}</div>
                    <div className="text-gray-500 truncate">{example.text}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Text */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {operation === 'encrypt' ? 'Original Text' : 'Encrypted Text'}
                </label>
                <button
                  onClick={clearAll}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-48 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                placeholder="Enter text to encrypt/decrypt..."
                spellCheck={false}
              />
              <p className="mt-1 text-xs text-gray-500">
                Characters: {text.length}
              </p>
            </div>

            {/* Auto Process Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoProcess}
                onChange={(e) => setAutoProcess(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Auto-process as you type</span>
            </label>

            {!autoProcess && (
              <button
                onClick={process}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
              >
                {operation === 'encrypt' ? '🔒 Encrypt' : '🔓 Decrypt'}
              </button>
            )}
          </div>

          {/* Output */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold">Result</h2>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-semibold mb-1">Error:</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Statistics */}
            {result && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.originalLength}</div>
                  <div className="text-xs text-gray-600">Original</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.encryptedLength}</div>
                  <div className="text-xs text-gray-600">Result</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.ratio.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Ratio</div>
                </div>
              </div>
            )}

            {/* Output Text */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {operation === 'encrypt' ? 'Encrypted Text' : 'Decrypted Text'}
                </label>
                {result && (
                  <div className="flex gap-2">
                    <button
                      onClick={copyResult}
                      className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Copy
                    </button>
                    <button
                      onClick={exportToFile}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Export
                    </button>
                  </div>
                )}
              </div>
              <textarea
                value={result}
                readOnly
                className="w-full h-48 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 resize-none font-mono text-sm"
                placeholder="Result will appear here..."
              />
              {result && (
                <p className="mt-1 text-xs text-gray-500">
                  Characters: {result.length}
                </p>
              )}
            </div>

            {/* Method Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                {method.charAt(0).toUpperCase() + method.slice(1)} Cipher
              </h3>
              <p className="text-xs text-blue-700">
                {method === 'caesar' && 'Shifts each letter by a fixed number of positions in the alphabet.'}
                {method === 'rot13' && 'ROT13 is a special case of Caesar cipher with shift 13. It is its own inverse.'}
                {method === 'atbash' && 'Replaces each letter with its mirror letter (A↔Z, B↔Y, etc.).'}
                {method === 'xor' && 'XOR encryption uses bitwise XOR operation with a key. Same key encrypts and decrypts.'}
                {method === 'vigenere' && 'Polyalphabetic cipher using a keyword. More secure than Caesar cipher.'}
                {method === 'base64' && 'Base64 encoding (not true encryption). Converts binary data to ASCII text.'}
              </p>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Text Encryption?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Text encryption is the process of converting plain text into a coded format (ciphertext) that cannot be 
                easily understood by unauthorized parties. Encryption uses algorithms and keys to transform data, ensuring 
                that only those with the correct key can decrypt and read the original message.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free text encryption tool supports multiple encryption methods, from simple ciphers like Caesar and ROT13 
                to more complex methods like Vigenère and XOR. Perfect for learning cryptography, securing messages, and 
                understanding how different encryption algorithms work.
              </p>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Encryption Methods Explained</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🔐 Caesar Cipher</h3>
                <p className="text-gray-700 text-sm mb-2">
                  One of the oldest and simplest encryption methods. Each letter is shifted by a fixed number of positions 
                  in the alphabet. For example, with shift 3: A→D, B→E, C→F. Easy to use but not secure for sensitive data.
                </p>
                <p className="text-gray-600 text-xs">
                  <strong>Use case:</strong> Learning cryptography, simple message obfuscation, puzzles.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🔄 ROT13</h3>
                <p className="text-gray-700 text-sm mb-2">
                  A special case of Caesar cipher with shift 13. ROT13 is its own inverse - applying ROT13 twice returns 
                  the original text. Commonly used in online forums to hide spoilers or offensive content.
                </p>
                <p className="text-gray-600 text-xs">
                  <strong>Use case:</strong> Hiding spoilers, simple text obfuscation, reversible encoding.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🪞 Atbash Cipher</h3>
                <p className="text-gray-700 text-sm mb-2">
                  A substitution cipher where each letter is replaced with its mirror letter in the alphabet. A↔Z, B↔Y, C↔X, etc. 
                  Like ROT13, Atbash is its own inverse.
                </p>
                <p className="text-gray-600 text-xs">
                  <strong>Use case:</strong> Simple encoding, learning substitution ciphers, puzzles.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🔑 XOR Cipher</h3>
                <p className="text-gray-700 text-sm mb-2">
                  Uses bitwise XOR operation with a key. The same key is used for both encryption and decryption. XOR is 
                  fast and simple, but the key must be kept secret and should be as long as the message for best security.
                </p>
                <p className="text-gray-600 text-xs">
                  <strong>Use case:</strong> Simple encryption, learning bitwise operations, basic data protection.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🔐 Vigenère Cipher</h3>
                <p className="text-gray-700 text-sm mb-2">
                  A polyalphabetic substitution cipher that uses a keyword. Each letter of the keyword determines the shift 
                  for the corresponding letter in the message. More secure than Caesar cipher but still breakable with 
                  frequency analysis.
                </p>
                <p className="text-gray-600 text-xs">
                  <strong>Use case:</strong> Learning polyalphabetic ciphers, historical cryptography, moderate security needs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">📦 Base64</h3>
                <p className="text-gray-700 text-sm mb-2">
                  Base64 is an encoding scheme, not true encryption. It converts binary data to ASCII text using 64 characters. 
                  It&apos;s reversible without a key and is commonly used for encoding data in URLs, emails, and data transmission.
                </p>
                <p className="text-gray-600 text-xs">
                  <strong>Use case:</strong> Encoding binary data, data transmission, URL encoding, not for security.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Considerations</h2>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Security Notice</h3>
                <p className="text-yellow-800 text-sm">
                  The encryption methods provided in this tool are <strong>educational and basic</strong>. They are NOT suitable 
                  for protecting sensitive or confidential information. These ciphers can be easily broken by modern computers 
                  and should only be used for learning, puzzles, or non-sensitive data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">For Real Security:</h3>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Use modern encryption standards like AES-256 for sensitive data</li>
                  <li>Use HTTPS/TLS for data transmission</li>
                  <li>Use proper key management and secure key exchange</li>
                  <li>Consider using established cryptographic libraries</li>
                  <li>Never implement your own encryption for production systems</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📚 Learning Cryptography</h3>
                <p className="text-gray-700 text-sm">
                  Perfect for students and developers learning about encryption algorithms. Experiment with different methods 
                  to understand how they work.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎮 Puzzles & Games</h3>
                <p className="text-gray-700 text-sm">
                  Create encrypted messages for puzzles, escape rooms, or educational games. Simple ciphers add fun challenges 
                  without requiring complex tools.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💬 Message Obfuscation</h3>
                <p className="text-gray-700 text-sm">
                  Hide spoilers, sensitive information, or create simple encoded messages. Remember: these are not secure for 
                  truly sensitive data.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 Testing & Development</h3>
                <p className="text-gray-700 text-sm">
                  Test how your applications handle encrypted data, verify decryption logic, or create test data with 
                  different encryption methods.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Multiple Methods:</strong> Caesar, ROT13, Atbash, XOR, Vigenère, and Base64 encryption.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Real-time Processing:</strong> Auto-encrypt/decrypt as you type with optional debounce.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Bidirectional:</strong> Encrypt and decrypt with the same tool. Most methods are reversible.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Quick Examples:</strong> Load pre-made examples to see how each method works.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Statistics:</strong> Track original and encrypted text length, and size ratio.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Export Options:</strong> Copy encrypted text or export to a file with full details.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Privacy First:</strong> All encryption happens in your browser. We never see your data.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Are these encryption methods secure?</h3>
                <p className="text-gray-700 text-sm">
                  No, these are basic, educational encryption methods. They can be easily broken and should NOT be used for 
                  protecting sensitive information. For real security, use modern encryption standards like AES-256.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I use the same key for encryption and decryption?</h3>
                <p className="text-gray-700 text-sm">
                  For XOR and Vigenère ciphers, yes - you must use the same key for both encryption and decryption. For Caesar, 
                  ROT13, and Atbash, the process is automatically reversible. Base64 is encoding, not encryption, so no key is needed.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What&apos;s the difference between encryption and encoding?</h3>
                <p className="text-gray-700 text-sm">
                  <strong>Encryption</strong> requires a key and is designed to hide information from unauthorized parties. 
                  <strong>Encoding</strong> (like Base64) is a reversible transformation without a key, used for data format conversion, 
                  not security.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my data stored or transmitted?</h3>
                <p className="text-gray-700 text-sm">
                  No, all encryption and decryption happens entirely in your browser using JavaScript. We never see, store, 
                  or transmit any of your text. Your privacy is completely protected.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Which method should I use?</h3>
                <p className="text-gray-700 text-sm">
                  For learning: start with Caesar cipher. For simple obfuscation: ROT13 or Atbash. For slightly better security: 
                  Vigenère. For encoding (not security): Base64. Remember: none of these are suitable for sensitive data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I encrypt binary data or files?</h3>
                <p className="text-gray-700 text-sm">
                  This tool works with text only. For binary data, you would need to convert it to text first (e.g., using Base64) 
                  or use specialized encryption tools designed for files.
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
