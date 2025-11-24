'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import Tooltip from '@/components/Tooltip'
import HelpPanel from '@/components/HelpPanel'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'
import { JSONPath } from 'jsonpath-plus'

type Mode = 'advanced' | 'visual'

interface JSONTreeNode {
  key: string | number
  value: any
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  path: string
  children?: JSONTreeNode[]
  expanded?: boolean
  selected?: boolean
}

export default function JSONPathQueryPage() {
  const [mode, setMode] = useState<Mode>('advanced')
  const [jsonInput, setJsonInput] = useState('')
  const [jsonPathQuery, setJsonPathQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [parsedJson, setParsedJson] = useState<any>(null)
  const [selectedPaths, setSelectedPaths] = useState<string[]>([])
  const [totalQueries, setTotalQueries] = useState(0)
  const [queryHistory, setQueryHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const jsonPathInputRef = useRef<HTMLInputElement>(null)

  // SEO data
  const toolPath = '/json-path-query'
  const toolName = 'JSONPath Query Tool'
  const category = 'code'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is JSONPath?",
      answer: "JSONPath is a query language for JSON, similar to XPath for XML. It allows you to extract specific data from JSON structures using path expressions. JSONPath is widely used in API testing, data extraction, and JSON processing."
    },
    {
      question: "Is this tool free to use?",
      answer: "Yes, absolutely! Our JSONPath query tool is completely free to use. All processing happens in your browser, so your data never leaves your device. No registration, no limits, no hidden fees."
    },
    {
      question: "Do I need to know JSONPath syntax?",
      answer: "No! We provide two modes: Visual mode for beginners (click to select elements) and Advanced mode for those familiar with JSONPath syntax. The visual mode automatically generates JSONPath expressions as you click through the JSON tree."
    },
    {
      question: "What JSONPath expressions are supported?",
      answer: "We support standard JSONPath expressions including: $ (root), . (child), .. (recursive), * (wildcard), [] (array index), [?()] (filters), and more. The tool uses jsonpath-plus library which supports the full JSONPath specification."
    },
    {
      question: "Can I query nested JSON structures?",
      answer: "Yes! JSONPath supports deep nesting. Use .. for recursive descent or specify the full path like $.users[0].address.city. You can navigate through any level of nesting in your JSON structure."
    },
    {
      question: "How do I filter JSON data with conditions?",
      answer: "Use filter expressions like $[?(@.price > 10)] to filter array elements based on conditions. You can use comparison operators (>, <, ==, !=) and logical operators (&&, ||) in filter expressions."
    },
    {
      question: "Can I extract multiple values at once?",
      answer: "Yes! You can use wildcards like $.* to get all keys, $[*] to get all array elements, or combine multiple paths separated by commas. The results will show all matching values."
    },
    {
      question: "Is my JSON data secure?",
      answer: "Absolutely! All processing happens entirely in your browser. Your JSON data is never sent to any server, stored, or transmitted. We have no access to your data - it stays completely private on your device."
    },
    {
      question: "What's the difference between Visual and Advanced mode?",
      answer: "Visual mode lets you click through the JSON tree to build queries without knowing JSONPath syntax. Advanced mode allows you to write JSONPath expressions directly for more control and complex queries."
    },
    {
      question: "Can I use this tool with large JSON files?",
      answer: "Yes, but very large files (over 10MB) may affect performance. The tool works best with JSON files under 5MB. For extremely large files, consider processing them in chunks."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Enter JSON Data",
      text: "Paste or type your JSON data into the input area. The tool will automatically parse and validate it."
    },
    {
      name: "Choose Mode",
      text: "Select Visual mode to click through the JSON tree, or Advanced mode to write JSONPath expressions directly."
    },
    {
      name: "Build Query",
      text: "In Visual mode, click elements to build your path. In Advanced mode, type your JSONPath expression (e.g., $.users[*].name)."
    },
    {
      name: "Execute Query",
      text: "Click 'Execute Query' or press Enter to run your JSONPath expression and see the results."
    },
    {
      name: "View Results",
      text: "The matching elements will be displayed in the results area. You can copy or export the results."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Query JSON with JSONPath",
      "Learn how to extract and query JSON data using JSONPath expressions with our free online tool.",
      howToSteps,
      "PT3M"
    ),
    generateSoftwareApplicationSchema(
      "JSONPath Query Tool",
      "Free online JSONPath query tool with visual tree selector and advanced JSONPath syntax support.",
      "https://prylad.pro/json-path-query",
      "UtilityApplication"
    )
  ]

  // Parse JSON input
  useEffect(() => {
    if (!jsonInput.trim()) {
      setParsedJson(null)
      setJsonError('')
      return
    }

    try {
      const parsed = JSON.parse(jsonInput)
      setParsedJson(parsed)
      setJsonError('')
    } catch (e) {
      setJsonError((e as Error).message)
      setParsedJson(null)
    }
  }, [jsonInput])

  // Build JSON tree structure
  const buildJSONTree = useCallback((data: any, path: string = '$'): JSONTreeNode[] => {
    if (data === null || data === undefined) {
      return [{
        key: 'null',
        value: null,
        type: 'null',
        path,
        expanded: false
      }]
    }

    if (Array.isArray(data)) {
      return data.map((item, index) => {
        const itemPath = `${path}[${index}]`
        const node: JSONTreeNode = {
          key: index,
          value: item,
          type: Array.isArray(item) ? 'array' : typeof item === 'object' && item !== null ? 'object' : typeof item as any,
          path: itemPath,
          expanded: false,
          selected: selectedPaths.includes(itemPath)
        }

        if (typeof item === 'object' && item !== null) {
          node.children = buildJSONTree(item, itemPath)
        }

        return node
      })
    }

    if (typeof data === 'object') {
      return Object.entries(data).map(([key, value]) => {
        const itemPath = `${path}.${key}`
        const node: JSONTreeNode = {
          key,
          value,
          type: Array.isArray(value) ? 'array' : typeof value === 'object' && value !== null ? 'object' : typeof value as any,
          path: itemPath,
          expanded: false,
          selected: selectedPaths.includes(itemPath)
        }

        if (typeof value === 'object' && value !== null) {
          node.children = buildJSONTree(value, itemPath)
        }

        return node
      })
    }

    return []
  }, [selectedPaths])

  const jsonTree = useMemo(() => {
    if (!parsedJson) return []
    return buildJSONTree(parsedJson)
  }, [parsedJson, buildJSONTree])

  // Load query history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jsonpath-query-history')
      if (saved) {
        const history = JSON.parse(saved)
        setQueryHistory(history.slice(0, 20)) // Keep last 20 queries
      }
    } catch (e) {
      // Ignore errors
    }
  }, [])

  // Execute JSONPath query
  const executeQuery = useCallback(() => {
    setError('')
    setResults([])

    if (!parsedJson) {
      setError('Please enter valid JSON first')
      return
    }

    if (!jsonPathQuery.trim()) {
      setError('Please enter a JSONPath expression')
      return
    }

    try {
      const result = JSONPath({ path: jsonPathQuery, json: parsedJson })
      setResults(result)
      setTotalQueries(prev => prev + 1)
      
      // Save to history
      setQueryHistory(prev => {
        const newHistory = [jsonPathQuery, ...prev.filter(q => q !== jsonPathQuery)].slice(0, 20)
        try {
          localStorage.setItem('jsonpath-query-history', JSON.stringify(newHistory))
        } catch (e) {
          // Ignore errors
        }
        return newHistory
      })
    } catch (e) {
      setError((e as Error).message)
      setResults([])
    }
  }, [parsedJson, jsonPathQuery])

  // Build path from visual selection
  const buildPathFromSelection = useCallback(() => {
    if (selectedPaths.length === 0) {
      setJsonPathQuery('')
      return
    }

    if (selectedPaths.length === 1) {
      setJsonPathQuery(selectedPaths[0])
    } else {
      // Multiple paths - combine with comma
      setJsonPathQuery(selectedPaths.join(', '))
    }
  }, [selectedPaths])

  useEffect(() => {
    if (mode === 'visual') {
      buildPathFromSelection()
    }
  }, [selectedPaths, mode, buildPathFromSelection])

  // Toggle path selection
  const togglePathSelection = useCallback((path: string) => {
    setSelectedPaths(prev => {
      if (prev.includes(path)) {
        return prev.filter(p => p !== path)
      } else {
        return [...prev, path]
      }
    })
  }, [])

  // Quick action buttons
  const addPathOperation = useCallback((operation: string) => {
    if (!jsonPathQuery) {
      setJsonPathQuery(operation)
      return
    }

    // Append operation to current query
    setJsonPathQuery(prev => {
      if (prev.endsWith(']') || prev.endsWith('}')) {
        return prev + operation
      } else if (prev.endsWith('.')) {
        return prev + operation
      } else {
        return prev + operation
      }
    })
  }, [jsonPathQuery])

  // Load example
  const loadExample = useCallback(() => {
    const example = {
      "store": {
        "book": [
          {
            "category": "reference",
            "author": "Nigel Rees",
            "title": "Sayings of the Century",
            "price": 8.95
          },
          {
            "category": "fiction",
            "author": "Evelyn Waugh",
            "title": "Sword of Honour",
            "price": 12.99
          },
          {
            "category": "fiction",
            "author": "Herman Melville",
            "title": "Moby Dick",
            "price": 8.99
          }
        ],
        "bicycle": {
          "color": "red",
          "price": 19.95
        }
      }
    }
    setJsonInput(JSON.stringify(example, null, 2))
    setJsonPathQuery('$.store.book[*].author')
    setSelectedPaths([])
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Failed to copy
    }
  }

  const exportResults = () => {
    if (results.length === 0) return
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `jsonpath-results-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setJsonInput('')
    setJsonPathQuery('')
    setResults([])
    setError('')
    setSelectedPaths([])
  }

  useKeyboardShortcuts({
    onEnter: executeQuery,
    onClear: clearAll
  })

  // Help content for HelpPanel
  const helpContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">JSONPath Syntax Guide</h3>
        <div className="space-y-3 text-sm">
          <div>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">$</code>
            <span className="ml-2 text-gray-700 dark:text-gray-300">Root element of JSON</span>
          </div>
          <div>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">.key</code>
            <span className="ml-2 text-gray-700 dark:text-gray-300">Child element with key &quot;key&quot;</span>
          </div>
          <div>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">.*</code>
            <span className="ml-2 text-gray-700 dark:text-gray-300">All children of current element</span>
          </div>
          <div>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">[n]</code>
            <span className="ml-2 text-gray-700 dark:text-gray-300">Array element at index n</span>
          </div>
          <div>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">[*]</code>
            <span className="ml-2 text-gray-700 dark:text-gray-300">All array elements</span>
          </div>
          <div>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">[start:end]</code>
            <span className="ml-2 text-gray-700 dark:text-gray-300">Array slice from start to end</span>
          </div>
          <div>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">..key</code>
            <span className="ml-2 text-gray-700 dark:text-gray-300">Recursive search for key</span>
          </div>
          <div>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">[?(@.key == &apos;value&apos;)]</code>
            <span className="ml-2 text-gray-700 dark:text-gray-300">Filter by condition</span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Examples</h3>
        <div className="space-y-2 text-sm">
          <div>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono block mb-1">$.users[*].name</code>
            <span className="text-gray-600 dark:text-gray-400">Get all names from users array</span>
          </div>
          <div>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono block mb-1">$..price</code>
            <span className="text-gray-600 dark:text-gray-400">Get all prices recursively</span>
          </div>
          <div>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono block mb-1">$.store.book[?(@.price &lt; 10)]</code>
            <span className="text-gray-600 dark:text-gray-400">Get books with price less than 10</span>
          </div>
          <div>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono block mb-1">$.*</code>
            <span className="text-gray-600 dark:text-gray-400">Get all root-level keys</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🔍 JSONPath Query Tool"
        description="Query and extract data from JSON using JSONPath expressions. Visual tree selector and advanced JSONPath syntax. Free online tool."
        breadcrumbs={breadcrumbs}
        helpContent={helpContent}
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="space-y-6">
              {/* Mode Toggle */}
              <div className="flex gap-3 flex-wrap">
                <Tooltip content="Write JSONPath expressions directly. Best for experienced users.">
                  <button
                    onClick={() => setMode('advanced')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      mode === 'advanced'
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Advanced Mode
                  </button>
                </Tooltip>
                <Tooltip content="Click through JSON tree to build queries. Perfect for beginners.">
                  <button
                    onClick={() => setMode('visual')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      mode === 'visual'
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Visual Mode
                  </button>
                </Tooltip>
                <Tooltip content="Load a sample JSON with example data to get started">
                  <button
                    onClick={loadExample}
                    className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    Load Example
                  </button>
                </Tooltip>
              </div>

              {/* JSON Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    JSON Input:
                  </label>
                  {jsonError && (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      Invalid JSON
                    </span>
                  )}
                </div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className={`w-full h-64 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                    jsonError ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
                  }`}
                  placeholder='{"users": [{"name": "John", "age": 30}]}'
                />
                {jsonError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{jsonError}</p>
                )}
              </div>

              {/* Advanced Mode */}
              {mode === 'advanced' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        JSONPath Expression:
                      </label>
                      {queryHistory.length > 0 && (
                        <button
                          onClick={() => setShowHistory(!showHistory)}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          {showHistory ? 'Hide' : 'Show'} History ({queryHistory.length})
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          ref={jsonPathInputRef}
                          type="text"
                          value={jsonPathQuery}
                          onChange={(e) => setJsonPathQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && executeQuery()}
                          onFocus={() => setShowHistory(false)}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          placeholder="$.users[*].name"
                        />
                        {showHistory && queryHistory.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {queryHistory.map((query, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setJsonPathQuery(query)
                                  setShowHistory(false)
                                  jsonPathInputRef.current?.focus()
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-mono text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 last:border-0"
                              >
                                {query}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <Tooltip content="Execute JSONPath query (Enter)">
                        <button
                          onClick={executeQuery}
                          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                        >
                          Execute
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Quick Actions:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Tooltip content="Select root element">
                        <button
                          onClick={() => setJsonPathQuery('$')}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          $ (root)
                        </button>
                      </Tooltip>
                      <Tooltip content="Select all child keys">
                        <button
                          onClick={() => addPathOperation('.*')}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          .* (all keys)
                        </button>
                      </Tooltip>
                      <Tooltip content="Select all array items">
                        <button
                          onClick={() => addPathOperation('[*]')}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          [*] (all items)
                        </button>
                      </Tooltip>
                      <Tooltip content="Select first array element">
                        <button
                          onClick={() => addPathOperation('[0]')}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          [0] (first)
                        </button>
                      </Tooltip>
                      <Tooltip content="Select last array element">
                        <button
                          onClick={() => addPathOperation('[-1]')}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          [-1] (last)
                        </button>
                      </Tooltip>
                      <Tooltip content="Recursive descent - search all levels">
                        <button
                          onClick={() => addPathOperation('..')}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          .. (recursive)
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Examples */}
                  {parsedJson && (
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Example Queries (click to try):
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setJsonPathQuery('$.*')
                            setTimeout(() => {
                              const result = JSONPath({ path: '$.*', json: parsedJson })
                              setResults(result)
                              setTotalQueries(prev => prev + 1)
                            }, 0)
                          }}
                          className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                        >
                          All root keys
                        </button>
                        <button
                          onClick={() => {
                            setJsonPathQuery('$..*')
                            setTimeout(() => {
                              const result = JSONPath({ path: '$..*', json: parsedJson })
                              setResults(result)
                              setTotalQueries(prev => prev + 1)
                            }, 0)
                          }}
                          className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                        >
                          All values
                        </button>
                        <button
                          onClick={() => {
                            setJsonPathQuery('$[*]')
                            setTimeout(() => {
                              const result = JSONPath({ path: '$[*]', json: parsedJson })
                              setResults(result)
                              setTotalQueries(prev => prev + 1)
                            }, 0)
                          }}
                          className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                        >
                          All array items
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Visual Mode */}
              {mode === 'visual' && parsedJson && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      JSONPath Expression (auto-generated):
                    </label>
                    <input
                      type="text"
                      value={jsonPathQuery}
                      onChange={(e) => setJsonPathQuery(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="Click elements below to build path"
                    />
                  </div>

                  {/* Quick Actions for Visual Mode */}
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Quick Actions:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          if (selectedPaths.length > 0) {
                            const lastPath = selectedPaths[selectedPaths.length - 1]
                            setJsonPathQuery(lastPath + '.*')
                          } else {
                            setJsonPathQuery('$.*')
                          }
                        }}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Add .* (all keys)
                      </button>
                      <button
                        onClick={() => {
                          if (selectedPaths.length > 0) {
                            const lastPath = selectedPaths[selectedPaths.length - 1]
                            setJsonPathQuery(lastPath + '[*]')
                          } else {
                            setJsonPathQuery('$[*]')
                          }
                        }}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Add [*] (all items)
                      </button>
                      <button
                        onClick={() => setSelectedPaths([])}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        JSON Tree (click to select):
                      </label>
                      {selectedPaths.length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedPaths.length} selected
                        </span>
                      )}
                    </div>
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 max-h-96 overflow-y-auto">
                      {jsonTree.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          No data to display
                        </p>
                      ) : (
                        <JSONTreeViewer
                          nodes={jsonTree}
                          onToggleSelect={togglePathSelection}
                          selectedPaths={selectedPaths}
                        />
                      )}
                    </div>
                  </div>

                  <button
                    onClick={executeQuery}
                    disabled={!jsonPathQuery.trim()}
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Execute Query
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-red-700 dark:text-red-400 font-semibold mb-1">Query Error</p>
                      <p className="text-red-600 dark:text-red-300 text-sm mb-2">{error}</p>
                      <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                        <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-1">Common fixes:</p>
                        <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">
                          <li>Check that your JSONPath expression starts with $</li>
                          <li>Verify array indices are valid numbers</li>
                          <li>Ensure filter expressions use correct syntax: [?(@.key == &apos;value&apos;)]</li>
                          <li>Use quotes around string values in filters</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Results ({results.length} {results.length === 1 ? 'item' : 'items'}):
                  </label>
                  {results.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Copy
                      </button>
                      <button
                        onClick={exportResults}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Export
                      </button>
                    </div>
                  )}
                </div>
                <textarea
                  value={results.length > 0 ? JSON.stringify(results, null, 2) : ''}
                  readOnly
                  className="w-full h-64 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 resize-none font-mono text-sm text-gray-900 dark:text-gray-100"
                  placeholder="Results will appear here..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Stats */}
              {totalQueries > 0 && (
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                  Total queries: <span className="font-semibold text-primary-600">{totalQueries}</span>
                </div>
              )}
            </div>
          </div>

          {/* SEO Content */}
          <div className="max-w-4xl mx-auto mt-16 space-y-8">
            <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is JSONPath?</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                JSONPath is a query language for JSON, similar to XPath for XML. It allows you to extract specific 
                data from JSON structures using path expressions. JSONPath expressions can navigate through objects 
                and arrays, filter elements, and extract values based on conditions.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our tool provides two ways to use JSONPath: a visual tree selector for beginners and an advanced 
                mode for writing JSONPath expressions directly. Both modes help you quickly extract the data you need 
                from complex JSON structures.
              </p>
            </section>

            <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common JSONPath Expressions</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">$</code>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Root element</span>
                </div>
                <div>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">$.key</code>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Child element</span>
                </div>
                <div>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">$.*</code>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">All children</span>
                </div>
                <div>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">$[*]</code>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">All array elements</span>
                </div>
                <div>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">$[0]</code>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">First array element</span>
                </div>
                <div>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">$[-1]</code>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Last array element</span>
                </div>
                <div>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">$..key</code>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Recursive search for key</span>
                </div>
                <div>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">$..*</code>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">All values recursively</span>
                </div>
                <div>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">$[?(@.price &gt; 10)]</code>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Filter by condition</span>
                </div>
                <div>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">$.users[*].name</code>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">All names from users array</span>
                </div>
              </div>
            </section>

            <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Use Cases</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🌐 API Development</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Extract specific fields from API responses. Filter and transform JSON data without writing complex parsing code.
                  </p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block">$.data.users[*].email</code>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📊 Data Analysis</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Quickly extract and analyze specific data points from large JSON datasets. Perfect for debugging and data exploration.
                  </p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block">$..price</code>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔍 Testing & Debugging</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Verify JSON structure and extract values for testing. Use visual mode to explore complex nested structures.
                  </p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block">$.response.status</code>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">⚡ Quick Data Extraction</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Extract specific values from configuration files, logs, or any JSON data. No need to write custom parsers.
                  </p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block">$.*</code>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔎 Filtering Data</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Filter arrays based on conditions. Find items that match specific criteria without manual searching.
                  </p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block">$[?(@.price &gt; 100)]</code>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📝 Configuration Parsing</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Extract configuration values from JSON config files. Navigate through nested settings easily.
                  </p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block">$.config.database.host</code>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <RelatedTools tools={relatedTools} title="Related Code Tools" />
        )}
      </Layout>
    </>
  )
}

// JSON Tree Viewer Component
interface JSONTreeViewerProps {
  nodes: JSONTreeNode[]
  onToggleSelect: (path: string) => void
  selectedPaths: string[]
  level?: number
}

function JSONTreeViewer({ nodes, onToggleSelect, selectedPaths, level = 0 }: JSONTreeViewerProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpand = (path: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const formatValue = (value: any): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'string') {
      // Truncate long strings
      if (value.length > 50) return `"${value.substring(0, 47)}..."`
      return `"${value}"`
    }
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    if (typeof value === 'number') return String(value)
    if (typeof value === 'object') {
      if (Array.isArray(value)) return `[${value.length} item${value.length !== 1 ? 's' : ''}]`
      return `{${Object.keys(value).length} key${Object.keys(value).length !== 1 ? 's' : ''}}`
    }
    return String(value)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'object':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'array':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        )
      case 'string':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        )
      case 'number':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        )
      case 'boolean':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        )
    }
  }

  return (
    <div className="space-y-1">
      {nodes.map((node) => {
        const isExpanded = expanded.has(node.path)
        const hasChildren = node.children && node.children.length > 0
        const isSelected = selectedPaths.includes(node.path)

        return (
          <div key={node.path} style={{ marginLeft: `${level * 20}px` }}>
            <div className={`flex items-center gap-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 transition-colors ${
              isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
            }`}>
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(node.path)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              {!hasChildren && <span className="w-4" />}
              
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {getTypeIcon(node.type)}
              </div>
              
              <Tooltip content={`Path: ${node.path}`} position="right">
                <button
                  onClick={() => onToggleSelect(node.path)}
                  className={`flex-1 text-left text-sm font-mono transition-colors ${
                    isSelected
                      ? 'text-primary-600 dark:text-primary-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <span className="text-gray-500 dark:text-gray-400">
                    {typeof node.key === 'number' ? `[${node.key}]` : node.key}:
                  </span>{' '}
                  <span>{formatValue(node.value)}</span>
                </button>
              </Tooltip>
            </div>
            
            {hasChildren && isExpanded && (
              <JSONTreeViewer
                nodes={node.children!}
                onToggleSelect={onToggleSelect}
                selectedPaths={selectedPaths}
                level={level + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

