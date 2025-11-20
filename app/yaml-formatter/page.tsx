'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'
type IndentSize = 2 | 4
type Action = 'format' | 'minify' | 'validate' | 'toJSON' | 'fromJSON'

interface ValidationResult {
  valid: boolean
  error?: string
  line?: number
}

export default function YAMLFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indentSize, setIndentSize] = useState<IndentSize>(2)
  const [autoFormat, setAutoFormat] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [totalOperations, setTotalOperations] = useState(0)

  // SEO data
  const toolPath = '/yaml-formatter'
  const toolName = 'YAML Formatter'
  const category = 'code'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is YAML formatting?",
      answer: "YAML formatting is the process of adding proper indentation and spacing to YAML documents to make them more readable and easier to maintain. YAML is sensitive to indentation, so proper formatting is essential for valid YAML."
    },
    {
      question: "Can I convert YAML to JSON?",
      answer: "Yes! Our tool can convert YAML to JSON and JSON to YAML. This is useful when working with different configuration formats or when you need to use YAML data in JSON-based systems."
    },
    {
      question: "What is YAML validation?",
      answer: "YAML validation checks if a YAML document is well-formed and syntactically correct. It ensures proper indentation, valid syntax, and correct structure according to YAML specifications."
    },
    {
      question: "What is YAML minification?",
      answer: "YAML minification removes unnecessary whitespace and line breaks to reduce file size. However, YAML is indentation-sensitive, so minification must preserve the structure while removing only redundant whitespace."
    },
    {
      question: "Is the YAML formatter free to use?",
      answer: "Yes, absolutely! Our YAML formatter is completely free to use. There are no hidden fees, subscriptions, or usage limits. You can format, minify, validate, and convert as much YAML as you need."
    },
    {
      question: "Do you store my YAML data?",
      answer: "No, absolutely not. All YAML processing happens entirely in your browser. We never see, store, transmit, or have any access to your YAML data. Your privacy is completely protected."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Paste Your YAML",
      text: "Enter your YAML code into the input area. You can paste YAML from any source or type it directly."
    },
    {
      name: "Choose Action",
      text: "Select Format to beautify YAML, Minify to compress it, Validate to check for errors, or convert to/from JSON."
    },
    {
      name: "Customize Indentation (Format Mode)",
      text: "If formatting, choose your preferred indentation: 2 spaces or 4 spaces. YAML requires consistent indentation."
    },
    {
      name: "Enable Auto-Format (Optional)",
      text: "Turn on auto-format to automatically format YAML as you type for real-time processing."
    },
    {
      name: "Copy or Export",
      text: "Copy the formatted, minified, validated, or converted YAML/JSON to your clipboard for use in your projects."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Format, Minify, and Validate YAML",
      "Learn how to format, minify, validate YAML, and convert between YAML and JSON using our free online YAML formatter tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "YAML Formatter",
      "Free online YAML formatter, minifier, validator, and converter. Format YAML with proper indentation, minify for production, validate structure, or convert to/from JSON.",
      "https://prylad.pro/yaml-formatter",
      "UtilityApplication"
    )
  ]
  const getIndent = useCallback((level: number): string => {
    return ' '.repeat(indentSize * level)
  }, [indentSize])

  // Simple YAML formatting (basic implementation)
  const formatYAML = useCallback((yamlString: string, indent: IndentSize): string => {
    try {
      const lines = yamlString.split('\n')
      const formatted: string[] = []
      let indentLevel = 0
      const indentValue = indent

      lines.forEach((line, index) => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) {
          // Empty line or comment
          formatted.push(trimmed)
          return
        }

        // Check for list items
        if (trimmed.startsWith('-')) {
          formatted.push(getIndent(indentLevel) + trimmed)
          return
        }

        // Check for key-value pairs
        if (trimmed.includes(':')) {
          const colonIndex = trimmed.indexOf(':')
          const key = trimmed.substring(0, colonIndex).trim()
          const value = trimmed.substring(colonIndex + 1).trim()

          // Check if next line is indented (nested)
          const nextLine = lines[index + 1]
          const isNested = nextLine && nextLine.trim().startsWith('-') || 
                          (nextLine && nextLine.trim().includes(':') && 
                           nextLine.indexOf(':') > colonIndex + 1)

          if (isNested && value === '') {
            formatted.push(getIndent(indentLevel) + key + ':')
            indentLevel++
          } else {
            formatted.push(getIndent(indentLevel) + key + ': ' + value)
          }
        } else {
          formatted.push(getIndent(indentLevel) + trimmed)
        }
      })

      return formatted.join('\n')
    } catch (e) {
      throw new Error('Failed to format YAML')
    }
  }, [getIndent])

  const minifyYAML = useCallback((yamlString: string): string => {
    try {
      // Remove comments and empty lines
      let minified = yamlString
        .split('\n')
        .filter(line => {
          const trimmed = line.trim()
          return trimmed && !trimmed.startsWith('#')
        })
        .join(' ')
      
      // Remove extra spaces
      minified = minified.replace(/\s+/g, ' ').trim()
      return minified
    } catch (e) {
      throw new Error('Failed to minify YAML')
    }
  }, [])

  const validateYAML = useCallback((yamlString: string): ValidationResult => {
    try {
      if (!yamlString.trim()) {
        return { valid: false, error: 'YAML is empty' }
      }

      // Try to parse as JSON first (YAML is a superset of JSON)
      try {
        JSON.parse(yamlString)
        return { valid: true }
      } catch {
        // Not JSON, try basic YAML validation
        const lines = yamlString.split('\n')
        let indentStack: number[] = [0]
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          const trimmed = line.trim()
          
          if (!trimmed || trimmed.startsWith('#')) continue
          
          // Check for proper indentation
          const leadingSpaces = line.length - line.trimStart().length
          const lastIndent = indentStack[indentStack.length - 1]
          
          if (leadingSpaces > lastIndent + 2) {
            return {
              valid: false,
              error: `Inconsistent indentation at line ${i + 1}`,
              line: i + 1
            }
          }
          
          if (trimmed.includes(':')) {
            indentStack.push(leadingSpaces)
          }
        }
        
        return { valid: true }
      }
    } catch (e) {
      return {
        valid: false,
        error: (e as Error).message || 'Invalid YAML structure',
        line: 1
      }
    }
  }, [])

  const convertToJSON = useCallback((yamlString: string): string => {
    try {
      // Simple YAML to JSON conversion (basic implementation)
      // For production, use a proper YAML parser library
      const obj: any = {}
      const lines = yamlString.split('\n')
      
      lines.forEach(line => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return
        
        if (trimmed.includes(':')) {
          const colonIndex = trimmed.indexOf(':')
          const key = trimmed.substring(0, colonIndex).trim()
          const value = trimmed.substring(colonIndex + 1).trim()
          
          // Try to parse value
          let parsedValue: any = value
          if (value === 'true') parsedValue = true
          else if (value === 'false') parsedValue = false
          else if (value === 'null' || value === '~') parsedValue = null
          else if (/^\d+$/.test(value)) parsedValue = parseInt(value, 10)
          else if (/^\d+\.\d+$/.test(value)) parsedValue = parseFloat(value)
          else if (value.startsWith('"') && value.endsWith('"')) {
            parsedValue = value.slice(1, -1)
          }
          
          obj[key] = parsedValue
        }
      })
      
      return JSON.stringify(obj, null, 2)
    } catch (e) {
      throw new Error('Failed to convert YAML to JSON')
    }
  }, [])

  const convertFromJSON = useCallback((jsonString: string): string => {
    try {
      const obj = JSON.parse(jsonString)
      
      const convertObject = (obj: any, indent: number = 0): string => {
        const indentStr = ' '.repeat(indentSize * indent)
        const lines: string[] = []
        
        for (const [key, value] of Object.entries(obj)) {
          if (value === null || value === undefined) {
            lines.push(`${indentStr}${key}: null`)
          } else if (Array.isArray(value)) {
            lines.push(`${indentStr}${key}:`)
            value.forEach(item => {
              if (typeof item === 'object' && item !== null) {
                lines.push(`${indentStr}  -`)
                lines.push(convertObject(item, indent + 2).split('\n').map(l => indentStr + '    ' + l.trim()).join('\n'))
              } else {
                lines.push(`${indentStr}  - ${item}`)
              }
            })
          } else if (typeof value === 'object') {
            lines.push(`${indentStr}${key}:`)
            lines.push(convertObject(value, indent + 1))
          } else {
            lines.push(`${indentStr}${key}: ${value}`)
          }
        }
        
        return lines.join('\n')
      }
      
      return convertObject(obj)
    } catch (e) {
      throw new Error('Failed to convert JSON to YAML')
    }
  }, [indentSize])

  const format = useCallback(() => {
    setError('')
    setIsValid(null)
    if (!input.trim()) {
      setError('Please enter YAML to format')
      return
    }
    try {
      const formatted = formatYAML(input, indentSize)
      setOutput(formatted)
      setIsValid(true)
      setTotalOperations(prev => prev + 1)
    } catch (e) {
      const errorMsg = (e as Error).message
      setError(`Format error: ${errorMsg}`)
      setOutput('')
      setIsValid(false)
    }
  }, [input, indentSize, formatYAML, ])

  const minify = useCallback(() => {
    setError('')
    setIsValid(null)
    if (!input.trim()) {
      setError('Please enter YAML to minify')
      return
    }
    try {
      const minified = minifyYAML(input)
      setOutput(minified)
      setIsValid(true)
      setTotalOperations(prev => prev + 1)
    } catch (e) {
      const errorMsg = (e as Error).message
      setError(`Minify error: ${errorMsg}`)
      setOutput('')
      setIsValid(false)
    }
  }, [input, minifyYAML, ])

  const validate = useCallback(() => {
    setError('')
    if (!input.trim()) {
      setError('Please enter YAML to validate')
      setIsValid(null)
      return
    }
    const result = validateYAML(input)
    if (result.valid) {
      setIsValid(true)
      setError('')
    } else {
      setIsValid(false)
      const errorMsg = result.line 
        ? `Line ${result.line}: ${result.error}`
        : result.error || 'Invalid YAML'
      setError(errorMsg)
    }
    setTotalOperations(prev => prev + 1)
  }, [input, validateYAML, ])

  const toJSON = useCallback(() => {
    setError('')
    setIsValid(null)
    if (!input.trim()) {
      setError('Please enter YAML to convert')
      return
    }
    try {
      const json = convertToJSON(input)
      setOutput(json)
      setIsValid(true)
      setTotalOperations(prev => prev + 1)
    } catch (e) {
      const errorMsg = (e as Error).message
      setError(`Conversion error: ${errorMsg}`)
      setOutput('')
      setIsValid(false)
    }
  }, [input, convertToJSON, ])

  const fromJSON = useCallback(() => {
    setError('')
    setIsValid(null)
    if (!input.trim()) {
      setError('Please enter JSON to convert')
      return
    }
    try {
      const yaml = convertFromJSON(input)
      setOutput(yaml)
      setIsValid(true)
      setTotalOperations(prev => prev + 1)
    } catch (e) {
      const errorMsg = (e as Error).message
      setError(`Conversion error: ${errorMsg}`)
      setOutput('')
      setIsValid(false)
    }
  }, [input, convertFromJSON, ])

  // Auto-format on input change
  useEffect(() => {
    if (autoFormat && input.trim()) {
      const timer = setTimeout(() => {
        format()
      }, 500)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, autoFormat, indentSize])

  // Auto-validate on input change
  useEffect(() => {
    if (input.trim()) {
      const result = validateYAML(input)
      setIsValid(result.valid)
      if (!result.valid && input.length > 0) {
        const errorMsg = result.line 
          ? `Line ${result.line}: ${result.error}`
          : result.error || 'Invalid YAML'
        setError(errorMsg)
      } else {
        setError('')
      }
    } else {
      setIsValid(null)
      setError('')
    }
  }, [input, validateYAML])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
    }
  }

  const exportToFile = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.yaml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useKeyboardShortcuts({
    onEnter: format
  })

  return (
    <Layout
      title="📝 YAML Formatter"
      description="Format, minify, and validate YAML online. Convert YAML to JSON and back. Auto-format with proper indentation."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Indent Size
                </label>
                <select
                  value={indentSize}
                  onChange={(e) => setIndentSize(parseInt(e.target.value) as IndentSize)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoFormat}
                    onChange={(e) => setAutoFormat(e.target.checked)}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-format</span>
                </label>
              </div>
            </div>

            {/* Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  YAML Input
                </label>
                <div className="flex items-center gap-2">
                  {isValid === true && (
                    <span className="text-xs text-green-600 font-medium">✓ Valid</span>
                  )}
                  {isValid === false && (
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">✗ Invalid</span>
                  )}
                  <button
                    onClick={() => setInput('')}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="name: John Doe\nage: 30\ncity: New York"
                className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
              )}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <button
                  onClick={format}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Format
                </button>
                <button
                  onClick={minify}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Minify
                </button>
                <button
                  onClick={validate}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Validate
                </button>
                <button
                  onClick={toJSON}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  To JSON
                </button>
                <button
                  onClick={fromJSON}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  From JSON
                </button>
              </div>
            </div>

            {/* Output */}
            {output && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Output
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(output)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Copy
                    </button>
                    <button
                      onClick={exportToFile}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Export
                    </button>
                  </div>
                </div>
                <pre className="bg-gray-50 dark:bg-gray-800 border border-gray-200 rounded-lg p-4 overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                  {output}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {totalOperations > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total operations: <span className="font-semibold text-primary-600">{totalOperations}</span>
            </p>
          </div>
        )}
      </div>

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is YAML?</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            YAML (YAML Ain&apos;t Markup Language) is a human-readable data serialization standard. It&apos;s commonly 
            used for configuration files, data exchange, and storing structured data. YAML emphasizes readability 
            and simplicity, using indentation to represent structure.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            YAML is widely used in DevOps, CI/CD pipelines, container orchestration (Docker Compose, Kubernetes), 
            and modern application configuration. It&apos;s more readable than JSON and more flexible than XML.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🐳 Docker Compose</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Format Docker Compose files for multi-container Docker applications and services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">☸️ Kubernetes</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Format Kubernetes manifests and configuration files for container orchestration.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">⚙️ CI/CD Pipelines</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Format GitHub Actions, GitLab CI, and other CI/CD pipeline configuration files.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📝 Configuration</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Format application configuration files for web frameworks and development tools.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Best Practices</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Indentation:</strong> Use spaces (not tabs) for indentation. Standard is 2 spaces per level.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Validation:</strong> Always validate YAML syntax before deploying to catch errors early.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Consistency:</strong> Maintain consistent formatting across all YAML files in your project.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Comments:</strong> Use comments to document complex configurations and explain non-obvious settings.</span>
            </li>
          </ul>
        </section>
      </div>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Code Tools" />
      )}
    </Layout>
  )
}


