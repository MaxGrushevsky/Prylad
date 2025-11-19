'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Layout from '@/components/Layout'

type PlaceholderStyle = 'solid' | 'gradient' | 'pattern' | 'checkerboard'
type PresetSize = 'custom' | 'banner' | 'square' | 'portrait' | 'landscape' | 'icon' | 'thumbnail' | 'hero'

const presets: Record<PresetSize, { width: number; height: number; label: string }> = {
  custom: { width: 800, height: 600, label: 'Custom' },
  banner: { width: 1200, height: 300, label: 'Banner (1200×300)' },
  square: { width: 800, height: 800, label: 'Square (800×800)' },
  portrait: { width: 600, height: 900, label: 'Portrait (600×900)' },
  landscape: { width: 1200, height: 675, label: 'Landscape (1200×675)' },
  icon: { width: 512, height: 512, label: 'Icon (512×512)' },
  thumbnail: { width: 300, height: 300, label: 'Thumbnail (300×300)' },
  hero: { width: 1920, height: 1080, label: 'Hero (1920×1080)' }
}

export default function PlaceholderGeneratorPage() {
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [bgColor, setBgColor] = useState('#CCCCCC')
  const [bgColor2, setBgColor2] = useState('#999999')
  const [textColor, setTextColor] = useState('#666666')
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(48)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('bold')
  const [style, setStyle] = useState<PlaceholderStyle>('solid')
  const [showText, setShowText] = useState(true)
  const [preset, setPreset] = useState<PresetSize>('custom')
  const [autoGenerate, setAutoGenerate] = useState(true)
  const [imageUrl, setImageUrl] = useState('')
  const [totalGenerated, setTotalGenerated] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generatePlaceholder = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = width
    canvas.height = height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Background
    if (style === 'solid') {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, width, height)
    } else if (style === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, bgColor)
      gradient.addColorStop(1, bgColor2)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    } else if (style === 'pattern') {
      // Diagonal stripes pattern
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = bgColor2
      ctx.lineWidth = 2
      const spacing = 20
      for (let i = -height; i < width + height; i += spacing) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + height, height)
        ctx.stroke()
      }
    } else if (style === 'checkerboard') {
      const tileSize = 50
      for (let x = 0; x < width; x += tileSize) {
        for (let y = 0; y < height; y += tileSize) {
          const tileX = Math.floor(x / tileSize)
          const tileY = Math.floor(y / tileSize)
          const isEven = (tileX + tileY) % 2 === 0
          ctx.fillStyle = isEven ? bgColor : bgColor2
          ctx.fillRect(x, y, tileSize, tileSize)
        }
      }
    }

    // Text
    if (showText) {
      const displayText = text || `${width} × ${height}`
      ctx.fillStyle = textColor
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Add text shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      
      ctx.fillText(displayText, width / 2, height / 2)
      
      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }

    setImageUrl(canvas.toDataURL('image/png'))
    setTotalGenerated(prev => prev + 1)
  }, [width, height, bgColor, bgColor2, textColor, text, fontSize, fontFamily, fontWeight, style, showText])

  useEffect(() => {
    if (!autoGenerate) return
    
    if (!canvasRef.current) {
      // Wait for canvas to be available
      const checkInterval = setInterval(() => {
        if (canvasRef.current) {
          clearInterval(checkInterval)
          generatePlaceholder()
        }
      }, 100)
      
      const timeout = setTimeout(() => {
        clearInterval(checkInterval)
      }, 2000)
      
      return () => {
        clearInterval(checkInterval)
        clearTimeout(timeout)
      }
    }
    
    const timeoutId = setTimeout(() => {
      generatePlaceholder()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [
    autoGenerate,
    width,
    height,
    bgColor,
    bgColor2,
    textColor,
    text,
    fontSize,
    fontFamily,
    fontWeight,
    style,
    showText,
    generatePlaceholder
  ])

  useEffect(() => {
    if (preset !== 'custom' && presets[preset]) {
      setWidth(presets[preset].width)
      setHeight(presets[preset].height)
    }
  }, [preset])

  const downloadImage = (format: 'png' | 'jpg' = 'png') => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `placeholder-${width}x${height}.${format}`
    if (format === 'png') {
      link.href = canvasRef.current.toDataURL('image/png')
    } else {
      link.href = canvasRef.current.toDataURL('image/jpeg', 0.9)
    }
    link.click()
  }

  const copyUrl = async () => {
    if (!imageUrl) return
    try {
      await navigator.clipboard.writeText(imageUrl)
    } catch (e) {
      console.error('Failed to copy')
    }
  }

  const copyHTML = () => {
    if (!imageUrl) return
    const html = `<img src="${imageUrl}" alt="Placeholder ${width}x${height}" width="${width}" height="${height}" />`
    navigator.clipboard.writeText(html)
  }

  const copyCSS = () => {
    if (!imageUrl) return
    const css = `background-image: url("${imageUrl}");`
    navigator.clipboard.writeText(css)
  }

  const applyPreset = (presetSize: PresetSize) => {
    setPreset(presetSize)
    if (presetSize !== 'custom') {
      setWidth(presets[presetSize].width)
      setHeight(presets[presetSize].height)
    }
  }

  return (
    <Layout
      title="🖼️ Placeholder Image Generator - Create Custom Placeholder Images Online"
      description="Generate placeholder images of any size online for free. Customize colors, text, styles, and patterns. Export as PNG or JPG. Perfect for web development and design mockups."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Settings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold">Placeholder Settings</h2>

            {/* Presets */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Quick Presets:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(presets).filter(([key]) => key !== 'custom').map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key as PresetSize)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      preset === key
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {value.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Width: {width}px
                </label>
                <input
                  type="range"
                  min="50"
                  max="4000"
                  step="10"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full accent-primary-600"
                />
                <input
                  type="number"
                  min="50"
                  max="4000"
                  value={width}
                  onChange={(e) => setWidth(Math.max(50, Math.min(4000, Number(e.target.value))))}
                  className="w-full mt-2 px-3 py-2 border-2 border-gray-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Height: {height}px
                </label>
                <input
                  type="range"
                  min="50"
                  max="4000"
                  step="10"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-primary-600"
                />
                <input
                  type="number"
                  min="50"
                  max="4000"
                  value={height}
                  onChange={(e) => setHeight(Math.max(50, Math.min(4000, Number(e.target.value))))}
                  className="w-full mt-2 px-3 py-2 border-2 border-gray-200 rounded-lg"
                />
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Background Style:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => setStyle('solid')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    style === 'solid'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Solid
                </button>
                <button
                  onClick={() => setStyle('gradient')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    style === 'gradient'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Gradient
                </button>
                <button
                  onClick={() => setStyle('pattern')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    style === 'pattern'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pattern
                </button>
                <button
                  onClick={() => setStyle('checkerboard')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    style === 'checkerboard'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Checker
                </button>
              </div>
            </div>

            {/* Colors */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Background Color</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-10 rounded-lg border-2 border-gray-200"
                />
              </div>
              {(style === 'gradient' || style === 'pattern' || style === 'checkerboard') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary Color</label>
                  <input
                    type="color"
                    value={bgColor2}
                    onChange={(e) => setBgColor2(e.target.value)}
                    className="w-full h-10 rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Text Options */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={showText}
                  onChange={(e) => setShowText(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Show text on placeholder</span>
              </label>

              {showText && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Text (leave empty for dimensions)
                    </label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter text or leave empty"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Font Size: {fontSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="200"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-primary-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Font Family</label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fontWeight === 'bold'}
                        onChange={(e) => setFontWeight(e.target.checked ? 'bold' : 'normal')}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Bold text</span>
                    </label>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Text Color</label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-10 rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  </div>
                </>
              )}
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
                onClick={generatePlaceholder}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
              >
                Generate Placeholder
              </button>
            )}
          </div>

          {/* Preview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Preview</h2>
              {totalGenerated > 0 && (
                <div className="text-sm text-gray-500">
                  Generated: <span className="font-semibold text-gray-900">{totalGenerated}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Hidden canvas for generation */}
              <canvas
                ref={canvasRef}
                style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
              />
              
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 overflow-auto max-h-[500px] flex justify-center items-center min-h-[200px]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`Placeholder ${width}x${height}`}
                    className="max-w-full h-auto rounded-lg mx-auto block"
                  />
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <p>Generating placeholder...</p>
                  </div>
                )}
              </div>

              {imageUrl && (
                <>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 mb-1">Dimensions</p>
                      <p className="font-semibold text-gray-900">{width} × {height}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 mb-1">Aspect Ratio</p>
                      <p className="font-semibold text-gray-900">
                        {Math.round((width / height) * 100) / 100}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => downloadImage('png')}
                      className="w-full bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors"
                    >
                      Download PNG
                    </button>
                    <button
                      onClick={() => downloadImage('jpg')}
                      className="w-full bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-orange-700 transition-colors"
                    >
                      Download JPG
                    </button>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={copyUrl}
                        className="px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Copy URL
                      </button>
                      <button
                        onClick={copyHTML}
                        className="px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Copy HTML
                      </button>
                      <button
                        onClick={copyCSS}
                        className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Copy CSS
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is a Placeholder Image?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Placeholder images are temporary images used during web development and design to represent where 
                actual images will be placed. They help developers and designers visualize layouts, test responsive 
                designs, and work on projects before final images are available.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free placeholder generator creates custom placeholder images instantly in your browser. You can 
                specify exact dimensions, customize colors, add text, choose from different styles (solid, gradient, 
                patterns), and export in PNG or JPG format. Perfect for prototyping, mockups, and development workflows.
              </p>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Our Placeholder Generator</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li><strong>Choose a Preset:</strong> Select from common sizes like banner, square, portrait, or landscape, or use custom dimensions.</li>
                <li><strong>Set Dimensions:</strong> Adjust width and height using sliders or input fields. Range: 50px to 4000px.</li>
                <li><strong>Select Style:</strong> Choose solid color, gradient, diagonal pattern, or checkerboard background.</li>
                <li><strong>Customize Colors:</strong> Pick background and text colors using color pickers. For gradients and patterns, set both primary and secondary colors.</li>
                <li><strong>Add Text (Optional):</strong> Enter custom text or leave empty to show dimensions. Customize font size, family, and weight.</li>
                <li><strong>Preview & Export:</strong> See the placeholder in real-time. Download as PNG or JPG, or copy the URL, HTML, or CSS code.</li>
              </ol>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💻 Web Development</h3>
                <p className="text-gray-700 text-sm">
                  Use placeholders during development to test layouts, responsive designs, and image loading 
                  before final assets are ready. Essential for prototyping and client presentations.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎨 Design Mockups</h3>
                <p className="text-gray-700 text-sm">
                  Create placeholder images that match your design system. Use brand colors and consistent 
                  dimensions to visualize how final designs will look.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📱 Responsive Testing</h3>
                <p className="text-gray-700 text-sm">
                  Generate placeholders at different aspect ratios to test how layouts adapt across devices. 
                  Perfect for mobile, tablet, and desktop breakpoints.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Quick Prototyping</h3>
                <p className="text-gray-700 text-sm">
                  Speed up development by generating placeholders instantly. No need to search for stock images 
                  or create temporary graphics in design software.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What image formats are supported?</h3>
                <p className="text-gray-700 text-sm">
                  You can download placeholders as PNG (with transparency support) or JPG (smaller file size). 
                  PNG is recommended for web use as it preserves quality and supports transparency.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I use these placeholders commercially?</h3>
                <p className="text-gray-700 text-sm">
                  Yes! All generated placeholders are free to use for any purpose, including commercial projects. 
                  There are no restrictions or licensing requirements.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What&apos;s the maximum size I can generate?</h3>
                <p className="text-gray-700 text-sm">
                  You can generate placeholders from 50px to 4000px in both width and height. This covers 
                  everything from icons to large hero images and banners.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my data stored or transmitted?</h3>
                <p className="text-gray-700 text-sm">
                  No, all placeholder generation happens entirely in your browser. We never see, store, or 
                  transmit any of your settings or generated images. Your privacy is completely protected.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I use the placeholder URL directly in my code?</h3>
                <p className="text-gray-700 text-sm">
                  The generated URL is a data URL (base64-encoded image). You can use it directly in HTML 
                  img tags or CSS, but it&apos;s quite long. For production, download the image and host it 
                  separately, or use our &quot;Copy HTML&quot; or &quot;Copy CSS&quot; buttons for ready-to-use code snippets.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}

