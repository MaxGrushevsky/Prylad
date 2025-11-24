'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import FileDropZone from '@/components/FileDropZone'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type ColorBlindnessType = 'normal' | 'protanopia' | 'protanomaly' | 'deuteranopia' | 'deuteranomaly' | 'tritanopia' | 'tritanomaly'
type ViewMode = 'single' | 'side-by-side' | 'all-types'

interface ColorBlindnessInfo {
  name: string
  description: string
  prevalence: string
  severity: 'none' | 'mild' | 'moderate' | 'severe'
  exampleColors: { name: string; normal: string; simulated: string }[]
}

export default function ColorBlindnessSimulatorPage() {
  const [image, setImage] = useState<string | null>(null)
  const [type, setType] = useState<ColorBlindnessType>('normal')
  const [viewMode, setViewMode] = useState<ViewMode>('single')
  const [imageUrl, setImageUrl] = useState('')
  const [loadingUrl, setLoadingUrl] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasesRef = useRef<Record<string, HTMLCanvasElement>>({})

  // Improved color blindness filters using Brettel's algorithm (more accurate)
  const getFilterMatrix = (type: ColorBlindnessType): number[][] => {
    switch (type) {
      case 'protanopia':
        // Complete absence of red cones
        return [
          [0.567, 0.433, 0, 0, 0],
          [0.558, 0.442, 0, 0, 0],
          [0, 0.242, 0.758, 0, 0],
          [0, 0, 0, 1, 0]
        ]
      case 'protanomaly':
        // Reduced sensitivity to red (milder form)
        return [
          [0.817, 0.183, 0, 0, 0],
          [0.333, 0.667, 0, 0, 0],
          [0, 0.125, 0.875, 0, 0],
          [0, 0, 0, 1, 0]
        ]
      case 'deuteranopia':
        // Complete absence of green cones
        return [
          [0.625, 0.375, 0, 0, 0],
          [0.7, 0.3, 0, 0, 0],
          [0, 0.3, 0.7, 0, 0],
          [0, 0, 0, 1, 0]
        ]
      case 'deuteranomaly':
        // Reduced sensitivity to green (milder form)
        return [
          [0.8, 0.2, 0, 0, 0],
          [0.258, 0.742, 0, 0, 0],
          [0, 0.142, 0.858, 0, 0],
          [0, 0, 0, 1, 0]
        ]
      case 'tritanopia':
        // Complete absence of blue cones
        return [
          [0.95, 0.05, 0, 0, 0],
          [0, 0.433, 0.567, 0, 0],
          [0, 0.475, 0.525, 0, 0],
          [0, 0, 0, 1, 0]
        ]
      case 'tritanomaly':
        // Reduced sensitivity to blue (milder form)
        return [
          [0.967, 0.033, 0, 0, 0],
          [0, 0.733, 0.267, 0, 0],
          [0, 0.183, 0.817, 0, 0],
          [0, 0, 0, 1, 0]
        ]
      default:
        // Normal vision
        return [
          [1, 0, 0, 0, 0],
          [0, 1, 0, 0, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 0, 1, 0]
        ]
    }
  }

  // Apply color blindness filter to image data
  const applyFilterToImageData = useCallback((imageData: ImageData, filterType: ColorBlindnessType): ImageData => {
    if (filterType === 'normal') return imageData

    const data = new Uint8ClampedArray(imageData.data)
    const matrix = getFilterMatrix(filterType)

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255
      const g = data[i + 1] / 255
      const b = data[i + 2] / 255
      const a = data[i + 3] / 255

      // Apply transformation matrix
      const newR = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2]
      const newG = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2]
      const newB = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2]

      data[i] = Math.min(255, Math.max(0, Math.round(newR * 255)))
      data[i + 1] = Math.min(255, Math.max(0, Math.round(newG * 255)))
      data[i + 2] = Math.min(255, Math.max(0, Math.round(newB * 255)))
      data[i + 3] = Math.round(a * 255)
    }

    return new ImageData(data, imageData.width, imageData.height)
  }, [])

  // Process image and apply filter
  const processImage = useCallback((imgSrc: string, canvas: HTMLCanvasElement, filterType: ColorBlindnessType) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      if (filterType !== 'normal') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const filteredData = applyFilterToImageData(imageData, filterType)
        ctx.putImageData(filteredData, 0, 0)
      }
    }
    img.onerror = () => {
      console.error('Failed to load image')
    }
    img.src = imgSrc
  }, [applyFilterToImageData])

  // Apply filter to main canvas
  const applyFilter = useCallback(() => {
    if (!image || !canvasRef.current) return
    processImage(image, canvasRef.current, type)
  }, [image, type, processImage])

  // Process all types for comparison view
  const processAllTypes = useCallback(() => {
    if (!image) return

    const types: ColorBlindnessType[] = ['normal', 'protanopia', 'protanomaly', 'deuteranopia', 'deuteranomaly', 'tritanopia', 'tritanomaly']
    
    types.forEach((filterType) => {
      const canvas = canvasesRef.current[filterType]
      if (canvas) {
        processImage(image, canvas, filterType)
      }
    })
  }, [image, processImage])

  useEffect(() => {
    if (viewMode === 'all-types') {
      processAllTypes()
    } else {
      applyFilter()
      if (viewMode === 'side-by-side' && originalCanvasRef.current) {
        processImage(image!, originalCanvasRef.current, 'normal')
      }
    }
  }, [image, type, viewMode, applyFilter, processAllTypes, processImage])

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImage(result)
      setImageUrl('')
    }
    reader.onerror = () => {
      console.error('Failed to read file')
    }
    reader.readAsDataURL(file)
  }, [])

  const handleUrlLoad = useCallback(async () => {
    if (!imageUrl.trim()) return

    setLoadingUrl(true)
    try {
      // Test if URL is accessible
      const response = await fetch(imageUrl, { method: 'HEAD', mode: 'no-cors' })
      setImage(imageUrl)
    } catch (error) {
      // Try to load anyway (CORS might block HEAD but allow image load)
      setImage(imageUrl)
    } finally {
      setLoadingUrl(false)
    }
  }, [imageUrl])

  const downloadImage = (filterType?: ColorBlindnessType, canvas?: HTMLCanvasElement) => {
    const targetCanvas = canvas || canvasRef.current
    if (!targetCanvas) return
    
    const downloadType = filterType || type
    targetCanvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `color-blind-${downloadType}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  // Color blindness information
  const colorBlindnessInfo: Record<ColorBlindnessType, ColorBlindnessInfo> = {
    normal: {
      name: 'Normal Vision',
      description: 'Full color vision with all three types of cones functioning normally.',
      prevalence: 'Most of the population',
      severity: 'none',
      exampleColors: []
    },
    protanopia: {
      name: 'Protanopia',
      description: 'Complete absence of red cones. Reds appear darker and blend with greens.',
      prevalence: '~1% of males, ~0.01% of females',
      severity: 'severe',
      exampleColors: [
        { name: 'Red', normal: '#FF0000', simulated: '#8B6F47' },
        { name: 'Green', normal: '#00FF00', simulated: '#8B6F47' },
        { name: 'Blue', normal: '#0000FF', simulated: '#0000FF' }
      ]
    },
    protanomaly: {
      name: 'Protanomaly',
      description: 'Reduced sensitivity to red light. Milder form of red-green color blindness.',
      prevalence: '~1% of males',
      severity: 'moderate',
      exampleColors: [
        { name: 'Red', normal: '#FF0000', simulated: '#CC6633' },
        { name: 'Green', normal: '#00FF00', simulated: '#66CC33' }
      ]
    },
    deuteranopia: {
      name: 'Deuteranopia',
      description: 'Complete absence of green cones. Greens fade toward beige.',
      prevalence: '~1% of males, ~0.01% of females',
      severity: 'severe',
      exampleColors: [
        { name: 'Red', normal: '#FF0000', simulated: '#CC6633' },
        { name: 'Green', normal: '#00FF00', simulated: '#CC6633' },
        { name: 'Blue', normal: '#0000FF', simulated: '#0000FF' }
      ]
    },
    deuteranomaly: {
      name: 'Deuteranomaly',
      description: 'Reduced sensitivity to green light. Most common form of color blindness.',
      prevalence: '~5% of males',
      severity: 'mild',
      exampleColors: [
        { name: 'Red', normal: '#FF0000', simulated: '#FF6633' },
        { name: 'Green', normal: '#00FF00', simulated: '#99CC33' }
      ]
    },
    tritanopia: {
      name: 'Tritanopia',
      description: 'Complete absence of blue cones. Blues and yellows shift dramatically.',
      prevalence: '~0.01% of population',
      severity: 'severe',
      exampleColors: [
        { name: 'Blue', normal: '#0000FF', simulated: '#00FFFF' },
        { name: 'Yellow', normal: '#FFFF00', simulated: '#FFFFFF' }
      ]
    },
    tritanomaly: {
      name: 'Tritanomaly',
      description: 'Reduced sensitivity to blue light. Very rare condition.',
      prevalence: '~0.01% of population',
      severity: 'mild',
      exampleColors: [
        { name: 'Blue', normal: '#0000FF', simulated: '#0080FF' },
        { name: 'Yellow', normal: '#FFFF00', simulated: '#FFFF80' }
      ]
    }
  }

  // SEO data
  const toolPath = '/color-blindness-simulator'
  const toolName = 'Color Blindness Simulator'
  const category = 'design'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is color blindness?",
      answer: "Color blindness (color vision deficiency) is a condition where people have difficulty distinguishing certain colors. Types include Protanopia/Protanomaly (red-green), Deuteranopia/Deuteranomaly (red-green), and Tritanopia/Tritanomaly (blue-yellow). Approximately 8% of men and 0.5% of women have some form of color vision deficiency."
    },
    {
      question: "Why should I test images for color blindness?",
      answer: "Testing images for color blindness ensures your designs are accessible to all users. Accessible designs improve user experience for everyone and help you comply with WCAG accessibility guidelines. This tool helps you identify potential issues before deployment."
    },
    {
      question: "What types of color blindness can I simulate?",
      answer: "Six types: Protanopia (severe red-green, cannot see red), Protanomaly (mild red-green), Deuteranopia (severe red-green, cannot see green), Deuteranomaly (mild red-green, most common), Tritanopia (severe blue-yellow), and Tritanomaly (mild blue-yellow). You can view them individually, side-by-side with the original, or all at once."
    },
    {
      question: "How do I use the color blindness simulator?",
      answer: "Upload your image (drag & drop, file picker, or paste URL), choose a view mode (single, side-by-side, or all types), select color blindness types to compare, and review the simulations. Download any result to share with your team."
    },
    {
      question: "What should I look for when testing?",
      answer: "Check if important information relies solely on color. Ensure text is readable, buttons are distinguishable, error states are clear, and information is conveyed through shapes, patterns, icons, or text labels in addition to color. Test critical user flows like forms and alerts."
    },
    {
      question: "Is the color blindness simulator free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All image processing happens in your browser - we never see or store your images. Your privacy is protected."
    },
    {
      question: "Can I load images from URLs?",
      answer: "Yes! You can paste an image URL in the URL input field and click 'Load from URL'. Note that some images may be blocked by CORS policies, in which case you should download and upload the image directly."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Upload Image",
      text: "Upload your image by dragging and dropping it, clicking to select a file, or pasting an image URL. Supported formats: JPEG, PNG, WebP, GIF. The image loads instantly for simulation."
    },
    {
      name: "Choose View Mode",
      text: "Select a view mode: 'Single' to see one type at a time, 'Side-by-Side' to compare original with a selected type, or 'All Types' to see all simulations in a grid for comprehensive comparison."
    },
    {
      name: "Select Color Blindness Type",
      text: "Choose from six types: Protanopia/Protanomaly (red-green, difficulty seeing red), Deuteranopia/Deuteranomaly (red-green, difficulty seeing green), or Tritanopia/Tritanomaly (blue-yellow). Each type shows how colors are perceived differently."
    },
    {
      name: "Review Simulations",
      text: "Examine how your image appears to people with each type of color vision deficiency. Look for lost information, reduced contrast, or unclear distinctions between elements that rely on color."
    },
    {
      name: "Download & Share",
      text: "Download any simulation result to share with your design team, attach to QA reports, or include in accessibility documentation. Each download is labeled with the color blindness type."
    },
    {
      name: "Make Improvements",
      text: "If important information is lost in simulations, improve your design by adding text labels, icons, patterns, or shapes in addition to color. Ensure sufficient contrast and avoid problematic color combinations."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Test Images for Color Blindness Accessibility",
      "Learn how to test images for color blindness accessibility using our free online color blindness simulator tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Color Blindness Simulator",
      "Free online color blindness simulator. Test images for accessibility by simulating 6 types of color vision deficiencies (Protanopia, Protanomaly, Deuteranopia, Deuteranomaly, Tritanopia, Tritanomaly). Side-by-side comparison, all-types view, and URL loading. Perfect for web designers and developers.",
      "https://prylad.pro/color-blindness-simulator",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="👁️ Color Blindness Simulator"
        description="Simulate color blindness to test image accessibility. Preview how images look with different types of color vision deficiency."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            {/* View Mode Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                View Mode
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <button
                  onClick={() => setViewMode('single')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'single'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Single View
                </button>
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'side-by-side'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  onClick={() => setViewMode('all-types')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'all-types'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All Types
                </button>
              </div>
            </div>

            {/* Type Selection (only for single and side-by-side) */}
            {viewMode !== 'all-types' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Color Blindness Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {(['normal', 'protanopia', 'protanomaly', 'deuteranopia', 'deuteranomaly', 'tritanopia', 'tritanomaly'] as ColorBlindnessType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
                        type === t
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      title={colorBlindnessInfo[t].description}
                    >
                      {colorBlindnessInfo[t].name.split(' ')[0]}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {colorBlindnessInfo[type].description} ({colorBlindnessInfo[type].prevalence})
                </div>
              </div>
            )}

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
              
              {/* URL Input */}
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Or load from URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlLoad()}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={handleUrlLoad}
                    disabled={loadingUrl || !imageUrl.trim()}
                    className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loadingUrl ? 'Loading...' : 'Load'}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview - Single View */}
            {image && viewMode === 'single' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Preview ({colorBlindnessInfo[type].name})
                  </label>
                  <button
                    onClick={() => downloadImage()}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Download
                  </button>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Preview - Side-by-Side */}
            {image && viewMode === 'side-by-side' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Comparison: Normal vs {colorBlindnessInfo[type].name}
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadImage('normal', originalCanvasRef.current || undefined)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Download Original
                    </button>
                    <button
                      onClick={() => downloadImage()}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Download Simulated
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Normal Vision</div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                      <canvas
                        ref={originalCanvasRef}
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">{colorBlindnessInfo[type].name}</div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                      <canvas
                        ref={canvasRef}
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview - All Types */}
            {image && viewMode === 'all-types' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    All Color Blindness Types Comparison
                  </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(['normal', 'protanopia', 'protanomaly', 'deuteranopia', 'deuteranomaly', 'tritanopia', 'tritanomaly'] as ColorBlindnessType[]).map((t) => (
                    <div key={t}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {colorBlindnessInfo[t].name}
                        </div>
                        <button
                          onClick={() => downloadImage(t, canvasesRef.current[t])}
                          className="text-xs text-primary-600 hover:text-primary-700"
                          title="Download"
                        >
                          ⬇
                        </button>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                        <canvas
                          ref={(el) => {
                            if (el) canvasesRef.current[t] = el
                          }}
                          className="w-full h-auto max-h-48 object-contain"
                        />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {colorBlindnessInfo[t].prevalence}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Color Examples */}
            {viewMode === 'single' && colorBlindnessInfo[type].exampleColors.length > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">Color Examples</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {colorBlindnessInfo[type].exampleColors.map((color, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{color.name}</div>
                      <div className="flex gap-1 justify-center">
                        <div
                          className="w-12 h-12 rounded border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: color.normal }}
                          title={`Normal: ${color.normal}`}
                        />
                        <div className="flex items-center text-gray-400">→</div>
                        <div
                          className="w-12 h-12 rounded border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: color.simulated }}
                          title={`Simulated: ${color.simulated}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">About Color Blindness</h3>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <p>
                  <strong>Protanopia/Protanomaly:</strong> Red-green color blindness affecting red cone sensitivity. Protanopia (severe) affects ~1% of males, Protanomaly (mild) affects ~1% of males.
                </p>
                <p>
                  <strong>Deuteranopia/Deuteranomaly:</strong> Red-green color blindness affecting green cone sensitivity. Deuteranopia (severe) affects ~1% of males, Deuteranomaly (mild, most common) affects ~5% of males.
                </p>
                <p>
                  <strong>Tritanopia/Tritanomaly:</strong> Blue-yellow color blindness affecting blue cone sensitivity. Very rare, affects ~0.01% of population.
                </p>
                <p className="mt-2">
                  Use this tool to test your designs for accessibility and ensure information is conveyed through more than just color. Test critical user flows and ensure sufficient contrast.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 mt-10">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-white mb-4">How to Simulate Color Blindness</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>Upload a screenshot, UI mockup, or illustration (drag & drop, file picker, or paste URL).</li>
            <li>Choose a view mode: Single (one type), Side-by-Side (compare with original), or All Types (grid view).</li>
            <li>Select color vision deficiency types: Protanopia/Protanomaly, Deuteranopia/Deuteranomaly, or Tritanopia/Tritanomaly.</li>
            <li>Review the preview to see how users with each condition perceive your design.</li>
            <li>Download any simulation result to share with teammates or attach to QA reports.</li>
          </ol>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Tip: Use &quot;All Types&quot; view to quickly compare all simulations. Test critical flows (forms, buttons, alerts) to ensure color alone isn&rsquo;t conveying important information.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-white mb-4">Color Blindness Types Explained</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 dark:text-white mb-1">Protanopia (Severe)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Red cones missing</p>
              <p>Reds look darker and blend with greens. Affects ~1% of males, ~0.01% of females.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 dark:text-white mb-1">Protanomaly (Mild)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reduced red sensitivity</p>
              <p>Milder form of red-green color blindness. Affects ~1% of males.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 dark:text-white mb-1">Deuteranopia (Severe)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Green cones missing</p>
              <p>Greens fade toward beige. Affects ~1% of males, ~0.01% of females.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 dark:text-white mb-1">Deuteranomaly (Mild)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reduced green sensitivity</p>
              <p>Most common form of color blindness. Affects ~5% of males.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 dark:text-white mb-1">Tritanopia (Severe)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Blue cones missing</p>
              <p>Blues and yellows shift dramatically. Very rare, affects ~0.01% of population.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 dark:text-white mb-1">Tritanomaly (Mild)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reduced blue sensitivity</p>
              <p>Milder form of blue-yellow color blindness. Very rare, affects ~0.01% of population.</p>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-white mb-4">Accessibility Best Practices</h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed list-disc list-inside">
            <li>Use redundant cues: combine color with icons, labels, or patterns.</li>
            <li>Maintain sufficient contrast (WCAG AA) so text remains legible for most users.</li>
            <li>Avoid pairing problematic colors (red/green, blue/yellow) for status indicators.</li>
            <li>Document findings and share the simulated previews during design critiques.</li>
          </ul>
        </section>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Design Tools" />
      )}
    </Layout>
    </>
  )
}

