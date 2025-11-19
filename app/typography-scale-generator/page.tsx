'use client'

import { useState, useCallback, useMemo } from 'react'
import Layout from '@/components/Layout'
type Ratio = 1.125 | 1.2 | 1.25 | 1.333 | 1.414 | 1.5 | 1.618 | 2
type Unit = 'px' | 'rem' | 'em'

interface ScaleItem {
  name: string
  size: number
  px: number
  rem: number
  em: number
}

export default function TypographyScaleGeneratorPage() {
  const [baseSize, setBaseSize] = useState(16)
  const [ratio, setRatio] = useState<Ratio>(1.25)
  const [unit, setUnit] = useState<Unit>('rem')
  const scale = useMemo((): ScaleItem[] => {
    const items: ScaleItem[] = []
    
    // Generate scale from -2 to +6
    for (let i = -2; i <= 6; i++) {
      const size = baseSize * Math.pow(ratio, i)
      const name = i === 0 ? 'Base' : i < 0 ? `Small ${Math.abs(i)}` : `Heading ${i}`
      
      items.push({
        name,
        size,
        px: Math.round(size * 10) / 10,
        rem: Math.round((size / 16) * 100) / 100,
        em: Math.round((size / baseSize) * 100) / 100
      })
    }
    
    return items
  }, [baseSize, ratio])

  const cssVariables = useMemo(() => {
    return scale.map((item, index) => {
      const level = index - 2
      const varName = level === 0 ? 'base' : level < 0 ? `small-${Math.abs(level)}` : `heading-${level}`
      return `  --font-size-${varName}: ${item[unit] === 'px' ? item.px + 'px' : item[unit] + unit};`
    }).join('\n')
  }, [scale, unit])

  const cssCode = useMemo(() => {
    return `:root {\n${cssVariables}\n}\n\n/* Usage */\nh1 { font-size: var(--font-size-heading-6); }\nh2 { font-size: var(--font-size-heading-5); }\nh3 { font-size: var(--font-size-heading-4); }\nh4 { font-size: var(--font-size-heading-3); }\nh5 { font-size: var(--font-size-heading-2); }\nh6 { font-size: var(--font-size-heading-1); }\np, body { font-size: var(--font-size-base); }`
  }, [cssVariables])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Silent fail
    }
  }

  const ratioPresets = [
    { name: 'Minor Second', value: 1.067 },
    { name: 'Major Second', value: 1.125 },
    { name: 'Minor Third', value: 1.2 },
    { name: 'Major Third', value: 1.25 },
    { name: 'Perfect Fourth', value: 1.333 },
    { name: 'Augmented Fourth', value: 1.414 },
    { name: 'Perfect Fifth', value: 1.5 },
    { name: 'Golden Ratio', value: 1.618 },
    { name: 'Octave', value: 2 }
  ]

  return (
    <Layout
      title="📐 Typography Scale Generator"
      description="Generate typography scales for perfect font sizing. Create harmonious font size scales with different ratios."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Base Size: {baseSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={baseSize}
                  onChange={(e) => setBaseSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ratio
                </label>
                <select
                  value={ratio}
                  onChange={(e) => setRatio(parseFloat(e.target.value) as Ratio)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {ratioPresets.map(preset => (
                    <option key={preset.name} value={preset.value}>
                      {preset.name} ({preset.value})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Display Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as Unit)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                  <option value="em">em</option>
                </select>
              </div>
            </div>

            {/* Scale Preview */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Typography Scale Preview
              </label>
              <div className="space-y-3 border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900/50">
                {scale.slice().reverse().map((item, index) => {
                  const level = 6 - index
                  if (level < 0) return null
                  
                  const size = item[unit]
                  const fontSize = unit === 'px' ? `${size}px` : `${size}${unit}`
                  
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {item.name}
                      </div>
                      <div className="flex-1">
                        {level === 0 ? (
                          <p style={{ fontSize, margin: 0, lineHeight: 1.2 }} className="text-gray-900 dark:text-gray-100">
                            The quick brown fox jumps over the lazy dog
                          </p>
                        ) : level === 1 ? (
                          <h1 style={{ fontSize, margin: 0, lineHeight: 1.2 }} className="text-gray-900 dark:text-gray-100">
                            The quick brown fox jumps over the lazy dog
                          </h1>
                        ) : level === 2 ? (
                          <h2 style={{ fontSize, margin: 0, lineHeight: 1.2 }} className="text-gray-900 dark:text-gray-100">
                            The quick brown fox jumps over the lazy dog
                          </h2>
                        ) : level === 3 ? (
                          <h3 style={{ fontSize, margin: 0, lineHeight: 1.2 }} className="text-gray-900 dark:text-gray-100">
                            The quick brown fox jumps over the lazy dog
                          </h3>
                        ) : level === 4 ? (
                          <h4 style={{ fontSize, margin: 0, lineHeight: 1.2 }} className="text-gray-900 dark:text-gray-100">
                            The quick brown fox jumps over the lazy dog
                          </h4>
                        ) : level === 5 ? (
                          <h5 style={{ fontSize, margin: 0, lineHeight: 1.2 }} className="text-gray-900 dark:text-gray-100">
                            The quick brown fox jumps over the lazy dog
                          </h5>
                        ) : (
                          <h6 style={{ fontSize, margin: 0, lineHeight: 1.2 }} className="text-gray-900 dark:text-gray-100">
                            The quick brown fox jumps over the lazy dog
                          </h6>
                        )}
                      </div>
                      <div className="w-32 text-sm text-gray-600 dark:text-gray-400 font-mono text-right">
                        {size}{unit}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Scale Table */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Scale Values
              </label>
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">px</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">rem</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">em</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {scale.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 font-mono text-right">{item.px}px</td>
                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 font-mono text-right">{item.rem}rem</td>
                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 font-mono text-right">{item.em}em</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CSS Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  CSS Code
                </label>
                <button
                  onClick={() => copyToClipboard(cssCode)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Copy CSS
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
                  <code>{cssCode}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 mt-10">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Build a Typography Scale</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>Select the base size. 16px is a safe default for body text on the web.</li>
            <li>Choose a ratio (Major Third, Perfect Fourth, Golden Ratio, etc.) that matches your brand personality.</li>
            <li>Preview headings and body copy to ensure the hierarchy feels balanced.</li>
            <li>Copy the generated CSS variables and use them in your design system or Tailwind config.</li>
          </ol>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ratio Cheat Sheet</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Subtle Scales</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Major Second (1.125):</strong> Great for UI-heavy dashboards.</li>
                <li><strong>Minor Third (1.2):</strong> Balanced spacing for product copy.</li>
                <li><strong>Major Third (1.25):</strong> Popular choice for editorial layouts.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Expressive Scales</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Perfect Fourth (1.333):</strong> Strong contrast between headings.</li>
                <li><strong>Golden Ratio (1.618):</strong> Dramatic hierarchy for marketing pages.</li>
                <li><strong>Octave (2):</strong> Use sparingly for hero/eyebrow text.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tips for Better Type Scales</h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed list-disc list-inside">
            <li>Limit yourself to 5–7 steps in the scale to avoid overwhelming options.</li>
            <li>Pair type scales with consistent line-height (1.2 for headings, 1.5 for body).</li>
            <li>Use <code className="font-mono">rem</code> for font sizes so the scale respects the root font size.</li>
            <li>Test responsive typography by adjusting the base size via CSS clamp() or media queries.</li>
          </ul>
        </section>
      </div>

      </Layout>
  )
}

