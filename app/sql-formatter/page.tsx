'use client'

import { useState, useCallback } from 'react'
import Layout from '@/components/Layout'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
type KeywordCase = 'upper' | 'lower' | 'preserve'
type IndentStyle = '2 spaces' | '4 spaces' | 'tab'

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
  'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'LIKE', 'BETWEEN', 'IS', 'NULL',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER',
  'DROP', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA', 'TRUNCATE', 'GRANT', 'REVOKE',
  'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT',
  'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'IF', 'ELSEIF', 'BEGIN', 'END', 'DECLARE', 'RETURN', 'EXEC', 'EXECUTE',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'DEFAULT', 'CHECK',
  'UNIQUE', 'NOT NULL', 'AUTO_INCREMENT', 'IDENTITY'
]

export default function SQLFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [keywordCase, setKeywordCase] = useState<KeywordCase>('upper')
  const [indentStyle, setIndentStyle] = useState<IndentStyle>('2 spaces')
  const [autoFormat, setAutoFormat] = useState(false)
  const [totalFormatted, setTotalFormatted] = useState(0)
  const getIndent = useCallback((): string => {
    switch (indentStyle) {
      case '2 spaces':
        return '  '
      case '4 spaces':
        return '    '
      case 'tab':
        return '\t'
      default:
        return '  '
    }
  }, [indentStyle])

  const formatKeyword = useCallback((word: string): string => {
    const upperWord = word.toUpperCase()
    if (SQL_KEYWORDS.includes(upperWord)) {
      switch (keywordCase) {
        case 'upper':
          return upperWord
        case 'lower':
          return word.toLowerCase()
        case 'preserve':
          return word
        default:
          return upperWord
      }
    }
    return word
  }, [keywordCase])

  const formatSQL = useCallback((sql: string): string => {
    if (!sql.trim()) return ''

    const indent = getIndent()
    let formatted = sql.trim()
    
    // Remove extra whitespace
    formatted = formatted.replace(/\s+/g, ' ')
    
    // Add newlines before major keywords
    const majorKeywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 
                          'FULL JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'UNION', 'INSERT INTO', 
                          'UPDATE', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE']
    
    majorKeywords.forEach(keyword => {
      const regex = new RegExp(`\\s+${keyword}\\s+`, 'gi')
      formatted = formatted.replace(regex, `\n${keyword} `)
    })

    // Format keywords
    const words = formatted.split(/\s+/)
    formatted = words.map(word => formatKeyword(word)).join(' ')

    // Add indentation
    const lines = formatted.split('\n')
    let indentLevel = 0
    const formattedLines: string[] = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (!trimmed) {
        formattedLines.push('')
        return
      }

      // Decrease indent before certain keywords
      if (trimmed.match(/^(FROM|WHERE|GROUP BY|ORDER BY|HAVING|UNION)/i)) {
        indentLevel = Math.max(0, indentLevel - 1)
      }

      // Add indentation
      const indented = indent.repeat(indentLevel) + trimmed
      formattedLines.push(indented)

      // Increase indent after certain keywords
      if (trimmed.match(/^(SELECT|FROM|WHERE|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN)/i)) {
        indentLevel++
      }
    })

    return formattedLines.join('\n')
  }, [getIndent, formatKeyword])

  const handleFormat = useCallback(() => {
    if (!input.trim()) {
      return
    }

    try {
      const formatted = formatSQL(input)
      setOutput(formatted)
      setTotalFormatted(prev => prev + 1)
    } catch (e) {
      const errorMsg = (e as Error).message
      setOutput('')
    }
  }, [input, formatSQL, ])

  // Auto-format on input change
  const handleInputChange = useCallback((value: string) => {
    setInput(value)
    if (autoFormat && value.trim()) {
      const timer = setTimeout(() => {
        try {
          const formatted = formatSQL(value)
          setOutput(formatted)
        } catch (e) {
          // Silent fail for auto-format
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [autoFormat, formatSQL])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
    }
  }

  const exportToFile = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted-query.sql'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrlKey: true,
      handler: handleFormat
    }
  ])

  return (
    <Layout
      title="💾 SQL Formatter"
      description="Format and beautify SQL queries online. Auto-format with proper indentation and keyword capitalization."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6">
          <div className="space-y-6">
            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Keyword Case
                </label>
                <select
                  value={keywordCase}
                  onChange={(e) => setKeywordCase(e.target.value as KeywordCase)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                  <option value="preserve">Preserve</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Indent Style
                </label>
                <select
                  value={indentStyle}
                  onChange={(e) => setIndentStyle(e.target.value as IndentStyle)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="2 spaces">2 Spaces</option>
                  <option value="4 spaces">4 Spaces</option>
                  <option value="tab">Tab</option>
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
                  <span className="text-sm font-medium text-gray-700">Auto-format</span>
                </label>
              </div>
            </div>

            {/* Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  SQL Query
                </label>
                <button
                  onClick={() => setInput('')}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="SELECT * FROM users WHERE age > 18 ORDER BY name;"
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm resize-none"
              />
              <div className="flex items-center justify-end mt-2">
                <button
                  onClick={handleFormat}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Format SQL
                </button>
              </div>
            </div>

            {/* Output */}
            {output && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Formatted SQL
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
                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-sm font-mono">
                  {output}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {totalFormatted > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
            <p className="text-sm text-gray-600">
              Total queries formatted: <span className="font-semibold text-primary-600">{totalFormatted}</span>
            </p>
          </div>
        )}
      </div>

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Why Format SQL Queries?</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            SQL formatting is essential for code readability, maintainability, and collaboration. Well-formatted SQL 
            queries are easier to understand, debug, and modify. Consistent formatting makes it easier for teams to 
            work together and reduces the likelihood of errors.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            This SQL formatter automatically indents and structures your SQL queries according to best practices, 
            making complex queries more readable and professional-looking.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Formatting Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📐 Indentation</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Automatically indent nested clauses, subqueries, and JOIN statements for clear hierarchy.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🔤 Keyword Casing</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Standardize SQL keywords to uppercase or lowercase for consistency across your codebase.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📏 Line Breaks</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Add appropriate line breaks between clauses to improve readability of complex queries.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🎨 Customizable</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Choose your preferred indentation style (spaces or tabs) and indentation size.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Best Practices</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Consistency:</strong> Use consistent formatting across all SQL queries in your project.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Readability:</strong> Format queries before committing to version control for better code reviews.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Team Standards:</strong> Establish formatting standards for your team to maintain code quality.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Documentation:</strong> Well-formatted SQL is self-documenting and easier to comment.</span>
            </li>
          </ul>
        </section>
      </div>

      </Layout>
  )
}


