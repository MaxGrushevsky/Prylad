'use client'

import { useState, useCallback, useMemo } from 'react'
import Layout from '@/components/Layout'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
export default function BorderRadiusGeneratorPage() {
  const [topLeft, setTopLeft] = useState(10)
  const [topRight, setTopRight] = useState(10)
  const [bottomRight, setBottomRight] = useState(10)
  const [bottomLeft, setBottomLeft] = useState(10)
  const [linked, setLinked] = useState(true)
  const [unit, setUnit] = useState<'px' | 'em' | 'rem' | '%'>('px')
  const handleRadiusChange = useCallback((value: number, corner: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft') => {
    if (linked) {
      setTopLeft(value)
      setTopRight(value)
      setBottomRight(value)
      setBottomLeft(value)
    } else {
      switch (corner) {
        case 'topLeft':
          setTopLeft(value)
          break
        case 'topRight':
          setTopRight(value)
          break
        case 'bottomRight':
          setBottomRight(value)
          break
        case 'bottomLeft':
          setBottomLeft(value)
          break
      }
    }
  }, [linked])

  const cssValue = useMemo(() => {
    if (topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft) {
      return `${topLeft}${unit}`
    }
    return `${topLeft}${unit} ${topRight}${unit} ${bottomRight}${unit} ${bottomLeft}${unit}`
  }, [topLeft, topRight, bottomRight, bottomLeft, unit])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Silent fail
    }
  }

  const presets = [
    { name: 'None', value: 0 },
    { name: 'Small', value: 4 },
    { name: 'Medium', value: 8 },
    { name: 'Large', value: 16 },
    { name: 'XLarge', value: 24 },
    { name: 'Circle', value: 50 },
  ]

  useKeyboardShortcuts([])

  return (
    <Layout
      title="🔲 Border Radius Generator"
      description="Generate CSS border-radius values with visual preview. Create rounded corners for any element."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6">
          <div className="space-y-6">
            {/* Preview */}
            <div className="flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
              <div
                className="bg-gradient-to-br from-primary-500 to-purple-500 shadow-lg"
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: cssValue,
                  transition: 'border-radius 0.2s ease'
                }}
              />
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="linked"
                  checked={linked}
                  onChange={(e) => setLinked(e.target.checked)}
                  className="w-4 h-4 accent-primary-600"
                />
                <label htmlFor="linked" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Link all corners
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as typeof unit)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="px">px</option>
                  <option value="em">em</option>
                  <option value="rem">rem</option>
                  <option value="%">%</option>
                </select>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Top Left: {topLeft}{unit}
                </label>
                <input
                  type="range"
                  min="0"
                  max={unit === '%' ? 50 : 100}
                  value={topLeft}
                  onChange={(e) => handleRadiusChange(parseInt(e.target.value), 'topLeft')}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Top Right: {topRight}{unit}
                </label>
                <input
                  type="range"
                  min="0"
                  max={unit === '%' ? 50 : 100}
                  value={topRight}
                  onChange={(e) => handleRadiusChange(parseInt(e.target.value), 'topRight')}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bottom Right: {bottomRight}{unit}
                </label>
                <input
                  type="range"
                  min="0"
                  max={unit === '%' ? 50 : 100}
                  value={bottomRight}
                  onChange={(e) => handleRadiusChange(parseInt(e.target.value), 'bottomRight')}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bottom Left: {bottomLeft}{unit}
                </label>
                <input
                  type="range"
                  min="0"
                  max={unit === '%' ? 50 : 100}
                  value={bottomLeft}
                  onChange={(e) => handleRadiusChange(parseInt(e.target.value), 'bottomLeft')}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quick Presets
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleRadiusChange(preset.value, 'topLeft')}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* CSS Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  CSS Code
                </label>
                <button
                  onClick={() => copyToClipboard(`border-radius: ${cssValue};`)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Copy CSS
                </button>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <code className="text-sm font-mono text-gray-800">
                  border-radius: {cssValue};
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        {/* Introduction */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is CSS Border Radius?</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              The CSS <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">border-radius</code> property allows you to round the corners of elements. 
              It's one of the most commonly used CSS properties for creating modern, polished user interfaces. 
              By controlling the radius of each corner independently or together, you can create everything from 
              subtle rounded corners to perfect circles.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Border radius is supported in all modern browsers and is essential for creating contemporary web designs. 
              It works with any HTML element and can be combined with other CSS properties like shadows and gradients 
              to create visually appealing components.
            </p>
          </div>
        </section>

        {/* How to Use */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use Border Radius</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">1. Single Value</h3>
              <p className="text-sm mb-2">Apply the same radius to all corners:</p>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto"><code>border-radius: 10px;</code></pre>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">2. Two Values</h3>
              <p className="text-sm mb-2">First value for top-left and bottom-right, second for top-right and bottom-left:</p>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto"><code>border-radius: 10px 20px;</code></pre>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">3. Four Values</h3>
              <p className="text-sm mb-2">Control each corner independently (top-left, top-right, bottom-right, bottom-left):</p>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto"><code>border-radius: 10px 20px 30px 40px;</code></pre>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">4. Percentage Values</h3>
              <p className="text-sm mb-2">Use percentages for responsive rounded corners. 50% creates a perfect circle:</p>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto"><code>border-radius: 50%; /* Perfect circle */</code></pre>
            </div>
          </div>
        </section>

        {/* Common Use Cases */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🎨 Buttons</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Add rounded corners to buttons for a modern, friendly appearance. Typically use 4-8px for subtle rounding.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📦 Cards</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Round card corners to create depth and visual hierarchy. Common values range from 8px to 16px.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🖼️ Images</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Soften image edges with border radius. Use 4-12px for photos, 50% for circular avatars.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📝 Input Fields</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Round input and textarea corners for a polished form design. Match your button radius for consistency.
              </p>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Best Practices</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Consistency:</strong> Use consistent border radius values across your design system for a cohesive look.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Subtle is Better:</strong> Start with smaller values (4-8px) and increase if needed. Over-rounding can look unprofessional.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Responsive Units:</strong> Consider using <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">rem</code> or <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">em</code> for scalable designs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Performance:</strong> Border radius is hardware-accelerated and has minimal performance impact.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Combinations:</strong> Combine with box-shadow and gradients for enhanced visual effects.</span>
            </li>
          </ul>
        </section>
      </div>

      </Layout>
  )
}

