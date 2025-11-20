'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type PatternType = 'geometric' | 'dots' | 'lines' | 'triangles' | 'grid' | 'waves' | 'mosaic' | 'abstract'
type ColorScheme = 'vibrant' | 'pastel' | 'monochrome' | 'warm' | 'cool' | 'random'
type ShapeType = 'circle' | 'square' | 'rounded'

export default function AvatarGeneratorPage() {
  const [size, setSize] = useState(200)
  const [shape, setShape] = useState<ShapeType>('circle')
  const [pattern, setPattern] = useState<PatternType>('geometric')
  const [colorScheme, setColorScheme] = useState<ColorScheme>('vibrant')
  const [complexity, setComplexity] = useState(5)
  const [seed, setSeed] = useState<string>('')
  const [useSeed, setUseSeed] = useState(false)
  const [autoGenerate, setAutoGenerate] = useState(true)
  const [totalGenerated, setTotalGenerated] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Seeded random number generator
  const seededRandom = useCallback((seedStr: string): (() => number) => {
    let seed = 0
    for (let i = 0; i < seedStr.length; i++) {
      seed = ((seed << 5) - seed) + seedStr.charCodeAt(i)
      seed = seed & seed
    }
    let value = Math.abs(seed)
    return () => {
      value = (value * 9301 + 49297) % 233280
      return value / 233280
    }
  }, [])

  const getColors = useCallback((scheme: ColorScheme, random: () => number): string[] => {
    switch (scheme) {
      case 'vibrant':
        return [
          `hsl(${Math.floor(random() * 360)}, 80%, 60%)`,
          `hsl(${Math.floor(random() * 360)}, 80%, 50%)`,
          `hsl(${Math.floor(random() * 360)}, 80%, 40%)`,
        ]
      case 'pastel':
        return [
          `hsl(${Math.floor(random() * 360)}, 50%, 80%)`,
          `hsl(${Math.floor(random() * 360)}, 50%, 75%)`,
          `hsl(${Math.floor(random() * 360)}, 50%, 70%)`,
        ]
      case 'monochrome': {
        const hue = Math.floor(random() * 360)
        return [
          `hsl(${hue}, 30%, ${60 + random() * 20}%)`,
          `hsl(${hue}, 30%, ${40 + random() * 20}%)`,
          `hsl(${hue}, 30%, ${20 + random() * 20}%)`,
        ]
      }
      case 'warm':
        return [
          `hsl(${20 + Math.floor(random() * 60)}, 70%, 60%)`,
          `hsl(${20 + Math.floor(random() * 60)}, 70%, 50%)`,
          `hsl(${20 + Math.floor(random() * 60)}, 70%, 40%)`,
        ]
      case 'cool':
        return [
          `hsl(${180 + Math.floor(random() * 60)}, 70%, 60%)`,
          `hsl(${180 + Math.floor(random() * 60)}, 70%, 50%)`,
          `hsl(${180 + Math.floor(random() * 60)}, 70%, 40%)`,
        ]
      case 'random':
      default:
        return [
          `hsl(${Math.floor(random() * 360)}, ${50 + random() * 50}%, ${40 + random() * 40}%)`,
          `hsl(${Math.floor(random() * 360)}, ${50 + random() * 50}%, ${40 + random() * 40}%)`,
          `hsl(${Math.floor(random() * 360)}, ${50 + random() * 50}%, ${40 + random() * 40}%)`,
        ]
    }
  }, [])

  const generateAvatar = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Setup clipping for shape
    if (shape === 'circle') {
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      ctx.clip()
    } else if (shape === 'rounded') {
      const radius = size * 0.15
      ctx.beginPath()
      ctx.moveTo(radius, 0)
      ctx.lineTo(size - radius, 0)
      ctx.quadraticCurveTo(size, 0, size, radius)
      ctx.lineTo(size, size - radius)
      ctx.quadraticCurveTo(size, size, size - radius, size)
      ctx.lineTo(radius, size)
      ctx.quadraticCurveTo(0, size, 0, size - radius)
      ctx.lineTo(0, radius)
      ctx.quadraticCurveTo(0, 0, radius, 0)
      ctx.closePath()
      ctx.clip()
    }

    // Initialize random function
    const random = useSeed && seed ? seededRandom(seed) : () => Math.random()
    const colors = getColors(colorScheme, random)

    // Fill background
    ctx.fillStyle = colors[0]
    ctx.fillRect(0, 0, size, size)

    // Generate pattern
    if (pattern === 'geometric') {
      for (let i = 0; i < complexity; i++) {
        ctx.fillStyle = colors[Math.floor(random() * colors.length)]
        const x = random() * size
        const y = random() * size
        const w = random() * (size / 2) + size / 4
        const h = random() * (size / 2) + size / 4

        if (random() > 0.5) {
          ctx.fillRect(x, y, w, h)
        } else {
          ctx.beginPath()
          ctx.arc(x, y, w / 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    } else if (pattern === 'dots') {
      ctx.fillStyle = colors[1]
      const dotCount = complexity * 10
      for (let i = 0; i < dotCount; i++) {
        const x = random() * size
        const y = random() * size
        const radius = random() * 10 + 2
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (pattern === 'lines') {
      ctx.strokeStyle = colors[1]
      ctx.lineWidth = 3 + random() * 4
      for (let i = 0; i < complexity * 2; i++) {
        ctx.beginPath()
        ctx.moveTo(random() * size, random() * size)
        ctx.lineTo(random() * size, random() * size)
        ctx.stroke()
      }
    } else if (pattern === 'triangles') {
      for (let i = 0; i < complexity * 2; i++) {
        ctx.fillStyle = colors[Math.floor(random() * colors.length)]
        ctx.beginPath()
        const x1 = random() * size
        const y1 = random() * size
        const x2 = random() * size
        const y2 = random() * size
        const x3 = random() * size
        const y3 = random() * size
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x3, y3)
        ctx.closePath()
        ctx.fill()
      }
    } else if (pattern === 'grid') {
      const gridSize = 4 + Math.floor(complexity / 2)
      const cellSize = size / gridSize
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          if (random() > 0.5) {
            ctx.fillStyle = colors[Math.floor(random() * colors.length)]
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
          }
        }
      }
    } else if (pattern === 'waves') {
      ctx.strokeStyle = colors[1]
      ctx.lineWidth = 3
      for (let i = 0; i < complexity; i++) {
        ctx.beginPath()
        const amplitude = size * 0.1 + random() * size * 0.2
        const frequency = 2 + random() * 4
        const y = size / 2 + Math.sin(0) * amplitude
        ctx.moveTo(0, y)
        for (let x = 0; x <= size; x += 5) {
          const y = size / 2 + Math.sin((x / size) * frequency * Math.PI * 2) * amplitude
          ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
    } else if (pattern === 'mosaic') {
      const tileSize = size / (3 + Math.floor(complexity / 2))
      for (let x = 0; x < size; x += tileSize) {
        for (let y = 0; y < size; y += tileSize) {
          ctx.fillStyle = colors[Math.floor(random() * colors.length)]
          ctx.fillRect(x, y, tileSize, tileSize)
          if (random() > 0.7) {
            ctx.fillStyle = colors[Math.floor(random() * colors.length)]
            ctx.fillRect(x + tileSize * 0.2, y + tileSize * 0.2, tileSize * 0.6, tileSize * 0.6)
          }
        }
      }
    } else if (pattern === 'abstract') {
      for (let i = 0; i < complexity * 3; i++) {
        ctx.fillStyle = colors[Math.floor(random() * colors.length)]
        ctx.globalAlpha = 0.3 + random() * 0.7
        const shapeType = Math.floor(random() * 4)
        if (shapeType === 0) {
          // Circle
          ctx.beginPath()
          ctx.arc(random() * size, random() * size, random() * size * 0.3, 0, Math.PI * 2)
          ctx.fill()
        } else if (shapeType === 1) {
          // Rectangle
          ctx.fillRect(random() * size, random() * size, random() * size * 0.5, random() * size * 0.5)
        } else if (shapeType === 2) {
          // Triangle
          ctx.beginPath()
          ctx.moveTo(random() * size, random() * size)
          ctx.lineTo(random() * size, random() * size)
          ctx.lineTo(random() * size, random() * size)
          ctx.closePath()
          ctx.fill()
        } else {
          // Arc
          ctx.beginPath()
          ctx.arc(random() * size, random() * size, random() * size * 0.3, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1.0
    }

    setTotalGenerated(prev => prev + 1)
  }, [size, shape, pattern, colorScheme, complexity, seed, useSeed, seededRandom, getColors])

  useEffect(() => {
    if (autoGenerate) {
      const timeoutId = setTimeout(() => {
        generateAvatar()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [autoGenerate, generateAvatar])

  const downloadAvatar = (format: 'png' | 'jpg' = 'png') => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `avatar-${Date.now()}.${format}`
    if (format === 'png') {
      link.href = canvasRef.current.toDataURL('image/png')
    } else {
      link.href = canvasRef.current.toDataURL('image/jpeg', 0.9)
    }
    link.click()
  }

  const copyUrl = async () => {
    if (!canvasRef.current) return
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png')
      await navigator.clipboard.writeText(dataUrl)
    } catch (e) {
      console.error('Failed to copy')
    }
  }

  const generateNewSeed = () => {
    setSeed(Math.random().toString(36).substring(2, 15))
  }

  // SEO data
  const toolPath = '/avatar-generator'
  const toolName = 'Avatar Generator'
  const category = 'generator'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is an avatar generator?",
      answer: "An avatar generator creates unique geometric avatars that can be used as profile pictures, user icons, or design elements. Each avatar is generated with customizable patterns, colors, and shapes."
    },
    {
      question: "How do I generate an avatar?",
      answer: "Choose a pattern type (geometric, dots, lines, triangles, grid, waves, mosaic, abstract), select a color scheme (vibrant, pastel, monochrome, warm, cool, random), choose a shape (circle, square, rounded), and adjust complexity. The avatar is generated automatically."
    },
    {
      question: "Can I use a seed to generate the same avatar?",
      answer: "Yes! Enable 'Use Seed' and enter a seed value. The same seed will always generate the same avatar, making it perfect for creating consistent avatars for users based on their username or ID."
    },
    {
      question: "What patterns are available?",
      answer: "Eight pattern types: Geometric (shapes), Dots (circular dots), Lines (linear patterns), Triangles (triangular shapes), Grid (grid-based), Waves (wave patterns), Mosaic (tile-like), and Abstract (random abstract shapes)."
    },
    {
      question: "What color schemes can I choose?",
      answer: "Six color schemes: Vibrant (bright colors), Pastel (soft colors), Monochrome (grayscale), Warm (reds, oranges, yellows), Cool (blues, greens, purples), and Random (random colors)."
    },
    {
      question: "Is the avatar generator free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All avatar generation happens in your browser - we never see or store your avatars."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Choose Pattern Type",
      text: "Select a pattern type from eight options: Geometric, Dots, Lines, Triangles, Grid, Waves, Mosaic, or Abstract. Each pattern creates a unique visual style."
    },
    {
      name: "Select Color Scheme",
      text: "Choose a color scheme: Vibrant, Pastel, Monochrome, Warm, Cool, or Random. The color scheme determines the overall color palette of the avatar."
    },
    {
      name: "Set Shape and Size",
      text: "Choose avatar shape (Circle, Square, or Rounded) and set the size in pixels. Common sizes are 64x64, 128x128, or 200x200 pixels."
    },
    {
      name: "Adjust Complexity",
      text: "Use the complexity slider to control how detailed the avatar is. Higher complexity creates more intricate patterns, lower complexity creates simpler designs."
    },
    {
      name: "Download Avatar",
      text: "Click 'Download' to save the avatar as a PNG image. You can also use a seed value to generate the same avatar again later."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Generate Unique Avatars",
      "Learn how to generate unique geometric avatars using our free online avatar generator tool with customizable patterns, colors, and shapes.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Avatar Generator",
      "Free online avatar generator. Create unique geometric avatars with customizable patterns, color schemes, and shapes. Perfect for profile pictures, user icons, and design projects.",
      "https://prylad.pro/avatar-generator",
      "UtilityApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="👤 Avatar Generator"
        description="Generate unique geometric avatars online for free. Choose from multiple patterns, color schemes, and shapes. Perfect for profile pictures, user icons, and design projects."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Settings */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Avatar Settings</h2>
              {totalGenerated > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Generated: <span className="font-semibold text-gray-900 dark:text-gray-100">{totalGenerated}</span>
                </div>
              )}
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Size: {size}px
              </label>
              <input
                type="range"
                min="100"
                max="512"
                step="4"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
              <div className="flex gap-2 mt-2">
                {[100, 200, 256, 400, 512].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium ${
                      size === s
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {s}px
                  </button>
                ))}
              </div>
            </div>

            {/* Shape */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Shape:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setShape('circle')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    shape === 'circle'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Circle
                </button>
                <button
                  onClick={() => setShape('square')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    shape === 'square'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Square
                </button>
                <button
                  onClick={() => setShape('rounded')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    shape === 'rounded'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Rounded
                </button>
              </div>
            </div>

            {/* Pattern */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Pattern:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['geometric', 'dots', 'lines', 'triangles', 'grid', 'waves', 'mosaic', 'abstract'] as PatternType[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPattern(p)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
                      pattern === p
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Scheme */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Color Scheme:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(['vibrant', 'pastel', 'monochrome', 'warm', 'cool', 'random'] as ColorScheme[]).map((cs) => (
                  <button
                    key={cs}
                    onClick={() => setColorScheme(cs)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
                      colorScheme === cs
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cs}
                  </button>
                ))}
              </div>
            </div>

            {/* Complexity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Complexity: {complexity}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={complexity}
                onChange={(e) => setComplexity(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Simple</span>
                <span>Complex</span>
              </div>
            </div>

            {/* Seed */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={useSeed}
                  onChange={(e) => setUseSeed(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Use seed for reproducibility</span>
              </label>
              {useSeed && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="Enter seed..."
                    className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={generateNewSeed}
                    className="px-4 py-2 bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 text-sm font-medium"
                  >
                    Random
                  </button>
                </div>
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
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-generate as you edit</span>
            </label>

            {!autoGenerate && (
              <button
                onClick={generateAvatar}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
              >
                Generate New Avatar
              </button>
            )}
          </div>

          {/* Preview */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <h2 className="text-xl font-bold">Preview</h2>

            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-800 flex flex-col items-center">
              <canvas
                ref={canvasRef}
                className={`${
                  shape === 'circle' ? 'rounded-full' : shape === 'rounded' ? 'rounded-2xl' : 'rounded-lg'
                } border-2 border-gray-300 dark:border-gray-600 shadow-lg`}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={() => downloadAvatar('png')}
                className="w-full bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors"
              >
                Download PNG
              </button>
              <button
                onClick={() => downloadAvatar('jpg')}
                className="w-full bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-orange-700 transition-colors"
              >
                Download JPG
              </button>
              <button
                onClick={copyUrl}
                className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors"
              >
                Copy Data URL
              </button>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is an Avatar Generator?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                An avatar generator creates unique, geometric profile pictures using algorithms and random patterns. 
                These avatars are perfect for user profiles, social media accounts, gaming avatars, and design projects 
                where you need distinctive visual identities.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our free avatar generator creates beautiful, algorithmically-generated avatars instantly in your browser. 
                Choose from multiple patterns (geometric, dots, lines, triangles, grid, waves, mosaic, abstract), color 
                schemes (vibrant, pastel, monochrome, warm, cool), and shapes (circle, square, rounded). Perfect for 
                developers, designers, and anyone who needs unique profile pictures.
              </p>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use Our Avatar Generator</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li><strong>Choose Size:</strong> Select from 100px to 512px, or use quick presets (100px, 200px, 256px, 400px, 512px).</li>
                <li><strong>Select Shape:</strong> Choose circle (perfect for profile pictures), square, or rounded corners.</li>
                <li><strong>Pick Pattern:</strong> Select from 8 different patterns: geometric shapes, dots, lines, triangles, grid, waves, mosaic, or abstract art.</li>
                <li><strong>Choose Color Scheme:</strong> Vibrant colors, soft pastels, monochrome, warm tones, cool tones, or completely random.</li>
                <li><strong>Adjust Complexity:</strong> Control how many elements appear in your avatar (1-10 scale).</li>
                <li><strong>Use Seed (Optional):</strong> Enter a seed value to generate the same avatar again. Perfect for consistent user avatars.</li>
                <li><strong>Download:</strong> Export as PNG or JPG, or copy the data URL for direct use in your projects.</li>
              </ol>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">👤 User Profiles</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Generate unique avatars for user accounts in web applications, forums, and social platforms. 
                  Use seeds to ensure each user gets a consistent avatar.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎮 Gaming & Apps</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Create distinctive character avatars for games, apps, and virtual worlds. The geometric patterns 
                  work great for modern, minimalist designs.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎨 Design Projects</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use generated avatars as placeholders in design mockups, wireframes, and prototypes. Export in 
                  high resolution for professional use.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🔐 Privacy-First</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Generate avatars without uploading personal photos. Perfect for privacy-conscious users who want 
                  unique profile pictures without revealing their identity.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What image formats are supported?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  You can download avatars as PNG (with transparency support) or JPG (smaller file size). PNG is 
                  recommended for web use as it preserves quality and supports transparency.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I generate the same avatar twice?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes! Enable &quot;Use seed for reproducibility&quot; and enter the same seed value. The same seed with the same 
                  settings will always generate the same avatar. Perfect for creating consistent user avatars based on 
                  usernames or user IDs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the maximum size I can generate?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  You can generate avatars from 100px to 512px. This covers everything from small icons to high-resolution 
                  profile pictures. For best results, use 200px or 256px for profile pictures.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Are the avatars unique?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Each generated avatar is algorithmically unique based on random values. With millions of possible 
                  combinations of patterns, colors, and complexity levels, the chance of generating identical avatars 
                  is extremely low.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Is my data stored or transmitted?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, all avatar generation happens entirely in your browser. We never see, store, or transmit any of 
                  your settings or generated images. Your privacy is completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Generator Tools" />
      )}
    </Layout>
    </>
  )
}
