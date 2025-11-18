'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'

interface Shadow {
  id: string
  hOffset: number
  vOffset: number
  blur: number
  spread: number
  color: string
  opacity: number
  inset: boolean
}

const shadowPresets = [
  {
    name: 'Soft Shadow',
    shadows: [{ hOffset: 0, vOffset: 2, blur: 8, spread: 0, color: '#000000', opacity: 0.1, inset: false }]
  },
  {
    name: 'Medium Shadow',
    shadows: [{ hOffset: 0, vOffset: 4, blur: 12, spread: 0, color: '#000000', opacity: 0.15, inset: false }]
  },
  {
    name: 'Large Shadow',
    shadows: [{ hOffset: 0, vOffset: 8, blur: 24, spread: 0, color: '#000000', opacity: 0.2, inset: false }]
  },
  {
    name: 'Colored Shadow',
    shadows: [{ hOffset: 0, vOffset: 10, blur: 20, spread: 0, color: '#3B82F6', opacity: 0.3, inset: false }]
  },
  {
    name: 'Inset Shadow',
    shadows: [{ hOffset: 0, vOffset: 2, blur: 4, spread: 0, color: '#000000', opacity: 0.1, inset: true }]
  },
  {
    name: 'Double Shadow',
    shadows: [
      { hOffset: 0, vOffset: 2, blur: 4, spread: 0, color: '#000000', opacity: 0.1, inset: false },
      { hOffset: 0, vOffset: 8, blur: 16, spread: 0, color: '#000000', opacity: 0.1, inset: false }
    ]
  },
  {
    name: 'Glow Effect',
    shadows: [{ hOffset: 0, vOffset: 0, blur: 20, spread: 0, color: '#3B82F6', opacity: 0.5, inset: false }]
  },
  {
    name: 'Neumorphism',
    shadows: [
      { hOffset: 8, vOffset: 8, blur: 16, spread: 0, color: '#FFFFFF', opacity: 0.5, inset: false },
      { hOffset: -8, vOffset: -8, blur: 16, spread: 0, color: '#000000', opacity: 0.1, inset: false }
    ]
  },
  {
    name: 'Layered Shadow',
    shadows: [
      { hOffset: 0, vOffset: 1, blur: 2, spread: 0, color: '#000000', opacity: 0.05, inset: false },
      { hOffset: 0, vOffset: 4, blur: 8, spread: 0, color: '#000000', opacity: 0.1, inset: false },
      { hOffset: 0, vOffset: 12, blur: 24, spread: 0, color: '#000000', opacity: 0.15, inset: false }
    ]
  }
]

export default function BoxShadowPage() {
  const [shadows, setShadows] = useState<Shadow[]>([
    { id: '1', hOffset: 10, vOffset: 10, blur: 20, spread: 0, color: '#000000', opacity: 0.3, inset: false }
  ])
  const [autoGenerate, setAutoGenerate] = useState(true)
  const [totalGenerated, setTotalGenerated] = useState(0)
  const [previewBg, setPreviewBg] = useState('#FFFFFF')

  const hexToRgba = useCallback((hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }, [])

  const generateCSS = useCallback((): string => {
    const shadowValues = shadows.map(shadow => {
      const rgba = hexToRgba(shadow.color, shadow.opacity)
      const inset = shadow.inset ? 'inset ' : ''
      return `${inset}${shadow.hOffset}px ${shadow.vOffset}px ${shadow.blur}px ${shadow.spread}px ${rgba}`
    })
    return shadowValues.join(', ')
  }, [shadows, hexToRgba])

  const [css, setCss] = useState('')
  const [cssProperty, setCssProperty] = useState('')

  useEffect(() => {
    if (autoGenerate || shadows.length > 0) {
      const shadowValue = generateCSS()
      setCss(`box-shadow: ${shadowValue};`)
      setCssProperty(shadowValue)
      setTotalGenerated(prev => prev + 1)
    }
  }, [shadows, autoGenerate, generateCSS])

  const updateShadow = (id: string, updates: Partial<Shadow>) => {
    setShadows(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const addShadow = () => {
    const newShadow: Shadow = {
      id: Date.now().toString(),
      hOffset: 0,
      vOffset: 0,
      blur: 10,
      spread: 0,
      color: '#000000',
      opacity: 0.3,
      inset: false
    }
    setShadows(prev => [...prev, newShadow])
  }

  const removeShadow = (id: string) => {
    setShadows(prev => prev.filter(s => s.id !== id))
  }

  const duplicateShadow = (id: string) => {
    const shadow = shadows.find(s => s.id === id)
    if (shadow) {
      const newShadow: Shadow = {
        ...shadow,
        id: Date.now().toString()
      }
      setShadows(prev => [...prev, newShadow])
    }
  }

  const applyPreset = (preset: typeof shadowPresets[0]) => {
    setShadows(preset.shadows.map((s, i) => ({
      id: (i + 1).toString(),
      ...s
    })))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.error('Failed to copy')
    }
  }

  const exportToFile = () => {
    const cssContent = `.box-shadow-example {\n  ${css}\n}`
    const blob = new Blob([cssContent], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'box-shadow-' + Date.now() + '.css'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setShadows([{
      id: '1',
      hOffset: 0,
      vOffset: 0,
      blur: 0,
      spread: 0,
      color: '#000000',
      opacity: 0,
      inset: false
    }])
  }

  return (
    <Layout
      title="💎 Box Shadow Generator - Create Beautiful CSS Shadows Online"
      description="Generate CSS box-shadow effects with our free online tool. Create single or multiple shadows, adjust blur, spread, color, and opacity. Export CSS code and preview in real-time. Perfect for web designers and developers."
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Shadow Controls</h2>
              {totalGenerated > 0 && (
                <div className="text-sm text-gray-500">
                  Generated: <span className="font-semibold text-gray-900">{totalGenerated}</span>
                </div>
              )}
            </div>

            {/* Presets */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Quick Presets:</label>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {shadowPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-xs transition-colors"
                  >
                    <div className="font-semibold text-gray-900">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Shadows List */}
            <div className="space-y-4">
              {shadows.map((shadow, index) => (
                <div key={shadow.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Shadow {index + 1}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => duplicateShadow(shadow.id)}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        Duplicate
                      </button>
                      {shadows.length > 1 && (
                        <button
                          onClick={() => removeShadow(shadow.id)}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          H-Offset: {shadow.hOffset}px
                        </label>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={shadow.hOffset}
                          onChange={(e) => updateShadow(shadow.id, { hOffset: Number(e.target.value) })}
                          className="w-full accent-primary-600"
                        />
                        <input
                          type="number"
                          min="-100"
                          max="100"
                          value={shadow.hOffset}
                          onChange={(e) => updateShadow(shadow.id, { hOffset: Number(e.target.value) || 0 })}
                          className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          V-Offset: {shadow.vOffset}px
                        </label>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={shadow.vOffset}
                          onChange={(e) => updateShadow(shadow.id, { vOffset: Number(e.target.value) })}
                          className="w-full accent-primary-600"
                        />
                        <input
                          type="number"
                          min="-100"
                          max="100"
                          value={shadow.vOffset}
                          onChange={(e) => updateShadow(shadow.id, { vOffset: Number(e.target.value) || 0 })}
                          className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Blur: {shadow.blur}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={shadow.blur}
                          onChange={(e) => updateShadow(shadow.id, { blur: Number(e.target.value) })}
                          className="w-full accent-primary-600"
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={shadow.blur}
                          onChange={(e) => updateShadow(shadow.id, { blur: Number(e.target.value) || 0 })}
                          className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Spread: {shadow.spread}px
                        </label>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={shadow.spread}
                          onChange={(e) => updateShadow(shadow.id, { spread: Number(e.target.value) })}
                          className="w-full accent-primary-600"
                        />
                        <input
                          type="number"
                          min="-50"
                          max="50"
                          value={shadow.spread}
                          onChange={(e) => updateShadow(shadow.id, { spread: Number(e.target.value) || 0 })}
                          className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Color</label>
                        <input
                          type="color"
                          value={shadow.color}
                          onChange={(e) => updateShadow(shadow.id, { color: e.target.value })}
                          className="w-full h-8 rounded cursor-pointer border border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Opacity: {Math.round(shadow.opacity * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={shadow.opacity}
                          onChange={(e) => updateShadow(shadow.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-primary-600"
                        />
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          value={shadow.opacity}
                          onChange={(e) => updateShadow(shadow.id, { opacity: Number(e.target.value) || 0 })}
                          className="w-full mt-1 px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shadow.inset}
                        onChange={(e) => updateShadow(shadow.id, { inset: e.target.checked })}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-xs text-gray-700">Inset shadow</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addShadow}
              className="w-full bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              + Add Shadow
            </button>

            {/* Preview Background */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Preview Background</label>
              <input
                type="color"
                value={previewBg}
                onChange={(e) => setPreviewBg(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer border-2 border-gray-200"
              />
            </div>

            {/* Auto Generate */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerate}
                onChange={(e) => setAutoGenerate(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Auto-generate as you edit</span>
            </label>

            {!autoGenerate && (
              <button
                onClick={() => {
                  const shadowValue = generateCSS()
                  setCss(`box-shadow: ${shadowValue};`)
                  setCssProperty(shadowValue)
                  setTotalGenerated(prev => prev + 1)
                }}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
              >
                Generate CSS
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportToFile}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                Export CSS
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Preview & Output */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold">Preview & CSS Output</h2>

            {/* Preview */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Live Preview</label>
              <div
                className="w-full h-64 rounded-lg border-2 border-gray-200 flex items-center justify-center transition-all"
                style={{
                  backgroundColor: previewBg,
                  boxShadow: cssProperty
                }}
              >
                <div className="text-gray-400 text-center">
                  <div className="text-lg font-semibold mb-2">Shadow Preview</div>
                  <div className="text-sm">Adjust controls to see changes</div>
                </div>
              </div>
            </div>

            {/* Multiple Preview Examples */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Preview Examples</label>
              <div className="grid grid-cols-3 gap-3">
                <div
                  className="h-20 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500"
                  style={{ backgroundColor: '#FFFFFF', boxShadow: cssProperty }}
                >
                  White
                </div>
                <div
                  className="h-20 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500"
                  style={{ backgroundColor: '#F3F4F6', boxShadow: cssProperty }}
                >
                  Gray
                </div>
                <div
                  className="h-20 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500"
                  style={{ backgroundColor: '#1F2937', boxShadow: cssProperty }}
                >
                  Dark
                </div>
              </div>
            </div>

            {/* CSS Output */}
            {css && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">CSS Property</label>
                    <button
                      onClick={() => copyToClipboard(cssProperty)}
                      className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Copy Value
                    </button>
                  </div>
                  <code className="block p-4 bg-gray-50 border-2 border-gray-200 rounded-lg font-mono text-sm break-all">
                    {cssProperty}
                  </code>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Full CSS Rule</label>
                    <button
                      onClick={() => copyToClipboard(css)}
                      className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Copy CSS
                    </button>
                  </div>
                  <code className="block p-4 bg-gray-50 border-2 border-gray-200 rounded-lg font-mono text-sm break-all">
                    {css}
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is CSS Box Shadow?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                CSS <code className="bg-gray-100 px-1 rounded">box-shadow</code> is a property that adds shadow effects 
                around an element&apos;s frame. You can set multiple effects separated by commas. A box shadow is described 
                by X and Y offsets relative to the element, blur and spread radius, and color.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free box shadow generator lets you create beautiful shadow effects visually. Adjust horizontal and vertical 
                offsets, blur radius, spread distance, color, and opacity. Create single or multiple shadows for layered effects. 
                Perfect for adding depth, elevation, and visual hierarchy to your web designs.
              </p>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Box Shadow Syntax</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Basic Syntax</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`box-shadow: offset-x offset-y blur-radius spread-radius color;`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Parameters Explained</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><strong>offset-x:</strong> Horizontal distance of the shadow (positive = right, negative = left)</li>
                  <li><strong>offset-y:</strong> Vertical distance of the shadow (positive = down, negative = up)</li>
                  <li><strong>blur-radius:</strong> How blurry the shadow is (0 = sharp, larger = more blur)</li>
                  <li><strong>spread-radius:</strong> How much the shadow grows (positive = larger, negative = smaller)</li>
                  <li><strong>color:</strong> Shadow color (can use rgba for transparency)</li>
                  <li><strong>inset:</strong> Optional keyword to create inner shadow</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Multiple Shadows</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`box-shadow: 
  shadow1,
  shadow2,
  shadow3;`}
                </pre>
                <p className="text-sm text-gray-700 mt-2">
                  You can add multiple shadows separated by commas for layered effects.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎨 Card Design</h3>
                <p className="text-gray-700 text-sm">
                  Add subtle shadows to cards and containers to create depth and separation from the background. 
                  Soft shadows work best for modern, clean designs.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📱 Material Design</h3>
                <p className="text-gray-700 text-sm">
                  Material Design uses elevation with shadows. Different shadow intensities represent different 
                  elevation levels, helping users understand the hierarchy.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🔘 Button States</h3>
                <p className="text-gray-700 text-sm">
                  Use shadows to indicate interactive elements. Hover states can increase shadow intensity, 
                  and active states can use inset shadows for a pressed effect.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💎 Neumorphism</h3>
                <p className="text-gray-700 text-sm">
                  Create soft, extruded plastic-like effects using multiple shadows with light and dark colors. 
                  This creates a modern, tactile appearance.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">✨ Glow Effects</h3>
                <p className="text-gray-700 text-sm">
                  Use colored shadows with high blur and no offset to create glow effects around elements. 
                  Perfect for highlighting important content or creating neon-like effects.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📦 Floating Elements</h3>
                <p className="text-gray-700 text-sm">
                  Larger shadows with offset create the illusion of elements floating above the page. 
                  Great for modals, dropdowns, and tooltips.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Multiple Shadows:</strong> Create layered shadow effects with multiple shadows on a single element.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Real-time Preview:</strong> See your shadow effects instantly as you adjust parameters.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Preset Library:</strong> Quick access to popular shadow effects like soft shadows, glows, and neumorphism.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Precise Control:</strong> Use sliders and number inputs for exact values.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Inset Shadows:</strong> Create inner shadows for pressed or inset effects.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Export Options:</strong> Copy CSS property value or full rule, export to CSS file.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Background Preview:</strong> Test shadows on different background colors.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I use multiple shadows on one element?</h3>
                <p className="text-gray-700 text-sm">
                  Yes! Our generator supports multiple shadows. Click &quot;Add Shadow&quot; to create layered effects. 
                  Multiple shadows are rendered from top to bottom, so the first shadow appears on top.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What&apos;s the difference between blur and spread?</h3>
                <p className="text-gray-700 text-sm">
                  <strong>Blur</strong> controls how soft or sharp the shadow edge is (0 = sharp, larger = softer). 
                  <strong>Spread</strong> controls the size of the shadow (positive = larger, negative = smaller). 
                  Blur affects the edge quality, while spread affects the overall size.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What is an inset shadow?</h3>
                <p className="text-gray-700 text-sm">
                  An inset shadow appears inside the element rather than outside. It creates a pressed or recessed effect, 
                  as if the element is carved into the surface. Use the &quot;Inset shadow&quot; checkbox to enable this.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I create a glow effect?</h3>
                <p className="text-gray-700 text-sm">
                  Set both horizontal and vertical offsets to 0, increase the blur radius (20-40px), and use a colored 
                  shadow with higher opacity. This creates a glow around the element. Try our &quot;Glow Effect&quot; preset!
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Are box shadows performance-intensive?</h3>
                <p className="text-gray-700 text-sm">
                  Box shadows are GPU-accelerated and generally perform well. However, avoid using too many shadows 
                  on many elements simultaneously, especially on mobile devices. Keep shadows simple for best performance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I use this for text shadows?</h3>
                <p className="text-gray-700 text-sm">
                  Box shadows work on elements, not text. For text shadows, use the <code className="bg-gray-100 px-1 rounded text-xs">text-shadow</code> property, 
                  which has similar syntax but applies to text content.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}
