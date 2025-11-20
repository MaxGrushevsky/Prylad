'use client'

import { useState, useCallback, useRef } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import FileDropZone from '@/components/FileDropZone'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

interface Color {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  percentage: number
}

export default function ColorPaletteFromImagePage() {
  const [image, setImage] = useState<string | null>(null)
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(false)
  const [paletteSize, setPaletteSize] = useState(5)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedType, setCopiedType] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const rgbToHsl = useCallback((r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6
          break
        case g:
          h = ((b - r) / d + 2) / 6
          break
        case b:
          h = ((r - g) / d + 4) / 6
          break
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }, [])

  const extractColors = useCallback((imageUrl: string) => {
    setLoading(true)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setLoading(false)
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Simple color extraction using k-means-like approach
        // Group pixels by color buckets
        const colorMap = new Map<string, number>()
        
        // Sample pixels (every 10th pixel for performance)
        for (let i = 0; i < data.length; i += 40) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]
          
          // Skip transparent pixels
          if (a < 128) continue
          
          // Quantize colors to reduce noise
          const qr = Math.round(r / 10) * 10
          const qg = Math.round(g / 10) * 10
          const qb = Math.round(b / 10) * 10
          
          const key = `${qr},${qg},${qb}`
          colorMap.set(key, (colorMap.get(key) || 0) + 1)
        }

        // Get most common colors
        const sortedColors = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, paletteSize)
          .map(([key, count]) => {
            const [r, g, b] = key.split(',').map(Number)
            const total = Array.from(colorMap.values()).reduce((sum, val) => sum + val, 0)
            const percentage = Math.round((count / total) * 100)
            
            return {
              hex: `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`,
              rgb: { r, g, b },
              hsl: rgbToHsl(r, g, b),
              percentage
            }
          })

        setColors(sortedColors)
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    }

    img.onerror = () => {
      setLoading(false)
    }

    img.src = imageUrl
  }, [paletteSize, rgbToHsl, ])

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImage(result)
      extractColors(result)
    }
    reader.onerror = () => {
    }
    reader.readAsDataURL(file)
  }, [extractColors, ])

  const copyToClipboard = async (text: string, index?: number, type?: string) => {
    try {
      await navigator.clipboard.writeText(text)
      if (index !== undefined && type) {
        setCopiedIndex(index)
        setCopiedType(type)
        setTimeout(() => {
          setCopiedIndex(null)
          setCopiedType(null)
        }, 2000)
      }
    } catch (err) {
    }
  }

  const exportPalette = (format: 'txt' | 'json' | 'css') => {
    if (colors.length === 0) return
    
    let content = ''
    let filename = ''
    let mimeType = ''
    
    if (format === 'txt') {
      content = colors.map(color => 
        `${color.hex} - RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}) - HSL(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`
      ).join('\n')
      filename = 'color-palette.txt'
      mimeType = 'text/plain'
    } else if (format === 'json') {
      content = JSON.stringify(colors, null, 2)
      filename = 'color-palette.json'
      mimeType = 'application/json'
    } else if (format === 'css') {
      content = `:root {\n${colors.map((color, i) => `  --color-${i + 1}: ${color.hex};`).join('\n')}\n}`
      filename = 'color-palette.css'
      mimeType = 'text/css'
    }
    
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // SEO data
  const toolPath = '/color-palette-from-image'
  const toolName = 'Color Palette from Image'
  const category = 'design'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is a color palette extractor?",
      answer: "A color palette extractor analyzes an image and identifies the dominant colors present in it. It extracts the most prominent colors and presents them in various formats (HEX, RGB, HSL) for use in design projects."
    },
    {
      question: "How do I extract colors from an image?",
      answer: "Upload your image by dragging and dropping it or clicking to select. The tool automatically analyzes the image and extracts the dominant colors. You can adjust the palette size (number of colors) from 3 to 10."
    },
    {
      question: "What color formats are provided?",
      answer: "Each extracted color is shown in three formats: HEX (hexadecimal, e.g., #FF5733), RGB (Red, Green, Blue values), and HSL (Hue, Saturation, Lightness values). This makes it easy to use the colors in any design tool."
    },
    {
      question: "Can I customize the number of colors extracted?",
      answer: "Yes! Adjust the palette size slider to extract anywhere from 3 to 10 dominant colors. More colors give you a richer palette, fewer colors focus on the most prominent colors."
    },
    {
      question: "How can I use the extracted color palette?",
      answer: "Copy any color value (HEX, RGB, or HSL) to use in your design projects. The palette helps you create cohesive designs by using colors that naturally appear together in your source image."
    },
    {
      question: "Is the color palette extractor free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All color extraction happens in your browser - we never see or store your images."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Upload Image",
      text: "Upload your image by dragging and dropping it or clicking to select. Supported formats: JPEG, PNG, WebP. The image loads instantly for color extraction."
    },
    {
      name: "Set Palette Size",
      text: "Adjust the palette size slider to choose how many dominant colors to extract (3 to 10 colors). More colors provide a richer palette, fewer colors focus on the most prominent ones."
    },
    {
      name: "View Extracted Colors",
      text: "See the dominant colors displayed with their HEX, RGB, and HSL values. Each color shows its percentage representation in the image."
    },
    {
      name: "Copy Color Values",
      text: "Click on any color value (HEX, RGB, or HSL) to copy it to your clipboard. Use these values in your design tools, CSS, or any color picker."
    },
    {
      name: "Use in Your Projects",
      text: "Apply the extracted color palette to your design projects for cohesive color schemes. The colors naturally work together since they come from the same image."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Extract Color Palette from Images",
      "Learn how to extract color palettes from images using our free online color palette extractor tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Color Palette from Image",
      "Free online color palette extractor. Extract dominant colors from images in HEX, RGB, and HSL formats. Perfect for designers creating cohesive color schemes.",
      "https://prylad.pro/color-palette-from-image",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🎨 Color Palette from Image"
        description="Extract color palette from images. Upload an image and get dominant colors in HEX, RGB, and HSL formats."
        breadcrumbs={breadcrumbs}
      >
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            {/* Settings */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Palette Size: {paletteSize} colors
              </label>
              <input
                type="range"
                min="3"
                max="10"
                value={paletteSize}
                onChange={(e) => {
                  const newSize = parseInt(e.target.value)
                  setPaletteSize(newSize)
                  if (image) {
                    extractColors(image)
                  }
                }}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Upload Image
              </label>
              <FileDropZone
                onFileSelect={handleFileSelect}
                accept="image/*"
                maxSize={10 * 1024 * 1024}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
                className="hidden"
              />
            </div>

            {/* Image Preview */}
            {image && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Image Preview
                </label>
                <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                  <img
                    src={image}
                    alt="Uploaded"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  {loading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white font-medium">Extracting colors...</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Color Palette */}
            {colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Extracted Colors ({colors.length})
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportPalette('txt')}
                      className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
                    >
                      Export TXT
                    </button>
                    <button
                      onClick={() => exportPalette('json')}
                      className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={() => exportPalette('css')}
                      className="px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Export CSS
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {colors.map((color, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div
                        className="h-32 w-full relative group cursor-pointer"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyToClipboard(color.hex, index, 'hex')}
                        title="Click to copy HEX"
                      >
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          {copiedIndex === index && copiedType === 'hex' && (
                            <span className="text-white font-semibold text-sm bg-black/50 px-3 py-1 rounded">Copied!</span>
                          )}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                            {color.hex}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                            {color.percentage}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <div 
                            className="font-mono cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            onClick={() => copyToClipboard(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, index, 'rgb')}
                            title="Click to copy RGB"
                          >
                            RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                          </div>
                          <div 
                            className="font-mono cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            onClick={() => copyToClipboard(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`, index, 'hsl')}
                            title="Click to copy HSL"
                          >
                            HSL({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)
                          </div>
                        </div>
                        <div className="flex gap-1 pt-1">
                          <button
                            onClick={() => copyToClipboard(color.hex, index, 'hex')}
                            className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                              copiedIndex === index && copiedType === 'hex'
                                ? 'bg-green-600 text-white'
                                : 'bg-primary-600 hover:bg-primary-700 text-white'
                            }`}
                          >
                            {copiedIndex === index && copiedType === 'hex' ? '✓' : 'HEX'}
                          </button>
                          <button
                            onClick={() => copyToClipboard(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, index, 'rgb')}
                            className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                              copiedIndex === index && copiedType === 'rgb'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {copiedIndex === index && copiedType === 'rgb' ? '✓' : 'RGB'}
                          </button>
                          <button
                            onClick={() => copyToClipboard(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`, index, 'hsl')}
                            className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                              copiedIndex === index && copiedType === 'hsl'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {copiedIndex === index && copiedType === 'hsl' ? '✓' : 'HSL'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CSS Output */}
            {colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    CSS Variables
                  </label>
                  <button
                    onClick={() => {
                      const css = colors.map((color, i) => 
                        `  --color-${i + 1}: ${color.hex};`
                      ).join('\n')
                      copyToClipboard(`:root {\n${css}\n}`)
                    }}
                    className="px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Copy CSS
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
                    <code>{`:root {\n${colors.map((color, i) => `  --color-${i + 1}: ${color.hex};`).join('\n')}\n}`}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is a Color Palette from Image?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                A color palette extractor analyzes an image and identifies the dominant colors present in it. This tool is 
                essential for designers, developers, and artists who want to create cohesive color schemes based on existing 
                images, photos, or artwork.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our free color palette generator extracts the most prominent colors from any uploaded image instantly in your 
                browser. Get colors in HEX, RGB, and HSL formats with percentage distribution. Perfect for creating brand colors, 
                design systems, or matching colors from inspiration images.
              </p>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Extract Colors from an Image</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li><strong>Adjust Palette Size:</strong> Use the slider to choose how many colors you want to extract (3-10 colors). More colors give you a detailed palette, fewer colors give you the most dominant ones.</li>
                <li><strong>Upload Your Image:</strong> Drag and drop an image file or click to browse. Supported formats include PNG, JPG, JPEG, GIF, and WebP (max 10MB).</li>
                <li><strong>View Extracted Colors:</strong> The tool automatically analyzes your image and displays the dominant colors with their HEX, RGB, and HSL values.</li>
                <li><strong>Copy Colors:</strong> Click on any color card or use the copy buttons to copy HEX, RGB, or HSL values to your clipboard.</li>
                <li><strong>Export Your Palette:</strong> Export your color palette as a text file, JSON, or CSS variables for use in your projects.</li>
              </ol>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Use Cases for Color Palette Extraction</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎨 Design & Branding</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Extract brand colors from logos</li>
                  <li>• Create color schemes from inspiration images</li>
                  <li>• Match colors from photos for design projects</li>
                  <li>• Build consistent color palettes for websites</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">💻 Development</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Generate CSS color variables</li>
                  <li>• Create theme colors for apps</li>
                  <li>• Extract colors for UI components</li>
                  <li>• Build design tokens from images</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Color Formats Explained</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">HEX (#RRGGBB)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Hexadecimal color codes are the most common format for web development. Each color is represented by a 
                  6-digit code prefixed with #. For example, <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">#FF5733</code> represents a red-orange color.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">RGB (Red, Green, Blue)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  RGB values represent colors using three numbers (0-255) for red, green, and blue channels. 
                  <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">rgb(255, 87, 51)</code> creates the same color as the HEX example above.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">HSL (Hue, Saturation, Lightness)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  HSL is more intuitive for designers. Hue (0-360) is the color itself, Saturation (0-100%) is the intensity, 
                  and Lightness (0-100%) is how light or dark the color is. <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">hsl(9, 100%, 60%)</code> represents a similar color.
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
                  You can upload PNG, JPG, JPEG, GIF, and WebP images. The maximum file size is 10MB. All processing 
                  happens in your browser, so your images are never uploaded to any server.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How accurate is the color extraction?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our algorithm analyzes pixel data and groups similar colors to find the most dominant colors in your image. 
                  The percentage shown indicates how much of the image each color represents. Results are optimized for 
                  performance while maintaining accuracy.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I extract more than 10 colors?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Currently, the tool supports extracting 3-10 colors. This range covers most use cases, from simple 
                  palettes to detailed color schemes. For most design purposes, 5-7 colors provide a good balance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Is my image stored or transmitted?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, all color extraction happens entirely in your browser using HTML5 Canvas API. We never see, store, 
                  or transmit any of your images. Your privacy is completely protected.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How do I use the exported CSS variables?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Copy the CSS code and paste it into your stylesheet. Then use the variables like <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">var(--color-1)</code> 
                  in your CSS. This makes it easy to maintain consistent colors across your project.
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

