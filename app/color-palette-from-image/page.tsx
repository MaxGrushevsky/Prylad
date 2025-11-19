'use client'

import { useState, useCallback, useRef } from 'react'
import Layout from '@/components/Layout'
import FileDropZone from '@/components/FileDropZone'

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
    }
  }

  const exportPalette = () => {
    if (colors.length === 0) return
    
    const content = colors.map(color => 
      `${color.hex} - RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}) - HSL(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`
    ).join('\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'color-palette.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Layout
      title="🎨 Color Palette from Image"
      description="Extract color palette from images. Upload an image and get dominant colors in HEX, RGB, and HSL formats."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
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
                <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
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
                    Extracted Colors
                  </label>
                  <button
                    onClick={exportPalette}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Export Palette
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {colors.map((color, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      <div
                        className="h-24 w-full"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                            {color.hex}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {color.percentage}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                          <div className="font-mono">
                            RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                          </div>
                          <div className="font-mono">
                            HSL({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(color.hex)}
                          className="w-full mt-2 px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                        >
                          Copy HEX
                        </button>
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
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Copy CSS
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <pre className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    <code>{`:root {\n${colors.map((color, i) => `  --color-${i + 1}: ${color.hex};`).join('\n')}\n}`}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      </Layout>
  )
}

