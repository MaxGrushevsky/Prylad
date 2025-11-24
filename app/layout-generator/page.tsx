'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

interface GridSettings {
  columns: string
  rows: string
  gap: number
  columnGap: number
  rowGap: number
  justifyItems: string
  alignItems: string
  justifyContent: string
  alignContent: string
}

interface FlexboxSettings {
  direction: string
  wrap: string
  justifyContent: string
  alignItems: string
  alignContent: string
  gap: number
}

interface Block {
  id: string
  content: string
  color: string
  width?: string
  height?: string
  gridColumn?: string
  gridRow?: string
}

const gridPresets = [
  {
    name: '3 Column Grid',
    settings: { columns: 'repeat(3, 1fr)', rows: 'auto', gap: 16, columnGap: 16, rowGap: 16, justifyItems: 'stretch', alignItems: 'stretch', justifyContent: 'start', alignContent: 'start' }
  },
  {
    name: '12 Column Grid',
    settings: { columns: 'repeat(12, 1fr)', rows: 'auto', gap: 16, columnGap: 16, rowGap: 16, justifyItems: 'stretch', alignItems: 'stretch', justifyContent: 'start', alignContent: 'start' }
  },
  {
    name: 'Auto Fit Grid',
    settings: { columns: 'repeat(auto-fit, minmax(200px, 1fr))', rows: 'auto', gap: 16, columnGap: 16, rowGap: 16, justifyItems: 'stretch', alignItems: 'stretch', justifyContent: 'start', alignContent: 'start' }
  },
  {
    name: 'Centered Grid',
    settings: { columns: 'repeat(3, 1fr)', rows: 'auto', gap: 16, columnGap: 16, rowGap: 16, justifyItems: 'center', alignItems: 'center', justifyContent: 'center', alignContent: 'center' }
  }
]

const flexboxPresets = [
  {
    name: 'Row Center',
    settings: { direction: 'row', wrap: 'nowrap', justifyContent: 'center', alignItems: 'center', alignContent: 'stretch', gap: 16 }
  },
  {
    name: 'Column Center',
    settings: { direction: 'column', wrap: 'nowrap', justifyContent: 'center', alignItems: 'center', alignContent: 'stretch', gap: 16 }
  },
  {
    name: 'Space Between',
    settings: { direction: 'row', wrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', alignContent: 'stretch', gap: 16 }
  },
  {
    name: 'Space Around',
    settings: { direction: 'row', wrap: 'wrap', justifyContent: 'space-around', alignItems: 'center', alignContent: 'stretch', gap: 16 }
  }
]

const defaultColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
]

export default function LayoutGeneratorPage() {
  const [type, setType] = useState<'grid' | 'flexbox'>('grid')
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', content: '1', color: defaultColors[0] },
    { id: '2', content: '2', color: defaultColors[1] },
    { id: '3', content: '3', color: defaultColors[2] },
    { id: '4', content: '4', color: defaultColors[3] },
    { id: '5', content: '5', color: defaultColors[4] },
    { id: '6', content: '6', color: defaultColors[5] }
  ])

  const [gridSettings, setGridSettings] = useState<GridSettings>({
    columns: 'repeat(3, 1fr)',
    rows: 'auto',
    gap: 16,
    columnGap: 16,
    rowGap: 16,
    justifyItems: 'stretch',
    alignItems: 'stretch',
    justifyContent: 'start',
    alignContent: 'start'
  })

  const [flexboxSettings, setFlexboxSettings] = useState<FlexboxSettings>({
    direction: 'row',
    wrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    alignContent: 'stretch',
    gap: 16
  })

  const [autoGenerate, setAutoGenerate] = useState(true)
  const [containerHeight, setContainerHeight] = useState(400)

  const generateGridCSS = useCallback((): string => {
    const styles: string[] = []
    styles.push('display: grid;')
    styles.push(`grid-template-columns: ${gridSettings.columns};`)
    styles.push(`grid-template-rows: ${gridSettings.rows};`)
    if (gridSettings.gap > 0) {
      styles.push(`gap: ${gridSettings.gap}px;`)
    } else {
      if (gridSettings.columnGap > 0) styles.push(`column-gap: ${gridSettings.columnGap}px;`)
      if (gridSettings.rowGap > 0) styles.push(`row-gap: ${gridSettings.rowGap}px;`)
    }
    styles.push(`justify-items: ${gridSettings.justifyItems};`)
    styles.push(`align-items: ${gridSettings.alignItems};`)
    styles.push(`justify-content: ${gridSettings.justifyContent};`)
    styles.push(`align-content: ${gridSettings.alignContent};`)
    return styles.join('\n')
  }, [gridSettings])

  const generateFlexboxCSS = useCallback((): string => {
    const styles: string[] = []
    styles.push('display: flex;')
    styles.push(`flex-direction: ${flexboxSettings.direction};`)
    styles.push(`flex-wrap: ${flexboxSettings.wrap};`)
    styles.push(`justify-content: ${flexboxSettings.justifyContent};`)
    styles.push(`align-items: ${flexboxSettings.alignItems};`)
    styles.push(`align-content: ${flexboxSettings.alignContent};`)
    if (flexboxSettings.gap > 0) {
      styles.push(`gap: ${flexboxSettings.gap}px;`)
    }
    return styles.join('\n')
  }, [flexboxSettings])

  const [css, setCss] = useState('')
  const [containerStyle, setContainerStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (autoGenerate || blocks.length > 0) {
      const cssCode = type === 'grid' ? generateGridCSS() : generateFlexboxCSS()
      setCss(cssCode)
      
      const styleObj: React.CSSProperties = {}
      if (type === 'grid') {
        styleObj.display = 'grid'
        styleObj.gridTemplateColumns = gridSettings.columns
        styleObj.gridTemplateRows = gridSettings.rows
        if (gridSettings.gap > 0) {
          styleObj.gap = `${gridSettings.gap}px`
        } else {
          if (gridSettings.columnGap > 0) styleObj.columnGap = `${gridSettings.columnGap}px`
          if (gridSettings.rowGap > 0) styleObj.rowGap = `${gridSettings.rowGap}px`
        }
        styleObj.justifyItems = gridSettings.justifyItems as any
        styleObj.alignItems = gridSettings.alignItems as any
        styleObj.justifyContent = gridSettings.justifyContent as any
        styleObj.alignContent = gridSettings.alignContent as any
      } else {
        styleObj.display = 'flex'
        styleObj.flexDirection = flexboxSettings.direction as any
        styleObj.flexWrap = flexboxSettings.wrap as any
        styleObj.justifyContent = flexboxSettings.justifyContent as any
        styleObj.alignItems = flexboxSettings.alignItems as any
        styleObj.alignContent = flexboxSettings.alignContent as any
        if (flexboxSettings.gap > 0) {
          styleObj.gap = `${flexboxSettings.gap}px`
        }
      }
      styleObj.minHeight = `${containerHeight}px`
      setContainerStyle(styleObj)
    }
  }, [type, gridSettings, flexboxSettings, blocks, autoGenerate, generateGridCSS, generateFlexboxCSS, containerHeight])

  const addBlock = () => {
    const newBlock: Block = {
      id: Date.now().toString(),
      content: (blocks.length + 1).toString(),
      color: defaultColors[blocks.length % defaultColors.length]
    }
    setBlocks(prev => [...prev, newBlock])
  }

  const removeBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(prev => prev.filter(b => b.id !== id))
    }
  }

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }

  const duplicateBlock = (id: string) => {
    const block = blocks.find(b => b.id === id)
    if (block) {
      const newBlock: Block = {
        ...block,
        id: Date.now().toString(),
        content: (blocks.length + 1).toString()
      }
      setBlocks(prev => [...prev, newBlock])
    }
  }

  const applyPreset = (preset: typeof gridPresets[0] | typeof flexboxPresets[0]) => {
    if (type === 'grid' && 'columns' in preset.settings) {
      setGridSettings(preset.settings as GridSettings)
    } else if (type === 'flexbox' && 'direction' in preset.settings) {
      setFlexboxSettings(preset.settings as FlexboxSettings)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.error('Failed to copy')
    }
  }

  const exportToFile = () => {
    const cssContent = `.container {\n  ${css.split('\n').join('\n  ')}\n}`
    const blob = new Blob([cssContent], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `${type}-layout-${Date.now()}.css`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setBlocks([
      { id: '1', content: '1', color: defaultColors[0] },
      { id: '2', content: '2', color: defaultColors[1] }
    ])
  }

  // SEO data
  const toolPath = '/layout-generator'
  const toolName = 'CSS Grid & Flexbox Generator'
  const category = 'design'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is CSS Grid and Flexbox?",
      answer: "CSS Grid is a two-dimensional layout system for creating complex grid-based layouts. Flexbox is a one-dimensional layout system for arranging items in rows or columns. Both are modern CSS layout methods that make responsive design easier."
    },
    {
      question: "How do I create a Grid layout?",
      answer: "Select 'Grid' layout type, add blocks to your layout, configure grid properties (columns, rows, gaps, alignment), and see the layout update in real-time. Export the CSS code when you're done."
    },
    {
      question: "How do I create a Flexbox layout?",
      answer: "Select 'Flexbox' layout type, add blocks, configure flex properties (direction, wrap, justify-content, align-items, gap), and see the layout update in real-time. Export the CSS code when you're done."
    },
    {
      question: "Can I customize block properties?",
      answer: "Yes! Each block can be customized with content, background color, and size. You can add, remove, and reorder blocks to create your desired layout structure."
    },
    {
      question: "Can I export the CSS code?",
      answer: "Yes! Click 'Copy CSS' to copy the generated CSS code to your clipboard. Use it directly in your stylesheets or projects. The code includes all the properties you've configured."
    },
    {
      question: "Is the layout generator free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All layout generation happens in your browser - we never see or store your layouts."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Choose Layout Type",
      text: "Select 'Grid' for two-dimensional layouts or 'Flexbox' for one-dimensional layouts. Each type has different properties and use cases."
    },
    {
      name: "Add Blocks",
      text: "Click 'Add Block' to add content blocks to your layout. Each block can be customized with content, color, and size."
    },
    {
      name: "Configure Properties",
      text: "Adjust layout properties: for Grid (columns, rows, gaps, alignment), for Flexbox (direction, wrap, justify-content, align-items, gap). See changes in real-time."
    },
    {
      name: "Preview Layout",
      text: "See your layout preview update automatically as you change properties. The visual preview shows exactly how your layout will look."
    },
    {
      name: "Export CSS",
      text: "Click 'Copy CSS' to copy the generated CSS code. Use it in your stylesheets, projects, or any CSS-compatible environment."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Create CSS Grid and Flexbox Layouts",
      "Learn how to create CSS Grid and Flexbox layouts visually using our free online layout generator tool with real-time preview.",
      howToSteps,
      "PT3M"
    ),
    generateSoftwareApplicationSchema(
      "CSS Grid & Flexbox Generator",
      "Free online CSS Grid and Flexbox layout generator. Create layouts visually, adjust properties, see real-time preview, and export CSS code. Perfect for web designers and developers.",
      "https://prylad.pro/layout-generator",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="📐 CSS Grid & Flexbox Generator - Visual Layout Builder"
        description="Create CSS Grid and Flexbox layouts visually. Add blocks, adjust properties, see real-time preview, and export CSS code. Perfect for web designers and developers building responsive layouts."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Layout Controls</h2>
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Layout Type:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setType('grid')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    type === 'grid'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  CSS Grid
                </button>
                <button
                  onClick={() => setType('flexbox')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    type === 'flexbox'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Flexbox
                </button>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Presets:</label>
              <div className="grid grid-cols-2 gap-2">
                {(type === 'grid' ? gridPresets : flexboxPresets).map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-2 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs transition-colors"
                  >
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Settings */}
            {type === 'grid' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Grid Settings</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Columns: {gridSettings.columns}
                  </label>
                  <input
                    type="text"
                    value={gridSettings.columns}
                    onChange={(e) => setGridSettings(prev => ({ ...prev, columns: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded text-sm font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="repeat(3, 1fr)"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Examples: repeat(3, 1fr), 1fr 2fr 1fr, 200px auto
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Rows: {gridSettings.rows}
                  </label>
                  <input
                    type="text"
                    value={gridSettings.rows}
                    onChange={(e) => setGridSettings(prev => ({ ...prev, rows: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded text-sm font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="auto"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Gap</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gridSettings.gap}
                      onChange={(e) => setGridSettings(prev => ({ ...prev, gap: Number(e.target.value) || 0 }))}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Col Gap</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gridSettings.columnGap}
                      onChange={(e) => setGridSettings(prev => ({ ...prev, columnGap: Number(e.target.value) || 0 }))}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Row Gap</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gridSettings.rowGap}
                      onChange={(e) => setGridSettings(prev => ({ ...prev, rowGap: Number(e.target.value) || 0 }))}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Justify Items</label>
                    <select
                      value={gridSettings.justifyItems}
                      onChange={(e) => setGridSettings(prev => ({ ...prev, justifyItems: e.target.value }))}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="stretch">stretch</option>
                      <option value="start">start</option>
                      <option value="end">end</option>
                      <option value="center">center</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Align Items</label>
                    <select
                      value={gridSettings.alignItems}
                      onChange={(e) => setGridSettings(prev => ({ ...prev, alignItems: e.target.value }))}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="stretch">stretch</option>
                      <option value="start">start</option>
                      <option value="end">end</option>
                      <option value="center">center</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Justify Content</label>
                    <select
                      value={gridSettings.justifyContent}
                      onChange={(e) => setGridSettings(prev => ({ ...prev, justifyContent: e.target.value }))}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="start">start</option>
                      <option value="end">end</option>
                      <option value="center">center</option>
                      <option value="stretch">stretch</option>
                      <option value="space-around">space-around</option>
                      <option value="space-between">space-between</option>
                      <option value="space-evenly">space-evenly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Align Content</label>
                    <select
                      value={gridSettings.alignContent}
                      onChange={(e) => setGridSettings(prev => ({ ...prev, alignContent: e.target.value }))}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="start">start</option>
                      <option value="end">end</option>
                      <option value="center">center</option>
                      <option value="stretch">stretch</option>
                      <option value="space-around">space-around</option>
                      <option value="space-between">space-between</option>
                      <option value="space-evenly">space-evenly</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Flexbox Settings */}
            {type === 'flexbox' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Flexbox Settings</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Direction</label>
                    <select
                      value={flexboxSettings.direction}
                      onChange={(e) => setFlexboxSettings(prev => ({ ...prev, direction: e.target.value }))}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="row">row</option>
                      <option value="row-reverse">row-reverse</option>
                      <option value="column">column</option>
                      <option value="column-reverse">column-reverse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Wrap</label>
                    <select
                      value={flexboxSettings.wrap}
                      onChange={(e) => setFlexboxSettings(prev => ({ ...prev, wrap: e.target.value }))}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="nowrap">nowrap</option>
                      <option value="wrap">wrap</option>
                      <option value="wrap-reverse">wrap-reverse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Justify Content</label>
                    <select
                      value={flexboxSettings.justifyContent}
                      onChange={(e) => setFlexboxSettings(prev => ({ ...prev, justifyContent: e.target.value }))}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="flex-start">flex-start</option>
                      <option value="flex-end">flex-end</option>
                      <option value="center">center</option>
                      <option value="space-between">space-between</option>
                      <option value="space-around">space-around</option>
                      <option value="space-evenly">space-evenly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Align Items</label>
                    <select
                      value={flexboxSettings.alignItems}
                      onChange={(e) => setFlexboxSettings(prev => ({ ...prev, alignItems: e.target.value }))}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="stretch">stretch</option>
                      <option value="flex-start">flex-start</option>
                      <option value="flex-end">flex-end</option>
                      <option value="center">center</option>
                      <option value="baseline">baseline</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Align Content</label>
                    <select
                      value={flexboxSettings.alignContent}
                      onChange={(e) => setFlexboxSettings(prev => ({ ...prev, alignContent: e.target.value }))}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="stretch">stretch</option>
                      <option value="flex-start">flex-start</option>
                      <option value="flex-end">flex-end</option>
                      <option value="center">center</option>
                      <option value="space-between">space-between</option>
                      <option value="space-around">space-around</option>
                      <option value="space-evenly">space-evenly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Gap (px)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={flexboxSettings.gap}
                      onChange={(e) => setFlexboxSettings(prev => ({ ...prev, gap: Number(e.target.value) || 0 }))}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Blocks Management */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Blocks ({blocks.length})</h3>
                <button
                  onClick={addBlock}
                  className="px-3 py-1 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 transition-colors"
                >
                  + Add Block
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {blocks.map((block, index) => (
                  <div key={block.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Block {index + 1}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => duplicateBlock(block.id)}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Dup
                        </button>
                        {blocks.length > 1 && (
                          <button
                            onClick={() => removeBlock(block.id)}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Content</label>
                        <input
                          type="text"
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Color</label>
                        <input
                          type="color"
                          value={block.color}
                          onChange={(e) => updateBlock(block.id, { color: e.target.value })}
                          className="w-full h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-700"
                        />
                      </div>
                    </div>
                    {type === 'grid' && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Grid Column</label>
                          <input
                            type="text"
                            value={block.gridColumn || ''}
                            onChange={(e) => updateBlock(block.id, { gridColumn: e.target.value || undefined })}
                            className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                            placeholder="auto"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Grid Row</label>
                          <input
                            type="text"
                            value={block.gridRow || ''}
                            onChange={(e) => updateBlock(block.id, { gridRow: e.target.value || undefined })}
                            className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                            placeholder="auto"
                          />
                        </div>
                      </div>
                    )}
                    {type === 'flexbox' && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Width</label>
                          <input
                            type="text"
                            value={block.width || ''}
                            onChange={(e) => updateBlock(block.id, { width: e.target.value || undefined })}
                            className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                            placeholder="auto"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Height</label>
                          <input
                            type="text"
                            value={block.height || ''}
                            onChange={(e) => updateBlock(block.id, { height: e.target.value || undefined })}
                            className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                            placeholder="auto"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Container Height */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Container Height: {containerHeight}px
              </label>
              <input
                type="range"
                min="200"
                max="800"
                value={containerHeight}
                onChange={(e) => setContainerHeight(Number(e.target.value))}
                className="w-full accent-primary-600"
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
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-generate as you edit</span>
            </label>

            {!autoGenerate && (
              <button
                onClick={() => {
                  const cssCode = type === 'grid' ? generateGridCSS() : generateFlexboxCSS()
                  setCss(cssCode)
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
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Live Preview & CSS Output</h2>

            {/* Preview */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Visual Preview</label>
              <div
                className="w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 overflow-auto"
                style={containerStyle}
              >
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-center text-white font-semibold rounded transition-all"
                    style={{
                      backgroundColor: block.color,
                      gridColumn: block.gridColumn,
                      gridRow: block.gridRow,
                      width: block.width,
                      height: block.height,
                      minHeight: '60px',
                      minWidth: '60px'
                    }}
                  >
                    {block.content}
                  </div>
                ))}
              </div>
            </div>

            {/* CSS Output */}
            {css && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">CSS Code</label>
                  <button
                    onClick={() => copyToClipboard(css)}
                    className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Copy CSS
                  </button>
                </div>
                <code className="block p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg font-mono text-sm whitespace-pre overflow-x-auto text-gray-900 dark:text-gray-200">
                  {css}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">CSS Grid vs Flexbox</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                <strong>CSS Grid</strong> is a two-dimensional layout system, meaning it can handle both columns and rows. 
                It&apos;s perfect for creating complex layouts with precise control over both axes. Grid excels at creating 
                page layouts, card grids, and any design that needs alignment in two dimensions.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                <strong>Flexbox</strong> is a one-dimensional layout method for laying out items in rows or columns. 
                It&apos;s ideal for distributing space and aligning content within a container. Flexbox is perfect for 
                navigation bars, centering content, and creating flexible components.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our visual layout generator lets you experiment with both Grid and Flexbox. Add blocks, adjust properties, 
                and see your layout update in real-time. Perfect for learning, prototyping, and generating production-ready CSS.
              </p>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">CSS Grid Properties</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">grid-template-columns</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Defines the line names and track sizing functions of the grid columns.
                </p>
                <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm overflow-x-auto text-gray-900 dark:text-gray-200">
{`grid-template-columns: repeat(3, 1fr);
grid-template-columns: 1fr 2fr 1fr;
grid-template-columns: 200px auto 300px;`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">grid-template-rows</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Defines the line names and track sizing functions of the grid rows.
                </p>
                <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm overflow-x-auto text-gray-900 dark:text-gray-200">
{`grid-template-rows: auto;
grid-template-rows: 100px 200px;
grid-template-rows: repeat(2, 1fr);`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">gap</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Sets the gaps (gutters) between rows and columns. Shorthand for row-gap and column-gap.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Flexbox Properties</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">flex-direction</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Establishes the main-axis, defining the direction flex items are placed in the flex container.
                </p>
                <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm overflow-x-auto text-gray-900 dark:text-gray-200">
{`flex-direction: row;        /* default */
flex-direction: column;
flex-direction: row-reverse;
flex-direction: column-reverse;`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">justify-content</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Defines how the browser distributes space between and around content items along the main-axis.
                </p>
                <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm overflow-x-auto text-gray-900 dark:text-gray-200">
{`justify-content: flex-start;
justify-content: center;
justify-content: space-between;
justify-content: space-around;`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">align-items</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Controls the alignment of items on the cross-axis (perpendicular to the main-axis).
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📐 Grid: Page Layouts</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use CSS Grid for overall page structure - header, sidebar, main content, footer. Grid&apos;s two-dimensional 
                  nature makes it perfect for complex layouts.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📱 Grid: Card Grids</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Create responsive card grids that automatically adjust to available space. Use repeat() and auto-fit/auto-fill 
                  for flexible, responsive designs.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎯 Flexbox: Navigation</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Flexbox is ideal for navigation bars. Use justify-content to space items, align-items to center vertically, 
                  and flex-wrap for responsive behavior.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎨 Flexbox: Centering</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  The easiest way to center content both horizontally and vertically. Use justify-content: center and 
                  align-items: center on a flex container.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔄 Combined Approach</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use Grid for the overall page layout and Flexbox for components within grid areas. This combines the 
                  strengths of both layout methods.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📦 Flexbox: Form Layouts</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Flexbox makes form layouts simple. Use flex-direction: column for stacked inputs, and flex properties 
                  on form elements for flexible sizing.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Visual Block Editor:</strong> Add, remove, duplicate, and customize blocks with colors and content.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Real-time Preview:</strong> See your layout update instantly as you adjust properties.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Grid & Flexbox:</strong> Switch between CSS Grid and Flexbox layouts with full property control.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Preset Library:</strong> Quick access to common layout patterns for both Grid and Flexbox.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Block Positioning:</strong> For Grid, set grid-column and grid-row. For Flexbox, set width and height.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Export CSS:</strong> Copy CSS code or export to a CSS file for use in your projects.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">When should I use Grid vs Flexbox?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use <strong>Grid</strong> for two-dimensional layouts (rows and columns) like page layouts, card grids, and complex designs. 
                  Use <strong>Flexbox</strong> for one-dimensional layouts (row OR column) like navigation bars, centering content, and flexible components.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I use Grid and Flexbox together?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Absolutely! Use Grid for the overall page structure and Flexbox for components within grid areas. This is a common 
                  and recommended approach that combines the strengths of both layout methods.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What does repeat() do in Grid?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">repeat(3, 1fr)</code> creates 3 columns, each taking 1 fraction of available space. 
                  <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">repeat(auto-fit, minmax(200px, 1fr))</code> creates as many columns as fit, 
                  each at least 200px wide.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How do I make a responsive grid?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">repeat(auto-fit, minmax(200px, 1fr))</code> or 
                  <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">repeat(auto-fill, minmax(200px, 1fr))</code>. 
                  This automatically adjusts the number of columns based on available space.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the difference between justify-content and align-items in Flexbox?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  <strong>justify-content</strong> aligns items along the main-axis (horizontal in row, vertical in column). 
                  <strong>align-items</strong> aligns items along the cross-axis (vertical in row, horizontal in column).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I save my layouts?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  You can export the CSS code to a file, which you can then use in your projects. All processing happens in your browser, 
                  so your layouts are never stored on our servers.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Design Tools" />
      )}
    </Layout>
    </>
  )
}
