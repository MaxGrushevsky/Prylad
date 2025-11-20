'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type GradientType = 'linear' | 'radial'
type Direction = 'to right' | 'to left' | 'to top' | 'to bottom' | 'to top right' | 'to top left' | 'to bottom right' | 'to bottom left' | string

const presets = [
  { name: 'Sunset', colors: ['#FF6B6B', '#FFE66D', '#FF6B9D'] },
  { name: 'Ocean', colors: ['#667EEA', '#764BA2', '#667EEA'] },
  { name: 'Forest', colors: ['#134E5E', '#71B280', '#134E5E'] },
  { name: 'Fire', colors: ['#FF416C', '#FF4B2B', '#FF416C'] },
  { name: 'Purple Dream', colors: ['#667EEA', '#764BA2', '#F093FB'] },
  { name: 'Cool Blue', colors: ['#4FACFE', '#00F2FE', '#4FACFE'] },
  { name: 'Warm Orange', colors: ['#FA8BFF', '#2BD2FF', '#2BFF88'] },
  { name: 'Dark Night', colors: ['#0F2027', '#203A43', '#2C5364'] },
]

export default function GradientGeneratorPage() {
  const [gradientType, setGradientType] = useState<GradientType>('linear')
  const [colors, setColors] = useState<string[]>(['#3b82f6', '#8b5cf6'])
  const [direction, setDirection] = useState<Direction>('to right')
  const [angle, setAngle] = useState(90)
  const [useAngle, setUseAngle] = useState(false)
  const [css, setCss] = useState('')
  const [totalGenerated, setTotalGenerated] = useState(0)

  const generateCSS = useCallback(() => {
    const colorString = colors.join(', ')
    let cssCode = ''
    
    if (gradientType === 'linear') {
      const dir = useAngle ? `${angle}deg` : direction
      cssCode = `background: linear-gradient(${dir}, ${colorString});`
    } else {
      cssCode = `background: radial-gradient(circle, ${colorString});`
    }
    
    setCss(cssCode)
    setTotalGenerated(prev => prev + 1)
  }, [colors, direction, angle, useAngle, gradientType])

  const addColor = () => {
    if (colors.length < 5) {
      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
      setColors([...colors, randomColor])
    }
  }

  const removeColor = (index: number) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index))
    }
  }

  const updateColor = (index: number, color: string) => {
    const newColors = [...colors]
    newColors[index] = color
    setColors(newColors)
  }

  const applyPreset = (preset: typeof presets[0]) => {
    setColors([...preset.colors])
    setGradientType('linear')
    setUseAngle(false)
    setDirection('to right')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(css)
  }

  const copyCSSProperty = () => {
    const property = css.replace('background: ', '')
    navigator.clipboard.writeText(property)
  }

  const exportToFile = () => {
    if (!css) return
    
    const content = `${css}\n\n/* Full CSS */\n.gradient {\n  ${css}\n}`
    const blob = new Blob([content], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `gradient-${Date.now()}.css`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      gradientType,
      colors,
      direction,
      angle,
      useAngle
    }
    localStorage.setItem('gradientGeneratorSettings', JSON.stringify(settings))
  }, [gradientType, colors, direction, angle, useAngle])

  // Load settings and auto-generate on mount
  useEffect(() => {
    const saved = localStorage.getItem('gradientGeneratorSettings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        setGradientType(settings.gradientType || 'linear')
        setColors(settings.colors || ['#3b82f6', '#8b5cf6'])
        setDirection(settings.direction || 'to right')
        setAngle(settings.angle || 90)
        setUseAngle(settings.useAngle || false)
      } catch (e) {
        // Ignore parse errors
      }
    }
    // Auto-generate on mount
    setTimeout(() => {
      generateCSS()
    }, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Regenerate CSS when settings change
  useEffect(() => {
    generateCSS()
  }, [colors, direction, angle, useAngle, gradientType, generateCSS])

  const getGradientStyle = () => {
    const colorString = colors.join(', ')
    if (gradientType === 'linear') {
      const dir = useAngle ? `${angle}deg` : direction
      return { background: `linear-gradient(${dir}, ${colorString})` }
    } else {
      return { background: `radial-gradient(circle, ${colorString})` }
    }
  }

  // SEO data
  const toolPath = '/gradient-generator'
  const toolName = 'CSS Gradient Generator'
  const category = 'design'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is a CSS gradient?",
      answer: "A CSS gradient is a smooth transition between two or more colors. CSS gradients are used to create visually appealing backgrounds, buttons, and other design elements. There are two main types: linear gradients (straight line) and radial gradients (circular)."
    },
    {
      question: "How do I create a gradient?",
      answer: "Select gradient type (linear or radial), add colors using the color pickers, choose direction or angle, and the CSS code is generated automatically. You can also use preset gradients for quick results."
    },
    {
      question: "What's the difference between linear and radial gradients?",
      answer: "Linear gradients transition colors along a straight line in a specified direction. Radial gradients transition colors from a center point outward in a circular or elliptical pattern."
    },
    {
      question: "Can I use more than two colors in a gradient?",
      answer: "Yes! You can add multiple colors to create complex, multi-color gradients. Click 'Add Color' to add more color stops and create beautiful, sophisticated gradient effects."
    },
    {
      question: "How do I customize the gradient direction?",
      answer: "For linear gradients, you can choose from preset directions (to right, to left, to top, etc.) or use a custom angle (0-360 degrees). For radial gradients, you can adjust the position and shape."
    },
    {
      question: "Is the gradient generator free to use?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All gradient generation happens in your browser - we never see or store your data."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Choose Gradient Type",
      text: "Select 'Linear' for straight-line gradients or 'Radial' for circular gradients. Each type creates different visual effects."
    },
    {
      name: "Add Colors",
      text: "Use the color pickers to select your gradient colors. Click 'Add Color' to add more color stops for complex gradients."
    },
    {
      name: "Set Direction or Angle",
      text: "For linear gradients, choose a direction (to right, to top, etc.) or set a custom angle. For radial gradients, adjust the position."
    },
    {
      name: "Preview and Adjust",
      text: "See your gradient preview in real-time. Adjust colors, positions, and settings until you achieve the desired effect."
    },
    {
      name: "Copy CSS Code",
      text: "Copy the generated CSS code and use it in your stylesheets, inline styles, or any CSS-compatible environment."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Create CSS Gradients",
      "Learn how to create beautiful CSS gradients using our free online gradient generator tool.",
      howToSteps,
      "PT3M"
    ),
    generateSoftwareApplicationSchema(
      "CSS Gradient Generator",
      "Free online CSS gradient generator. Create linear and radial gradients with multiple colors, customizable directions, and preset options. Export CSS code instantly.",
      "https://prylad.pro/gradient-generator",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🌈 CSS Gradient Generator"
        description="Create beautiful CSS gradients online. Generate linear and radial gradients with multiple colors. Free gradient generator with presets and export options."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* Presets */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Presets:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => applyPreset(preset)}
                    className="h-16 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-400 transition-all relative group overflow-hidden"
                    style={{
                      background: `linear-gradient(to right, ${preset.colors.join(', ')})`
                    }}
                    title={preset.name}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <span className="relative z-10 text-white text-xs font-semibold drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gradient Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Gradient Type:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setGradientType('linear')}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    gradientType === 'linear'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Linear
                </button>
                <button
                  onClick={() => setGradientType('radial')}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    gradientType === 'radial'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Radial
                </button>
              </div>
            </div>

            {/* Colors */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Colors ({colors.length}/5):</label>
                {colors.length < 5 && (
                  <button
                    onClick={addColor}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Add Color
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {colors.map((color, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Color {index + 1}</label>
                      {colors.length > 2 && (
                        <button
                          onClick={() => removeColor(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 text-xs"
                          title="Remove color"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <label className="relative block cursor-pointer group">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => updateColor(index, e.target.value)}
                        className="w-full h-14 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary-400 transition-all opacity-0 absolute bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      />
                      <div 
                        className="w-full h-14 rounded-lg border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary-400 transition-all flex items-center justify-end px-4 relative overflow-hidden"
                        style={{ backgroundColor: color }}
                      >
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <svg className="w-5 h-5 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8)) drop-shadow(0 0 1px rgba(0,0,0,0.9))' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </label>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="w-full px-2 py-1 text-xs font-mono border border-gray-200 dark:border-gray-700 rounded focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="#000000"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Direction (for linear gradients) */}
            {gradientType === 'linear' && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="use-angle"
                    checked={useAngle}
                    onChange={(e) => setUseAngle(e.target.checked)}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <label htmlFor="use-angle" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Use custom angle
                  </label>
                </div>
                {useAngle ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Angle: <span className="text-primary-600 font-bold">{angle}°</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={angle}
                      onChange={(e) => setAngle(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-primary-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>0°</span>
                      <span>360°</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Direction:</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {(['to right', 'to left', 'to top', 'to bottom', 'to top right', 'to top left', 'to bottom right', 'to bottom left'] as Direction[]).map((dir) => (
                        <button
                          key={dir}
                          onClick={() => setDirection(dir)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            direction === dir
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {dir.replace('to ', '').replace(/\b\w/g, l => l.toUpperCase())}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Preview and CSS */}
            {css && (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preview:</label>
                  <div
                    className="w-full h-48 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg"
                    style={getGradientStyle()}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">CSS Code:</label>
                    <div className="flex gap-2">
                      <button
                        onClick={exportToFile}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                      </button>
                      <button
                        onClick={copyCSSProperty}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Copy Property
                      </button>
                      <button
                        onClick={copyToClipboard}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                      >
                        Copy CSS
                      </button>
                    </div>
                  </div>
                  <code className="block p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                    {css}
                  </code>
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      <strong>Usage:</strong> Use this CSS property directly in your stylesheet or inline style attribute.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics */}
            {totalGenerated > 0 && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                Total generated: <span className="font-semibold text-primary-600">{totalGenerated}</span> gradients
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What are CSS Gradients?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                CSS gradients are smooth transitions between two or more colors. They&apos;re a powerful design tool that 
                allows you to create visually appealing backgrounds, buttons, and UI elements without using images. 
                Gradients can be linear (flowing in a direction) or radial (radiating from a center point).
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Modern web design heavily relies on gradients for creating depth, visual interest, and modern aesthetics. 
                They&apos;re lightweight (no image files needed), scalable, and can be easily customized. Our gradient 
                generator makes it easy to create professional gradients with multiple colors and various directions.
              </p>
            </div>
          </section>

          {/* Types of Gradients */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Types of CSS Gradients</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Linear Gradients</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                  Linear gradients transition colors along a straight line. You can control the direction (top, bottom, 
                  left, right, diagonals) or use custom angles (0-360 degrees). Perfect for backgrounds, buttons, and 
                  section dividers.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400"><strong>Best for:</strong> Backgrounds, buttons, headers, section dividers</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Radial Gradients</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                  Radial gradients radiate outward from a central point, creating circular or elliptical color transitions. 
                  Great for creating spotlight effects, glowing backgrounds, or circular design elements.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400"><strong>Best for:</strong> Spotlight effects, glowing backgrounds, circular elements</p>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎨 Website Backgrounds</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Create eye-catching hero sections, landing pages, and full-page backgrounds. Gradients add depth and 
                  visual interest without overwhelming content.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔘 Buttons & CTAs</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Make call-to-action buttons stand out with gradient backgrounds. Gradients can make buttons feel more 
                  modern and clickable.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📱 Mobile App Design</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use gradients in mobile app interfaces for headers, cards, and navigation elements. They create a 
                  premium, polished look.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎭 Brand Identity</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Incorporate gradients into your brand&apos;s visual identity. Many modern brands use gradients as a key 
                  design element.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌈</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Multiple Colors</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Create gradients with up to 5 colors for complex, multi-stop gradients. Add or remove colors 
                    dynamically to achieve the perfect effect.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📐</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Flexible Directions</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Choose from 8 preset directions or use custom angles (0-360°). Perfect control over gradient 
                    orientation for any design need.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Gradient Types</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Generate both linear and radial gradients. Switch between types instantly to see which works 
                    best for your design.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Quick Presets</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Start with beautiful preset gradients like Sunset, Ocean, Forest, and more. One click to apply 
                    and customize.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📥</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Export Options</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Copy the CSS property, full CSS rule, or export to a CSS file. Ready to use in any project 
                    immediately.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Privacy First</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    All gradient generation happens locally in your browser. We never see, store, or have access 
                    to your gradients.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How many colors can I use in a gradient?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  You can use up to 5 colors in a single gradient. This allows for complex, multi-stop gradients 
                  with smooth transitions between multiple color points.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the difference between linear and radial gradients?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Linear gradients transition colors along a straight line in a specific direction. Radial gradients 
                  radiate outward from a center point in a circular or elliptical pattern. Choose based on your 
                  design needs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I use custom angles for linear gradients?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes! Enable &quot;Use custom angle&quot; and adjust the slider from 0° to 360° for precise control over 
                  gradient direction. 0° is upward, 90° is rightward, and so on.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Are the generated gradients compatible with all browsers?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes! CSS gradients are supported by all modern browsers (Chrome, Firefox, Safari, Edge). The 
                  syntax we generate is standard CSS and works everywhere.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I use these gradients commercially?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Absolutely! All generated gradients are free to use for any purpose, including commercial projects. 
                  There are no restrictions on usage.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Do you store the generated gradients?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, we don&apos;t store any gradients. All generation happens locally in your browser. Your settings 
                  are saved locally for convenience, but we never see or have access to your gradients.
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

