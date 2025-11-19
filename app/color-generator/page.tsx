'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'

type ColorType = 'random' | 'bright' | 'pastel' | 'dark' | 'light' | 'warm' | 'cool'
type PaletteType = 'random' | 'complementary' | 'triadic' | 'analogous' | 'monochromatic'

export default function ColorGeneratorPage() {
  const [colors, setColors] = useState<string[]>([])
  const [paletteSize, setPaletteSize] = useState(5)
  const [colorType, setColorType] = useState<ColorType>('random')
  const [paletteType, setPaletteType] = useState<PaletteType>('random')
  const [baseColor, setBaseColor] = useState('#3b82f6')
  const [useHarmony, setUseHarmony] = useState(false)
  const [totalGenerated, setTotalGenerated] = useState(0)

  const generateColor = useCallback((type: ColorType = 'random'): string => {
    let r: number, g: number, b: number

    switch (type) {
      case 'bright':
        // Bright, saturated colors
        r = Math.floor(Math.random() * 128) + 128
        g = Math.floor(Math.random() * 128) + 128
        b = Math.floor(Math.random() * 128) + 128
        break
      case 'pastel':
        // Pastel colors (high lightness, medium saturation)
        r = Math.floor(Math.random() * 100) + 155
        g = Math.floor(Math.random() * 100) + 155
        b = Math.floor(Math.random() * 100) + 155
        break
      case 'dark':
        // Dark colors
        r = Math.floor(Math.random() * 128)
        g = Math.floor(Math.random() * 128)
        b = Math.floor(Math.random() * 128)
        break
      case 'light':
        // Light colors
        r = Math.floor(Math.random() * 100) + 155
        g = Math.floor(Math.random() * 100) + 155
        b = Math.floor(Math.random() * 100) + 155
        break
      case 'warm':
        // Warm colors (reds, oranges, yellows)
        r = Math.floor(Math.random() * 256)
        g = Math.floor(Math.random() * 200)
        b = Math.floor(Math.random() * 100)
        break
      case 'cool':
        // Cool colors (blues, greens, purples)
        r = Math.floor(Math.random() * 150)
        g = Math.floor(Math.random() * 200) + 56
        b = Math.floor(Math.random() * 256)
        break
      case 'random':
      default:
        // Completely random
        r = Math.floor(Math.random() * 256)
        g = Math.floor(Math.random() * 256)
        b = Math.floor(Math.random() * 256)
    }

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }, [])

  const generateSingle = useCallback(() => {
    const newColor = generateColor(colorType)
    setColors([newColor])
    setTotalGenerated(prev => prev + 1)
  }, [colorType, generateColor])

  // Convert HEX to HSL
  const hexToHslValues = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  // Convert HSL to HEX
  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100
    l /= 100
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = l - c / 2
    let r = 0, g = 0, b = 0

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x
    }

    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  // Generate harmonious palette
  const generateHarmoniousPalette = useCallback((base: string, type: PaletteType, size: number): string[] => {
    const baseHsl = hexToHslValues(base)
    const palette: string[] = [base]

    switch (type) {
      case 'complementary':
        // Opposite colors on color wheel
        const compH = (baseHsl.h + 180) % 360
        palette.push(hslToHex(compH, baseHsl.s, baseHsl.l))
        // Add variations
        for (let i = 2; i < size; i++) {
          const variation = hslToHex(
            (baseHsl.h + (i * 30)) % 360,
            Math.max(20, baseHsl.s - 20),
            Math.min(90, baseHsl.l + (i % 2 === 0 ? 10 : -10))
          )
          palette.push(variation)
        }
        break

      case 'triadic':
        // Three evenly spaced colors
        for (let i = 1; i < size; i++) {
          const h = (baseHsl.h + (i * 120)) % 360
          const s = baseHsl.s + (i % 2 === 0 ? -10 : 10)
          const l = baseHsl.l + (i % 3 === 0 ? -5 : 5)
          palette.push(hslToHex(h, Math.max(20, Math.min(100, s)), Math.max(10, Math.min(90, l))))
        }
        break

      case 'analogous':
        // Adjacent colors on color wheel
        for (let i = 1; i < size; i++) {
          const h = (baseHsl.h + (i * 30) - 30) % 360
          const s = baseHsl.s + (i % 2 === 0 ? -15 : 15)
          const l = baseHsl.l + (i % 3 === 0 ? -10 : 10)
          palette.push(hslToHex(h, Math.max(20, Math.min(100, s)), Math.max(10, Math.min(90, l))))
        }
        break

      case 'monochromatic':
        // Variations of same hue
        for (let i = 1; i < size; i++) {
          const s = baseHsl.s + (i % 2 === 0 ? -20 : 20)
          const l = baseHsl.l + (i * (60 / size) - 30)
          palette.push(hslToHex(baseHsl.h, Math.max(20, Math.min(100, s)), Math.max(10, Math.min(90, l))))
        }
        break

      case 'random':
      default:
        return Array.from({ length: size }, () => generateColor(colorType))
    }

    return palette.slice(0, size)
  }, [colorType, generateColor])

  const generatePalette = useCallback(() => {
    let newColors: string[]
    
    if (useHarmony && paletteType !== 'random') {
      newColors = generateHarmoniousPalette(baseColor, paletteType, paletteSize)
    } else {
      newColors = Array.from({ length: paletteSize }, () => generateColor(colorType))
    }
    
    setColors(newColors)
    setTotalGenerated(prev => prev + newColors.length)
  }, [paletteSize, colorType, paletteType, baseColor, useHarmony, generateColor, generateHarmoniousPalette])

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgb(${r}, ${g}, ${b})`
  }

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    h = Math.round(h * 360)
    s = Math.round(s * 100)
    l = Math.round(l * 100)

    return `hsl(${h}, ${s}%, ${l}%)`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const copyAll = () => {
    const allColors = colors.map(c => `${c} - ${hexToRgb(c)} - ${hexToHsl(c)}`).join('\n')
    navigator.clipboard.writeText(allColors)
  }

  const exportToFile = () => {
    if (colors.length === 0) return
    
    const content = colors.map(c => `${c}\t${hexToRgb(c)}\t${hexToHsl(c)}`).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `colors-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToCSS = () => {
    if (colors.length === 0) return
    
    const cssVars = colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')
    const content = `:root {\n${cssVars}\n}`
    const blob = new Blob([content], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `colors-${Date.now()}.css`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      paletteSize,
      colorType,
      paletteType,
      baseColor,
      useHarmony
    }
    localStorage.setItem('colorGeneratorSettings', JSON.stringify(settings))
  }, [paletteSize, colorType, paletteType, baseColor, useHarmony])

  // Load settings and auto-generate on mount
  useEffect(() => {
    const saved = localStorage.getItem('colorGeneratorSettings')
    let loadedSize = 5
    let loadedType: ColorType = 'random'
    let loadedPaletteType: PaletteType = 'complementary'
    let loadedBaseColor = '#3b82f6'
    let loadedUseHarmony = false
    
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        loadedSize = settings.paletteSize || 5
        loadedType = settings.colorType || 'random'
        loadedPaletteType = settings.paletteType || 'complementary'
        loadedBaseColor = settings.baseColor || '#3b82f6'
        loadedUseHarmony = settings.useHarmony || false
        setPaletteSize(loadedSize)
        setColorType(loadedType)
        setPaletteType(loadedPaletteType)
        setBaseColor(loadedBaseColor)
        setUseHarmony(loadedUseHarmony)
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    // Auto-generate palette on mount
    setTimeout(() => {
      let newColors: string[]
      if (loadedUseHarmony && loadedPaletteType !== 'random') {
        newColors = generateHarmoniousPalette(loadedBaseColor, loadedPaletteType, loadedSize)
      } else {
        newColors = Array.from({ length: loadedSize }, () => generateColor(loadedType))
      }
      setColors(newColors)
      setTotalGenerated(prev => prev + newColors.length)
    }, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Layout
      title="🎨 Random Color Generator"
      description="Generate random colors and color palettes in HEX, RGB, and HSL formats. Create bright, pastel, dark, warm, cool colors for design projects. Free online color generator."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6">
          <div className="space-y-6">
            {/* Harmony Mode Toggle */}
            <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                id="use-harmony"
                checked={useHarmony}
                onChange={(e) => setUseHarmony(e.target.checked)}
                className="w-4 h-4 accent-primary-600"
              />
              <label htmlFor="use-harmony" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                Generate harmonious palette (based on color theory)
              </label>
            </div>

            {/* Harmony Palette Type */}
            {useHarmony && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Base Color:</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={baseColor}
                      onChange={(e) => setBaseColor(e.target.value)}
                      className="w-20 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                    />
                    <span className="font-mono text-sm text-gray-600">{baseColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Palette Harmony:</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {(['complementary', 'triadic', 'analogous', 'monochromatic'] as PaletteType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setPaletteType(type)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          paletteType === type
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {paletteType === 'complementary' && 'Opposite colors on color wheel - high contrast'}
                    {paletteType === 'triadic' && 'Three evenly spaced colors - balanced and vibrant'}
                    {paletteType === 'analogous' && 'Adjacent colors - harmonious and natural'}
                    {paletteType === 'monochromatic' && 'Variations of same hue - subtle and elegant'}
                  </p>
                </div>
              </>
            )}

            {/* Color Type Selection (when not using harmony) */}
            {!useHarmony && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Color Type:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {(['random', 'bright', 'pastel', 'dark', 'light', 'warm', 'cool'] as ColorType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setColorType(type)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        colorType === type
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Generation Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                onClick={generateSingle}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
              >
                Generate One Color
              </button>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Palette size:</label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={paletteSize}
                  onChange={(e) => setPaletteSize(Math.min(20, Math.max(2, Number(e.target.value))))}
                  className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={generatePalette}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
              >
                Generate Palette ({paletteSize})
              </button>
            </div>

            {/* Statistics */}
            {totalGenerated > 0 && (
              <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-200">
                Total generated: <span className="font-semibold text-primary-600">{totalGenerated}</span> colors
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {colors.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-lg font-bold text-gray-900">
                {colors.length === 1 ? 'Generated Color' : `Color Palette (${colors.length} colors)`}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={exportToFile}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export TXT
                </button>
                <button
                  onClick={exportToCSS}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Export CSS
                </button>
                <button
                  onClick={copyAll}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  Copy All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div
                    className="h-40 w-full relative group"
                    style={{ backgroundColor: color }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg flex-1">{color}</span>
                      <button
                        onClick={() => copyToClipboard(color)}
                        className="text-gray-500 hover:text-primary-600 transition-colors text-lg"
                        title="Copy HEX"
                      >
                        📋
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-600 flex-1">{hexToRgb(color)}</span>
                        <button
                          onClick={() => copyToClipboard(hexToRgb(color))}
                          className="text-gray-500 hover:text-primary-600 transition-colors"
                          title="Copy RGB"
                        >
                          📋
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-600 flex-1">{hexToHsl(color)}</span>
                        <button
                          onClick={() => copyToClipboard(hexToHsl(color))}
                          className="text-gray-500 hover:text-primary-600 transition-colors"
                          title="Copy HSL"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* UI Preview */}
            {colors.length >= 3 && (
              <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">UI Preview</h3>
                <div className="space-y-4">
                  {/* Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {colors.slice(0, 4).map((color, i) => (
                      <button
                        key={i}
                        className="px-6 py-3 rounded-lg font-semibold text-white transition-transform hover:scale-105"
                        style={{ backgroundColor: color }}
                      >
                        Button {i + 1}
                      </button>
                    ))}
                  </div>
                  
                  {/* Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {colors.slice(0, 3).map((color, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl text-white"
                        style={{ backgroundColor: color }}
                      >
                        <h4 className="font-bold text-lg mb-2">Card {i + 1}</h4>
                        <p className="text-sm opacity-90">Sample content using this color</p>
                      </div>
                    ))}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {colors.slice(0, 5).map((color, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: color }}
                      >
                        Badge {i + 1}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Use a Color Generator?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Colors are fundamental to design, branding, and visual communication. Whether you&apos;re working on a 
                website, mobile app, graphic design project, or just need inspiration, having access to a diverse 
                palette of colors is essential. Coming up with the perfect color scheme can be challenging, especially 
                when you need multiple harmonious colors or want to explore different color moods and styles.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free color generator provides instant access to random colors in multiple formats (HEX, RGB, HSL) 
                and various color types. Generate single colors for specific needs or create entire palettes for 
                comprehensive design projects. All color generation happens locally in your browser, ensuring complete 
                privacy and instant results.
              </p>
            </div>
          </section>

          {/* Color Types */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Color Types Explained</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Random Colors</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Completely random colors across the full spectrum. Perfect for exploring unexpected color combinations 
                  and finding unique hues you might not have considered.
                </p>
                <p className="text-xs text-gray-600"><strong>Best for:</strong> Exploration, inspiration, diverse palettes</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bright Colors</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Vibrant, saturated colors with high intensity. These colors are eye-catching and energetic, perfect 
                  for attention-grabbing designs and youthful brands.
                </p>
                <p className="text-xs text-gray-600"><strong>Best for:</strong> Energetic designs, youth brands, highlights</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pastel Colors</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Soft, muted colors with high lightness and medium saturation. Pastels create a gentle, calming 
                  aesthetic perfect for delicate designs and soothing interfaces.
                </p>
                <p className="text-xs text-gray-600"><strong>Best for:</strong> Soft designs, calming interfaces, spring themes</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dark Colors</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Deep, rich colors with low brightness. Dark colors create a sophisticated, dramatic look and work 
                  excellently for backgrounds and elegant designs.
                </p>
                <p className="text-xs text-gray-600"><strong>Best for:</strong> Dark themes, elegant designs, backgrounds</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Light Colors</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Bright, airy colors with high lightness. Light colors create a clean, spacious feeling and are 
                  perfect for minimalist designs and fresh aesthetics.
                </p>
                <p className="text-xs text-gray-600"><strong>Best for:</strong> Minimalist designs, clean interfaces, fresh themes</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Warm Colors</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Colors in the red, orange, and yellow spectrum. Warm colors evoke energy, passion, and warmth, 
                  making them perfect for dynamic, inviting designs.
                </p>
                <p className="text-xs text-gray-600"><strong>Best for:</strong> Energetic designs, food brands, inviting interfaces</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cool Colors</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Colors in the blue, green, and purple spectrum. Cool colors create a calm, professional atmosphere 
                  and are ideal for tech companies and serene designs.
                </p>
                <p className="text-xs text-gray-600"><strong>Best for:</strong> Professional designs, tech brands, calming themes</p>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎨 Web & App Design</h3>
                <p className="text-gray-700 text-sm">
                  Generate color palettes for websites, mobile apps, and user interfaces. Create cohesive color 
                  schemes that enhance usability and brand identity.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Data Visualization</h3>
                <p className="text-gray-700 text-sm">
                  Create distinct colors for charts, graphs, and data visualizations. Generate palettes that ensure 
                  good contrast and accessibility.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎭 Brand Identity</h3>
                <p className="text-gray-700 text-sm">
                  Explore color options for logos, brand guidelines, and marketing materials. Find colors that 
                  represent your brand&apos;s personality and values.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎨 Creative Projects</h3>
                <p className="text-gray-700 text-sm">
                  Get inspiration for art projects, illustrations, and creative designs. Discover unexpected color 
                  combinations that spark creativity.
                </p>
              </div>
            </div>
          </section>

          {/* Color Formats */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Color Formats</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">HEX (#RRGGBB)</h3>
                <p className="text-gray-700 text-sm mb-2">
                  Hexadecimal format is the standard for web development. Each color is represented by a 6-digit 
                  code prefixed with #, using values 0-9 and A-F.
                </p>
                <p className="text-xs text-gray-600"><strong>Example:</strong> #FF5733</p>
                <p className="text-xs text-gray-600"><strong>Used in:</strong> CSS, HTML, web design</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">RGB (Red, Green, Blue)</h3>
                <p className="text-gray-700 text-sm mb-2">
                  RGB format specifies colors using three values (0-255) representing red, green, and blue channels. 
                  This is the additive color model used by screens.
                </p>
                <p className="text-xs text-gray-600"><strong>Example:</strong> rgb(255, 87, 51)</p>
                <p className="text-xs text-gray-600"><strong>Used in:</strong> CSS, image editing, design software</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">HSL (Hue, Saturation, Lightness)</h3>
                <p className="text-gray-700 text-sm mb-2">
                  HSL format represents colors using hue (0-360°), saturation (0-100%), and lightness (0-100%). 
                  This format is intuitive for adjusting color properties.
                </p>
                <p className="text-xs text-gray-600"><strong>Example:</strong> hsl(11, 100%, 60%)</p>
                <p className="text-xs text-gray-600"><strong>Used in:</strong> CSS, color manipulation, design tools</p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Multiple Color Types</h3>
                  <p className="text-gray-700 text-sm">
                    Generate random, bright, pastel, dark, light, warm, or cool colors. Each type creates colors 
                    with specific characteristics to match your design needs.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌈</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Color Palettes</h3>
                  <p className="text-gray-700 text-sm">
                    Generate palettes with 2-20 colors at once. Perfect for creating comprehensive color schemes 
                    for entire design projects.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Multiple Formats</h3>
                  <p className="text-gray-700 text-sm">
                    Each color is displayed in HEX, RGB, and HSL formats. Copy any format with a single click for 
                    easy integration into your projects.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📥</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Export Options</h3>
                  <p className="text-gray-700 text-sm">
                    Copy individual colors or export entire palettes to a text file. All formats included for 
                    seamless workflow integration.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Instant Generation</h3>
                  <p className="text-gray-700 text-sm">
                    Colors are generated instantly in your browser. No waiting, no API calls, no server processing. 
                    Get results immediately.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Privacy First</h3>
                  <p className="text-gray-700 text-sm">
                    All color generation happens locally in your browser. We never see, store, or have access to 
                    any generated colors or your preferences.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Color Theory Reference */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding Color Theory</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">The Color Wheel</h3>
                <p className="text-gray-700 text-sm mb-3">
                  The color wheel is a fundamental tool in color theory, organizing colors in a circular format to show 
                  their relationships. It consists of primary colors (red, blue, yellow), secondary colors (created by mixing 
                  primaries), and tertiary colors (mixes of primary and secondary colors).
                </p>
                <p className="text-gray-700 text-sm">
                  Understanding the color wheel helps you create harmonious color palettes. Colors opposite each other are 
                  complementary, colors forming a triangle are triadic, and adjacent colors are analogous.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Color Harmony Types</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Complementary Colors</h4>
                    <p className="text-gray-700 text-sm">
                      Colors directly opposite on the color wheel (e.g., red and green, blue and orange). They create 
                      high contrast and visual tension, making each other appear more vibrant. Use complementary colors 
                      when you want elements to stand out dramatically.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Triadic Colors</h4>
                    <p className="text-gray-700 text-sm">
                      Three colors evenly spaced around the color wheel (forming a triangle). Triadic schemes are vibrant 
                      and balanced, offering rich contrast while maintaining harmony. They work well for designs that need 
                      energy and visual interest.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Analogous Colors</h4>
                    <p className="text-gray-700 text-sm">
                      Colors adjacent to each other on the color wheel (e.g., blue, blue-green, green). Analogous schemes 
                      create serene and comfortable designs, perfect for backgrounds or when you want a cohesive, unified look.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Monochromatic Colors</h4>
                    <p className="text-gray-700 text-sm">
                      Variations in lightness and saturation of a single hue. Monochromatic schemes are elegant and 
                      sophisticated, creating a sense of unity and simplicity. They&apos;re ideal for minimalist designs or 
                      when you want to create depth through shading.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Color Psychology</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Colors evoke emotional responses and can influence perception. Warm colors (reds, oranges, yellows) 
                  tend to feel energetic and inviting, while cool colors (blues, greens, purples) are calming and 
                  professional. Understanding color psychology helps you choose colors that align with your design goals.
                </p>
                <p className="text-gray-700 text-sm">
                  Bright colors grab attention and convey excitement, pastels feel soft and approachable, dark colors 
                  suggest sophistication and depth, and light colors create an airy, clean aesthetic. Consider your 
                  target audience and message when selecting color types.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Practical Color Selection Tips</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
                  <li><strong>Start with a base color:</strong> Choose one color you love, then use harmony rules to find complementary colors.</li>
                  <li><strong>Consider context:</strong> Colors look different on screens vs. print, in light vs. dark environments.</li>
                  <li><strong>Test accessibility:</strong> Ensure sufficient contrast between text and background colors for readability.</li>
                  <li><strong>Limit your palette:</strong> Too many colors can be overwhelming. 3-5 colors usually work best.</li>
                  <li><strong>Use neutrals:</strong> Balance vibrant colors with neutrals (grays, whites, blacks) for visual rest.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I use these colors for commercial projects?</h3>
                <p className="text-gray-700 text-sm">
                  Yes! All generated colors are free to use for any purpose, including commercial projects. Colors 
                  themselves cannot be copyrighted, so you&apos;re free to use them however you like.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What&apos;s the difference between HEX, RGB, and HSL?</h3>
                <p className="text-gray-700 text-sm">
                  HEX is a compact hexadecimal representation (#RRGGBB), RGB uses decimal values (0-255) for each 
                  channel, and HSL represents colors using hue, saturation, and lightness. All three represent the 
                  same color, just in different formats. Choose the format that works best for your project.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How many colors can I generate at once?</h3>
                <p className="text-gray-700 text-sm">
                  You can generate palettes with 2-20 colors in a single batch. If you need more, simply generate 
                  another palette. There&apos;s no limit on the total number of colors you can generate.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you store the generated colors?</h3>
                <p className="text-gray-700 text-sm">
                  No, absolutely not. All color generation happens entirely in your browser using JavaScript. We never 
                  see, store, transmit, or have any access to the colors you generate. Your privacy is completely protected.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I generate harmonious color palettes?</h3>
                <p className="text-gray-700 text-sm">
                  While our generator creates random colors, you can use the color type filters (warm, cool, pastel, etc.) 
                  to generate colors within similar ranges. For perfectly harmonious palettes, consider using color theory 
                  tools alongside our generator.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}

