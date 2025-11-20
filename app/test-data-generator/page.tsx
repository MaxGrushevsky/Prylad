'use client'

import { useState, useCallback, useMemo } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'
type DataType = 'name' | 'email' | 'phone' | 'address' | 'date' | 'number' | 'text' | 'uuid' | 'url' | 'ip'
type OutputFormat = 'json' | 'csv' | 'sql'

interface Field {
  id: string
  name: string
  type: DataType
  options?: Record<string, any>
}

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'Robert', 'Olivia']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
const domains = ['example.com', 'test.com', 'demo.com', 'sample.org', 'mock.net']
const streets = ['Main St', 'Oak Ave', 'Park Rd', 'Elm St', 'Maple Dr', 'Cedar Ln', 'Pine St', 'First Ave']
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego']

const generateData = (type: DataType, count: number, options?: Record<string, any>): any[] => {
  const data: any[] = []
  
  for (let i = 0; i < count; i++) {
    switch (type) {
      case 'name':
        data.push(`${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`)
        break
      case 'email': {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase()
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)].toLowerCase()
        const emailDomain = domains[Math.floor(Math.random() * domains.length)]
        data.push(`${firstName}.${lastName}@${emailDomain}`)
        break
      }
      case 'phone':
        data.push(`+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`)
        break
      case 'address':
        const streetNum = Math.floor(Math.random() * 9999) + 1
        const street = streets[Math.floor(Math.random() * streets.length)]
        const city = cities[Math.floor(Math.random() * cities.length)]
        const zip = Math.floor(Math.random() * 90000) + 10000
        data.push(`${streetNum} ${street}, ${city}, ${zip}`)
        break
      case 'date':
        const start = options?.startDate ? new Date(options.startDate).getTime() : new Date('2020-01-01').getTime()
        const end = options?.endDate ? new Date(options.endDate).getTime() : Date.now()
        const randomTime = start + Math.random() * (end - start)
        data.push(new Date(randomTime).toISOString().split('T')[0])
        break
      case 'number':
        const min = options?.min ?? 0
        const max = options?.max ?? 100
        data.push(Math.floor(Math.random() * (max - min + 1)) + min)
        break
      case 'text': {
        const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt']
        const wordCount = options?.wordCount ?? 5
        const textWords: string[] = []
        for (let j = 0; j < wordCount; j++) {
          textWords.push(words[Math.floor(Math.random() * words.length)])
        }
        data.push(textWords.join(' '))
        break
      }
      case 'uuid':
        data.push('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0
          const v = c === 'x' ? r : (r & 0x3 | 0x8)
          return v.toString(16)
        }))
        break
      case 'url': {
        const protocol = Math.random() > 0.5 ? 'https' : 'http'
        const urlDomain = domains[Math.floor(Math.random() * domains.length)]
        const urlWords = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt']
        const path = Math.random() > 0.5 ? `/${urlWords[Math.floor(Math.random() * urlWords.length)]}` : ''
        data.push(`${protocol}://${urlDomain}${path}`)
        break
      }
      case 'ip':
        data.push(`${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`)
        break
    }
  }
  
  return data
}

export default function TestDataGeneratorPage() {
  const [fields, setFields] = useState<Field[]>([
    { id: '1', name: 'id', type: 'number', options: { min: 1, max: 1000 } },
    { id: '2', name: 'name', type: 'name' },
    { id: '3', name: 'email', type: 'email' }
  ])
  const [rowCount, setRowCount] = useState(10)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('json')
  const generatedData = useMemo(() => {
    const rows: Record<string, any>[] = []
    
    for (let i = 0; i < rowCount; i++) {
      const row: Record<string, any> = {}
      fields.forEach(field => {
        const values = generateData(field.type, 1, field.options)
        row[field.name] = values[0]
      })
      rows.push(row)
    }
    
    return rows
  }, [fields, rowCount])

  const output = useMemo(() => {
    switch (outputFormat) {
      case 'json':
        return JSON.stringify(generatedData, null, 2)
      case 'csv':
        if (generatedData.length === 0) return ''
        const headers = Object.keys(generatedData[0])
        const csvRows = [
          headers.join(','),
          ...generatedData.map(row => 
            headers.map(header => {
              const value = row[header]
              return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
            }).join(',')
          )
        ]
        return csvRows.join('\n')
      case 'sql':
        if (generatedData.length === 0) return ''
        const tableName = 'test_data'
        const columns = Object.keys(generatedData[0])
        const sqlRows = generatedData.map(row => {
          const values = columns.map(col => {
            const value = row[col]
            if (typeof value === 'string') {
              return `'${value.replace(/'/g, "''")}'`
            }
            return value
          })
          return `(${values.join(', ')})`
        })
        return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n${sqlRows.join(',\n')};`
      default:
        return ''
    }
  }, [generatedData, outputFormat])

  const addField = () => {
    const newField: Field = {
      id: Date.now().toString(),
      name: `field_${fields.length + 1}`,
      type: 'text'
    }
    setFields([...fields, newField])
  }

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
  }

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output)
    } catch (err) {
      // Silent fail
    }
  }

  // SEO data
  const toolPath = '/test-data-generator'
  const toolName = 'Test Data Generator'
  const category = 'generator'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is a test data generator?",
      answer: "A test data generator creates fake or mock data for software development and testing. It generates realistic-looking data like names, emails, addresses, phone numbers, dates, and more without using real personal information."
    },
    {
      question: "What types of data can I generate?",
      answer: "You can generate: Names (first and last), Emails, Phone numbers, Addresses (street, city, state, zip), Dates, Numbers (integers or decimals), Text (random strings), UUIDs, URLs, and IP addresses."
    },
    {
      question: "How do I generate test data?",
      answer: "Add fields to your data structure, select the data type for each field, configure options (like min/max for numbers, format for dates), set the number of rows, and click 'Generate'. The data is created instantly."
    },
    {
      question: "What output formats are supported?",
      answer: "Three formats: JSON (JavaScript Object Notation), CSV (Comma-Separated Values), and SQL (INSERT statements). Choose the format that works best for your project."
    },
    {
      question: "Can I customize the generated data?",
      answer: "Yes! Each field type has options: numbers have min/max ranges, dates have format options, text has length options, and more. Configure each field to match your testing needs."
    },
    {
      question: "Is the test data generator free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All data generation happens in your browser - we never see or store your generated data."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Add Fields",
      text: "Click 'Add Field' to add a new field to your data structure. Give it a name and select the data type (name, email, phone, address, date, number, text, UUID, URL, or IP)."
    },
    {
      name: "Configure Field Options",
      text: "Set options for each field: for numbers (min/max), for dates (format), for text (length), etc. Each data type has specific customization options."
    },
    {
      name: "Set Row Count",
      text: "Enter the number of rows you want to generate. You can generate anywhere from 1 to 10,000 rows of test data."
    },
    {
      name: "Choose Output Format",
      text: "Select output format: JSON (for APIs and JavaScript), CSV (for spreadsheets), or SQL (for database inserts)."
    },
    {
      name: "Generate and Export",
      text: "Click 'Generate' to create the test data. Preview the results, then copy or download the data in your chosen format."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Generate Test Data",
      "Learn how to generate test data for development and testing using our free online test data generator tool.",
      howToSteps,
      "PT3M"
    ),
    generateSoftwareApplicationSchema(
      "Test Data Generator",
      "Free online test data generator. Create fake names, emails, addresses, phone numbers, dates, and more. Export to JSON, CSV, or SQL. Perfect for software development and testing.",
      "https://prylad.pro/test-data-generator",
      "UtilityApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🧪 Test Data Generator"
        description="Generate test data for development and testing. Create fake names, emails, addresses, phone numbers, dates, and more."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Number of Rows: {rowCount}
                </label>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={rowCount}
                  onChange={(e) => setRowCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1</span>
                  <span>1000</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="sql">SQL</option>
                </select>
              </div>
            </div>

            {/* Fields */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Fields
                </label>
                <button
                  onClick={addField}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  + Add Field
                </button>
              </div>
              <div className="space-y-2">
                {fields.map((field) => (
                  <div key={field.id} className="flex gap-2 items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(field.id, { name: e.target.value })}
                      placeholder="Field name"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value as DataType })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="name">Name</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="address">Address</option>
                      <option value="date">Date</option>
                      <option value="number">Number</option>
                      <option value="text">Text</option>
                      <option value="uuid">UUID</option>
                      <option value="url">URL</option>
                      <option value="ip">IP Address</option>
                    </select>
                    {field.type === 'number' && (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={field.options?.min ?? 0}
                          onChange={(e) => updateField(field.id, { options: { ...field.options, min: parseInt(e.target.value) || 0 } })}
                          placeholder="Min"
                          className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                        <input
                          type="number"
                          value={field.options?.max ?? 100}
                          onChange={(e) => updateField(field.id, { options: { ...field.options, max: parseInt(e.target.value) || 100 } })}
                          placeholder="Max"
                          className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    )}
                    {field.type === 'text' && (
                      <input
                        type="number"
                        value={field.options?.wordCount ?? 5}
                        onChange={(e) => updateField(field.id, { options: { ...field.options, wordCount: parseInt(e.target.value) || 5 } })}
                        placeholder="Word count"
                        className="w-24 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      />
                    )}
                    {field.type === 'date' && (
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={field.options?.startDate ?? ''}
                          onChange={(e) => updateField(field.id, { options: { ...field.options, startDate: e.target.value } })}
                          placeholder="Start date"
                          className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                        <input
                          type="date"
                          value={field.options?.endDate ?? ''}
                          onChange={(e) => updateField(field.id, { options: { ...field.options, endDate: e.target.value } })}
                          placeholder="End date"
                          className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => removeField(field.id)}
                      className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 font-medium text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Generated Data ({outputFormat.toUpperCase()})
                </label>
                <button
                  onClick={copyToClipboard}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Copy
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto max-h-96 overflow-y-auto">
                  <code>{output}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 mt-10">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-white mb-4">How to Generate Test Data</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>Choose the number of rows you want to generate (1–1000).</li>
            <li>Add or customize fields: names, emails, phones, addresses, dates, numbers, etc.</li>
            <li>Switch between JSON, CSV, or SQL output depending on your use case.</li>
            <li>Copy the generated dataset or export it into your QA scripts and seed files.</li>
          </ol>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Tip: Rename fields to match your database schema (e.g., <code className="font-mono">first_name</code>, <code className="font-mono">created_at</code>).
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-white mb-4">Supported Field Types</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 dark:text-white mb-2">Personal Data</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Full names, emails, phone numbers</li>
                <li>Street addresses, cities, postal codes</li>
                <li>Dates with start/end range and ISO format</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 dark:text-white mb-2">Technical Fields</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Random numbers with min/max range</li>
                <li>UUIDs, URLs, IP addresses</li>
                <li>Short text snippets with configurable word counts</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-white mb-4">Best Practices for Mock Data</h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed list-disc list-inside">
            <li>Keep personally identifiable information fake to avoid compliance issues.</li>
            <li>Generate edge cases: long strings, high/low numbers, dates in the future/past.</li>
            <li>Store reusable datasets in version control to keep QA runs deterministic.</li>
            <li>Use SQL export to seed local databases quickly during onboarding.</li>
          </ul>
        </section>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Generator Tools" />
      )}
    </Layout>
    </>
  )
}

