'use client'

import { useState, useCallback, useMemo } from 'react'
import Layout from '@/components/Layout'
interface Shadow {
  offsetX: number
  offsetY: number
  blur: number
  color: string
  id: string
}

export default function TextShadowGeneratorPage() {
  const [shadows, setShadows] = useState<Shadow[]>([
    { offsetX: 2, offsetY: 2, blur: 4, color: '#000000', id: '1' }
  ])
  const [text, setText] = useState('Sample Text')
  const [textSize, setTextSize] = useState(48)
  const [textColor, setTextColor] = useState('#000000')
  const cssValue = useMemo(() => {
    if (shadows.length === 0) return 'none'
    return shadows.map(shadow => 
      `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.color}`
    ).join(', ')
  }, [shadows])

  const addShadow = useCallback(() => {
    const newShadow: Shadow = {
      offsetX: 2,
      offsetY: 2,
      blur: 4,
      color: '#000000',
      id: Date.now().toString()
    }
    setShadows([...shadows, newShadow])
  }, [shadows])

  const updateShadow = useCallback((id: string, updates: Partial<Shadow>) => {
    setShadows(shadows.map(shadow => 
      shadow.id === id ? { ...shadow, ...updates } : shadow
    ))
  }, [shadows])

  const removeShadow = useCallback((id: string) => {
    setShadows(shadows.filter(shadow => shadow.id !== id))
  }, [shadows])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Silent fail
    }
  }

  const presets = [
    { name: 'None', shadows: [] },
    { name: 'Soft', shadows: [{ offsetX: 1, offsetY: 1, blur: 3, color: '#00000040' }] },
    { name: 'Medium', shadows: [{ offsetX: 2, offsetY: 2, blur: 4, color: '#000000' }] },
    { name: 'Hard', shadows: [{ offsetX: 3, offsetY: 3, blur: 0, color: '#000000' }] },
    { name: 'Glow', shadows: [{ offsetX: 0, offsetY: 0, blur: 10, color: '#3b82f6' }] },
    { name: 'Double', shadows: [
      { offsetX: 2, offsetY: 2, blur: 4, color: '#00000080' },
      { offsetX: 4, offsetY: 4, blur: 8, color: '#00000040' }
    ]},
  ]

  const applyPreset = useCallback((preset: typeof presets[0]) => {
    if (preset.shadows.length === 0) {
      setShadows([])
    } else {
      setShadows(preset.shadows.map((s, i) => ({
        ...s,
        id: (i + 1).toString()
      })))
    }
  }, [])

  return (
    <Layout
      title="✨ Text Shadow Generator"
      description="Generate CSS text-shadow values with visual preview. Create beautiful text shadows with multiple layers."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* Preview */}
            <div className="flex items-center justify-center p-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-xl">
              <span
                style={{
                  fontSize: `${textSize}px`,
                  color: textColor,
                  textShadow: cssValue,
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease'
                }}
              >
                {text || 'Sample Text'}
              </span>
            </div>

            {/* Text Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Text
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Font Size: {textSize}px
                </label>
                <input
                  type="range"
                  min="24"
                  max="120"
                  value={textSize}
                  onChange={(e) => setTextSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Quick Presets
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Shadows */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Text Shadows
                </label>
                <button
                  onClick={addShadow}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
                >
                  + Add Shadow
                </button>
              </div>

              <div className="space-y-4">
                {shadows.map((shadow, index) => (
                  <div
                    key={shadow.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Shadow {index + 1}
                      </span>
                      <button
                        onClick={() => removeShadow(shadow.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Offset X: {shadow.offsetX}px
                        </label>
                        <input
                          type="range"
                          min="-20"
                          max="20"
                          value={shadow.offsetX}
                          onChange={(e) => updateShadow(shadow.id, { offsetX: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Offset Y: {shadow.offsetY}px
                        </label>
                        <input
                          type="range"
                          min="-20"
                          max="20"
                          value={shadow.offsetY}
                          onChange={(e) => updateShadow(shadow.id, { offsetY: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Blur: {shadow.blur}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={shadow.blur}
                          onChange={(e) => updateShadow(shadow.id, { blur: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={shadow.color}
                            onChange={(e) => updateShadow(shadow.id, { color: e.target.value })}
                            className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={shadow.color}
                            onChange={(e) => updateShadow(shadow.id, { color: e.target.value })}
                            className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CSS Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  CSS Code
                </label>
                <button
                  onClick={() => copyToClipboard(`text-shadow: ${cssValue};`)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Copy CSS
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                  text-shadow: {cssValue || 'none'};
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is CSS Text Shadow?</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            The CSS <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">text-shadow</code> property adds shadow effects to text. 
            It&apos;s perfect for creating depth, emphasis, and visual hierarchy in typography. You can add multiple shadows 
            to create complex text effects.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Text shadow consists of offset-x, offset-y, blur-radius, and color values. Multiple shadows can be applied 
            by separating them with commas, allowing for creative typography effects.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📝 Headings</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">Add subtle shadows to headings for better readability and visual impact.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🎨 3D Effects</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">Create 3D text effects using multiple shadows with different offsets.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">✨ Glow Effects</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">Use large blur radius with matching color to create glow effects.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">📖 Readability</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">Improve text readability on complex backgrounds with subtle shadows.</p>
            </div>
          </div>
        </section>
      </div>

      </Layout>
  )
}

