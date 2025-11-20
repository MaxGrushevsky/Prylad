'use client'

import { useState, useCallback } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'
type ConversionMode = 'csv-to-json' | 'json-to-csv'
type Delimiter = ',' | ';' | '\t' | '|'

export default function CSVJSONConverterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<ConversionMode>('csv-to-json')
  const [delimiter, setDelimiter] = useState<Delimiter>(',')
  const [hasHeaders, setHasHeaders] = useState(true)
  const [error, setError] = useState('')
  const [totalConversions, setTotalConversions] = useState(0)

  // SEO data
  const toolPath = '/csv-json-converter'
  const toolName = 'CSV to JSON Converter'
  const category = 'converters'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is CSV to JSON conversion?",
      answer: "CSV to JSON conversion transforms comma-separated values (CSV) data into JavaScript Object Notation (JSON) format. This is useful when you need to work with CSV data in web applications, APIs, or JavaScript code that expects JSON format."
    },
    {
      question: "Can I convert JSON back to CSV?",
      answer: "Yes! Our tool supports bidirectional conversion. You can convert CSV to JSON and JSON back to CSV, making it easy to work with data in either format."
    },
    {
      question: "What delimiters are supported?",
      answer: "Our converter supports multiple delimiters: comma (,), semicolon (;), tab (\\t), and pipe (|). This allows you to work with various CSV formats used in different regions and systems."
    },
    {
      question: "How does header handling work?",
      answer: "When converting CSV to JSON, you can choose whether the first row contains headers. If enabled, headers become object keys in the JSON output. If disabled, rows are converted to arrays."
    },
    {
      question: "Is the CSV to JSON converter free to use?",
      answer: "Yes, absolutely! Our CSV to JSON converter is completely free to use. There are no hidden fees, subscriptions, or usage limits. You can convert as much data as you need."
    },
    {
      question: "Do you store my CSV or JSON data?",
      answer: "No, absolutely not. All conversion happens entirely in your browser. We never see, store, transmit, or have any access to your CSV or JSON data. Your privacy is completely protected."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Choose Conversion Direction",
      text: "Select CSV to JSON to convert CSV data to JSON format, or JSON to CSV to convert JSON back to CSV."
    },
    {
      name: "Configure Settings",
      text: "For CSV to JSON, choose the delimiter (comma, semicolon, tab, or pipe) and whether the first row contains headers."
    },
    {
      name: "Enter Your Data",
      text: "Paste your CSV or JSON data into the input area. The tool will automatically detect the format based on your selection."
    },
    {
      name: "Convert",
      text: "Click Convert or the conversion will happen automatically. The result will appear in the output area."
    },
    {
      name: "Copy or Export",
      text: "Copy the converted data to your clipboard or export it to a file for use in your projects."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Convert CSV to JSON and JSON to CSV",
      "Learn how to convert between CSV and JSON formats using our free online converter tool with support for custom delimiters and header handling.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "CSV to JSON Converter",
      "Free online CSV to JSON and JSON to CSV converter. Convert between CSV and JSON formats with support for custom delimiters and header handling.",
      "https://prylad.pro/csv-json-converter",
      "UtilityApplication"
    )
  ]
  const csvToJSON = useCallback((csv: string, delimiter: Delimiter, headers: boolean): string => {
    try {
      const lines = csv.trim().split('\n').filter(line => line.trim())
      if (lines.length === 0) {
        throw new Error('CSV is empty')
      }

      const rows: string[][] = lines.map(line => {
        // Simple CSV parsing (handles quoted fields)
        const result: string[] = []
        let current = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          const nextChar = line[i + 1]

          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              current += '"'
              i++ // Skip next quote
            } else {
              inQuotes = !inQuotes
            }
          } else if (char === delimiter && !inQuotes) {
            result.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        result.push(current.trim())
        return result
      })

      if (headers) {
        const headerRow = rows[0]
        const dataRows = rows.slice(1)
        
        const json = dataRows.map(row => {
          const obj: Record<string, string> = {}
          headerRow.forEach((header, index) => {
            obj[header || `column${index + 1}`] = row[index] || ''
          })
          return obj
        })
        
        return JSON.stringify(json, null, 2)
      } else {
        // No headers - create array of arrays
        return JSON.stringify(rows, null, 2)
      }
    } catch (e) {
      throw new Error(`CSV parsing error: ${(e as Error).message}`)
    }
  }, [])

  const jsonToCSV = useCallback((json: string, delimiter: Delimiter, headers: boolean): string => {
    try {
      const data = JSON.parse(json)
      
      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array of objects')
      }

      if (data.length === 0) {
        return ''
      }

      const lines: string[] = []
      
      if (headers) {
        // Get all unique keys from all objects
        const allKeys = new Set<string>()
        data.forEach(obj => {
          if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach(key => allKeys.add(key))
          }
        })
        
        const keys = Array.from(allKeys)
        const headerLine = keys.map(key => {
          // Escape quotes and wrap in quotes if contains delimiter or newline
          const escaped = key.replace(/"/g, '""')
          return key.includes(delimiter) || key.includes('\n') ? `"${escaped}"` : escaped
        }).join(delimiter)
        lines.push(headerLine)

        // Add data rows
        data.forEach(obj => {
          if (typeof obj === 'object' && obj !== null) {
            const row = keys.map(key => {
              const value = obj[key] ?? ''
              const strValue = String(value)
              const escaped = strValue.replace(/"/g, '""')
              return strValue.includes(delimiter) || strValue.includes('\n') ? `"${escaped}"` : escaped
            }).join(delimiter)
            lines.push(row)
          }
        })
      } else {
        // No headers - output as arrays
        data.forEach((item: any) => {
          if (Array.isArray(item)) {
            const row = item.map(val => {
              const strValue = String(val ?? '')
              const escaped = strValue.replace(/"/g, '""')
              return strValue.includes(delimiter) || strValue.includes('\n') ? `"${escaped}"` : escaped
            }).join(delimiter)
            lines.push(row)
          } else if (typeof item === 'object' && item !== null) {
            const row = Object.values(item).map(val => {
              const strValue = String(val ?? '')
              const escaped = strValue.replace(/"/g, '""')
              return strValue.includes(delimiter) || strValue.includes('\n') ? `"${escaped}"` : escaped
            }).join(delimiter)
            lines.push(row)
          }
        })
      }

      return lines.join('\n')
    } catch (e) {
      throw new Error(`JSON parsing error: ${(e as Error).message}`)
    }
  }, [])

  const handleConvert = useCallback(() => {
    setError('')
    if (!input.trim()) {
      setError('Please enter data to convert')
      return
    }

    try {
      let result: string
      if (mode === 'csv-to-json') {
        result = csvToJSON(input, delimiter, hasHeaders)
      } else {
        result = jsonToCSV(input, delimiter, hasHeaders)
      }
      
      setOutput(result)
      setTotalConversions(prev => prev + 1)
    } catch (e) {
      const errorMsg = (e as Error).message
      setError(errorMsg)
      setOutput('')
    }
  }, [input, mode, delimiter, hasHeaders, csvToJSON, jsonToCSV, ])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
    }
  }

  const exportToFile = () => {
    if (!output) return
    const extension = mode === 'csv-to-json' ? 'json' : 'csv'
    const mimeType = mode === 'csv-to-json' ? 'application/json' : 'text/csv'
    const blob = new Blob([output], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useKeyboardShortcuts({
    onEnter: handleConvert
  })

  return (
    <Layout
      title="🔄 CSV ↔ JSON Converter"
      description="Convert CSV to JSON and JSON to CSV online. Parse CSV with custom delimiters and handle headers."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            {/* Mode Selection */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="csv-to-json"
                  checked={mode === 'csv-to-json'}
                  onChange={(e) => setMode(e.target.value as ConversionMode)}
                  className="w-4 h-4 accent-primary-600"
                />
                <span className="font-medium text-gray-700 dark:text-gray-300">CSV to JSON</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="json-to-csv"
                  checked={mode === 'json-to-csv'}
                  onChange={(e) => setMode(e.target.value as ConversionMode)}
                  className="w-4 h-4 accent-primary-600"
                />
                <span className="font-medium text-gray-700 dark:text-gray-300">JSON to CSV</span>
              </label>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Delimiter
                </label>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value as Delimiter)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\t">Tab</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasHeaders}
                    onChange={(e) => setHasHeaders(e.target.checked)}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">First row/object contains headers</span>
                </label>
              </div>
            </div>

            {/* Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {mode === 'csv-to-json' ? 'CSV Input' : 'JSON Input'}
                </label>
                <button
                  onClick={() => {
                    setInput('')
                    setOutput('')
                    setError('')
                  }}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 font-medium"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === 'csv-to-json'
                    ? 'name,age,city\nJohn Doe,30,New York\nJane Smith,25,Los Angeles'
                    : '[\n  {"name": "John Doe", "age": 30, "city": "New York"},\n  {"name": "Jane Smith", "age": 25, "city": "Los Angeles"}\n]'
                }
                className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
              )}
              <div className="flex items-center justify-end mt-3">
                <button
                  onClick={handleConvert}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Convert
                </button>
              </div>
            </div>

            {/* Output */}
            {output && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {mode === 'csv-to-json' ? 'JSON Output' : 'CSV Output'}
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
        {totalConversions > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total conversions: <span className="font-semibold text-primary-600">{totalConversions}</span>
            </p>
          </div>
        )}
      </div>

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">CSV vs JSON: Understanding the Formats</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              <strong>CSV (Comma-Separated Values)</strong> is a simple text format used for storing tabular data. 
              Each line represents a row, and values are separated by commas (or other delimiters). CSV is widely 
              used in spreadsheets, databases, and data exchange between applications.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>JSON (JavaScript Object Notation)</strong> is a lightweight data-interchange format that&apos;s 
              easy for humans to read and write, and easy for machines to parse and generate. JSON is the standard 
              format for APIs and modern web applications.
            </p>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📊 Data Migration</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Convert CSV exports from spreadsheets to JSON for use in web applications and APIs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🔄 API Integration</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Transform CSV data into JSON format required by REST APIs and modern web services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📈 Data Analysis</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Convert JSON data to CSV for analysis in Excel, Google Sheets, or data analysis tools.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">💾 Data Storage</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Switch between formats based on storage requirements and application needs.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Best Practices</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Headers:</strong> Always include headers in CSV files for proper JSON key mapping.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Delimiters:</strong> Use commas for standard CSV, but support other delimiters when needed.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Validation:</strong> Validate converted data to ensure accuracy and completeness.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Large Files:</strong> For very large datasets, consider processing in chunks or using specialized tools.</span>
            </li>
          </ul>
        </section>
      </div>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Converter Tools" />
      )}
    </Layout>
  )
}


