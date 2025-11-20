'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Layout from '@/components/Layout'

type Tab = 'box-shadow' | 'border-radius' | 'text-shadow'

// Box Shadow types
interface BoxShadow {
  id: string
  hOffset: number
  vOffset: number
  blur: number
  spread: number
  color: string
  opacity: number
  inset: boolean
}

// Text Shadow types
interface TextShadow {
  offsetX: number
  offsetY: number
  blur: number
  color: string
  id: string
}

// Utility function - вынесена наружу для оптимизации
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function CSSGeneratorsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('box-shadow')

  // Check URL hash for tab switching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash === '#border-radius') {
        setActiveTab('border-radius')
      } else if (hash === '#text-shadow') {
        setActiveTab('text-shadow')
      } else if (hash === '#box-shadow') {
        setActiveTab('box-shadow')
      }
    }
  }, [])

  // Update URL hash when tab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = activeTab === 'box-shadow' ? '' : activeTab === 'border-radius' ? '#border-radius' : '#text-shadow'
      if (window.location.hash !== hash) {
        window.history.replaceState(null, '', hash || window.location.pathname)
      }
    }
  }, [activeTab])

  // ========== BOX SHADOW STATE ==========
  const [boxShadows, setBoxShadows] = useState<BoxShadow[]>([
    { id: '1', hOffset: 10, vOffset: 10, blur: 20, spread: 0, color: '#000000', opacity: 0.3, inset: false }
  ])
  const [previewBg, setPreviewBg] = useState('#FFFFFF')

  // ========== BORDER RADIUS STATE ==========
  const [topLeft, setTopLeft] = useState(10)
  const [topRight, setTopRight] = useState(10)
  const [bottomRight, setBottomRight] = useState(10)
  const [bottomLeft, setBottomLeft] = useState(10)
  const [linked, setLinked] = useState(true)
  const [unit, setUnit] = useState<'px' | 'em' | 'rem' | '%'>('px')

  // ========== TEXT SHADOW STATE ==========
  const [textShadows, setTextShadows] = useState<TextShadow[]>([
    { offsetX: 2, offsetY: 2, blur: 4, color: '#000000', id: '1' }
  ])
  const [text, setText] = useState('Sample Text')
  const [textSize, setTextSize] = useState(48)
  const [textColor, setTextColor] = useState('#000000')

  // ========== BOX SHADOW FUNCTIONS ==========
  // Оптимизировано: убрали избыточный useCallback + useMemo, используем только useMemo
  const boxShadowCSS = useMemo(() => {
    const shadowValues = boxShadows.map(shadow => {
      const rgba = hexToRgba(shadow.color, shadow.opacity)
      const inset = shadow.inset ? 'inset ' : ''
      return `${inset}${shadow.hOffset}px ${shadow.vOffset}px ${shadow.blur}px ${shadow.spread}px ${rgba}`
    })
    return shadowValues.join(', ')
  }, [boxShadows])

  // ========== BORDER RADIUS FUNCTIONS ==========
  const handleRadiusChange = useCallback((value: number, corner: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft') => {
    if (linked) {
      setTopLeft(value)
      setTopRight(value)
      setBottomRight(value)
      setBottomLeft(value)
    } else {
      switch (corner) {
        case 'topLeft': setTopLeft(value); break
        case 'topRight': setTopRight(value); break
        case 'bottomRight': setBottomRight(value); break
        case 'bottomLeft': setBottomLeft(value); break
      }
    }
  }, [linked])

  // Оптимизированные функции обновления для boxShadows
  const updateBoxShadow = useCallback((id: string, updates: Partial<BoxShadow>) => {
    setBoxShadows(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }, [])

  const removeBoxShadow = useCallback((id: string) => {
    setBoxShadows(prev => prev.filter(s => s.id !== id))
  }, [])

  const addBoxShadow = useCallback(() => {
    setBoxShadows(prev => [...prev, { id: Date.now().toString(), hOffset: 0, vOffset: 0, blur: 10, spread: 0, color: '#000000', opacity: 0.3, inset: false }])
  }, [])

  // Оптимизированные функции обновления для textShadows
  const updateTextShadow = useCallback((id: string, updates: Partial<TextShadow>) => {
    setTextShadows(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }, [])

  const removeTextShadow = useCallback((id: string) => {
    setTextShadows(prev => prev.filter(s => s.id !== id))
  }, [])

  const addTextShadow = useCallback(() => {
    setTextShadows(prev => [...prev, { offsetX: 2, offsetY: 2, blur: 4, color: '#000000', id: Date.now().toString() }])
  }, [])

  const borderRadiusCSS = useMemo(() => {
    if (topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft) {
      return `${topLeft}${unit}`
    }
    return `${topLeft}${unit} ${topRight}${unit} ${bottomRight}${unit} ${bottomLeft}${unit}`
  }, [topLeft, topRight, bottomRight, bottomLeft, unit])

  // ========== TEXT SHADOW FUNCTIONS ==========
  const textShadowCSS = useMemo(() => {
    if (textShadows.length === 0) return 'none'
    return textShadows.map(shadow => 
      `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.color}`
    ).join(', ')
  }, [textShadows])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Silent fail
    }
  }

  return (
    <Layout
      title="🎨 CSS Generators - Box Shadow, Border Radius & Text Shadow"
      description="All-in-one CSS generators: create box shadows, border radius, and text shadows with visual preview. Free online CSS generators for developers."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Tabs */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('box-shadow')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'box-shadow'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Box Shadow
            </button>
            <button
              onClick={() => setActiveTab('border-radius')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'border-radius'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Border Radius
            </button>
            <button
              onClick={() => setActiveTab('text-shadow')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'text-shadow'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Text Shadow
            </button>
          </div>
        </div>

        {/* Box Shadow Tab */}
        {activeTab === 'box-shadow' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Box Shadow Controls</h2>
                
                {boxShadows.map((shadow, index) => (
                  <div key={shadow.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between mb-3">
                      <h3 className="text-sm font-semibold">Shadow {index + 1}</h3>
                      {boxShadows.length > 1 && (
                        <button
                          onClick={() => removeBoxShadow(shadow.id)}
                          className="text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">H-Offset: {shadow.hOffset}px</label>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={shadow.hOffset}
                          onChange={(e) => updateBoxShadow(shadow.id, { hOffset: Number(e.target.value) })}
                          className="w-full accent-primary-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">V-Offset: {shadow.vOffset}px</label>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={shadow.vOffset}
                          onChange={(e) => updateBoxShadow(shadow.id, { vOffset: Number(e.target.value) })}
                          className="w-full accent-primary-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Blur: {shadow.blur}px</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={shadow.blur}
                          onChange={(e) => updateBoxShadow(shadow.id, { blur: Number(e.target.value) })}
                          className="w-full accent-primary-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Spread: {shadow.spread}px</label>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={shadow.spread}
                          onChange={(e) => updateBoxShadow(shadow.id, { spread: Number(e.target.value) })}
                          className="w-full accent-primary-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Color</label>
                        <input
                          type="color"
                          value={shadow.color}
                          onChange={(e) => updateBoxShadow(shadow.id, { color: e.target.value })}
                          className="w-full h-8 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Opacity: {Math.round(shadow.opacity * 100)}%</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={shadow.opacity}
                          onChange={(e) => updateBoxShadow(shadow.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-primary-600"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shadow.inset}
                        onChange={(e) => updateBoxShadow(shadow.id, { inset: e.target.checked })}
                        className="w-4 h-4 accent-primary-600"
                      />
                      <span className="text-xs">Inset shadow</span>
                    </label>
                  </div>
                ))}

                <button
                  onClick={addBoxShadow}
                  className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
                >
                  + Add Shadow
                </button>

                <div>
                  <label className="block text-sm font-semibold mb-2">Preview Background</label>
                  <input
                    type="color"
                    value={previewBg}
                    onChange={(e) => setPreviewBg(e.target.value)}
                    className="w-full h-10 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-bold">Preview & Output</h2>
                <div
                  className="w-full h-64 rounded-lg border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center"
                  style={{ backgroundColor: previewBg, boxShadow: boxShadowCSS }}
                >
                  <div className="text-gray-400 text-center">
                    <div className="text-lg font-semibold mb-2">Shadow Preview</div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-semibold">CSS Code</label>
                    <button
                      onClick={() => copyToClipboard(`box-shadow: ${boxShadowCSS};`)}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      Copy
                    </button>
                  </div>
                  <code className="block p-4 bg-gray-50 dark:bg-gray-800 border rounded-lg font-mono text-sm break-all">
                    box-shadow: {boxShadowCSS};
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Border Radius Tab */}
        {activeTab === 'border-radius' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <div className="space-y-6">
              <div className="flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-xl">
                <div
                  className="bg-gradient-to-br from-primary-500 to-purple-500 shadow-lg"
                  style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: borderRadiusCSS,
                    transition: 'border-radius 0.2s ease'
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="linked"
                  checked={linked}
                  onChange={(e) => setLinked(e.target.checked)}
                  className="w-4 h-4 accent-primary-600"
                />
                <label htmlFor="linked" className="text-sm font-medium cursor-pointer">Link all corners</label>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as typeof unit)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="px">px</option>
                  <option value="em">em</option>
                  <option value="rem">rem</option>
                  <option value="%">%</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Top Left', value: topLeft, corner: 'topLeft' as const },
                  { label: 'Top Right', value: topRight, corner: 'topRight' as const },
                  { label: 'Bottom Right', value: bottomRight, corner: 'bottomRight' as const },
                  { label: 'Bottom Left', value: bottomLeft, corner: 'bottomLeft' as const },
                ].map(({ label, value, corner }) => (
                  <div key={corner}>
                    <label className="block text-sm font-semibold mb-2">{label}: {value}{unit}</label>
                    <input
                      type="range"
                      min="0"
                      max={unit === '%' ? 50 : 100}
                      value={value}
                      onChange={(e) => handleRadiusChange(parseInt(e.target.value), corner)}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg accent-primary-600"
                    />
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-semibold">CSS Code</label>
                  <button
                    onClick={() => copyToClipboard(`border-radius: ${borderRadiusCSS};`)}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Copy
                  </button>
                </div>
                <code className="block p-4 bg-gray-50 dark:bg-gray-800 border rounded-lg font-mono text-sm">
                  border-radius: {borderRadiusCSS};
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Text Shadow Tab */}
        {activeTab === 'text-shadow' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <div className="space-y-6">
              <div className="flex items-center justify-center p-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-xl">
                <span
                  style={{
                    fontSize: `${textSize}px`,
                    color: textColor,
                    textShadow: textShadowCSS,
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {text || 'Sample Text'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Text</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Font Size: {textSize}px</label>
                  <input
                    type="range"
                    min="24"
                    max="120"
                    value={textSize}
                    onChange={(e) => setTextSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg accent-primary-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-16 h-10 border rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-4">
                  <label className="block text-sm font-semibold">Text Shadows</label>
                  <button
                    onClick={addTextShadow}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                  >
                    + Add Shadow
                  </button>
                </div>

                <div className="space-y-4">
                  {textShadows.map((shadow, index) => (
                    <div key={shadow.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                      <div className="flex justify-between mb-4">
                        <span className="text-sm font-medium">Shadow {index + 1}</span>
                        <button
                          onClick={() => removeTextShadow(shadow.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs mb-1">Offset X: {shadow.offsetX}px</label>
                          <input
                            type="range"
                            min="-20"
                            max="20"
                            value={shadow.offsetX}
                            onChange={(e) => updateTextShadow(shadow.id, { offsetX: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg accent-primary-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Offset Y: {shadow.offsetY}px</label>
                          <input
                            type="range"
                            min="-20"
                            max="20"
                            value={shadow.offsetY}
                            onChange={(e) => updateTextShadow(shadow.id, { offsetY: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg accent-primary-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Blur: {shadow.blur}px</label>
                          <input
                            type="range"
                            min="0"
                            max="50"
                            value={shadow.blur}
                            onChange={(e) => updateTextShadow(shadow.id, { blur: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg accent-primary-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={shadow.color}
                              onChange={(e) => updateTextShadow(shadow.id, { color: e.target.value })}
                              className="w-12 h-10 border rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={shadow.color}
                              onChange={(e) => updateTextShadow(shadow.id, { color: e.target.value })}
                              className="flex-1 px-2 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-semibold">CSS Code</label>
                  <button
                    onClick={() => copyToClipboard(`text-shadow: ${textShadowCSS};`)}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Copy
                  </button>
                </div>
                <code className="block p-4 bg-gray-50 dark:bg-gray-900 border rounded-lg font-mono text-sm">
                  text-shadow: {textShadowCSS || 'none'};
                </code>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

