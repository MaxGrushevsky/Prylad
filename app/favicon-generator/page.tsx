'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import FileDropZone from '@/components/FileDropZone'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type FaviconSize = 16 | 32 | 48 | 64 | 96 | 128 | 180 | 192 | 256 | 512
type GenerationMode = 'single' | 'package' | 'text'

const standardSizes: FaviconSize[] = [16, 32, 48, 64, 96, 128, 180, 192, 256, 512]
const faviconPackageSizes: FaviconSize[] = [16, 32, 48, 64, 180, 192, 512]

export default function FaviconGeneratorPage() {
  const [image, setImage] = useState<string | null>(null)
  const [size, setSize] = useState<FaviconSize>(32)
  const [mode, setMode] = useState<GenerationMode>('single')
  const [selectedSizes, setSelectedSizes] = useState<FaviconSize[]>(faviconPackageSizes)
  const [text, setText] = useState('F')
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [bgColor, setBgColor] = useState('#3B82F6')
  const [fontSize, setFontSize] = useState(24)
  const [autoGenerate, setAutoGenerate] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    handleFileSelect(file)
  }

  const handleFileSelect = (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file')
      return
    }

    setError(null)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImage(reader.result as string)
      setMode('single')
    }
    reader.onerror = () => {
      setError('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  const generateFaviconFromImage = useCallback((targetSize: number): Promise<string | null> => {
    if (!image || !canvasRef.current) {
      return Promise.resolve(null)
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return Promise.resolve(null)
    }

    canvas.width = targetSize
    canvas.height = targetSize

    return new Promise<string | null>((resolve) => {
      const img = new Image()
      img.onerror = () => {
        setError('Failed to load image')
        resolve(null)
      }
      img.onload = () => {
        // Clear canvas
        ctx.clearRect(0, 0, targetSize, targetSize)
        
        // Draw image with proper scaling (maintain aspect ratio, center crop)
        const scale = Math.max(targetSize / img.width, targetSize / img.height)
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        const x = (targetSize - scaledWidth) / 2
        const y = (targetSize - scaledHeight) / 2
        
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
        resolve(canvas.toDataURL('image/png'))
      }
      img.src = image
    })
  }, [image])

  const generateFaviconFromText = useCallback((targetSize: number): string | null => {
    if (!canvasRef.current) return null

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    canvas.width = targetSize
    canvas.height = targetSize

    // Fill background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, targetSize, targetSize)

    // Draw text
    ctx.fillStyle = textColor
    ctx.font = `bold ${Math.floor(targetSize * (fontSize / 32))}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text.charAt(0).toUpperCase(), targetSize / 2, targetSize / 2)

    return canvas.toDataURL('image/png')
  }, [text, textColor, bgColor, fontSize])

  const generateFavicon = useCallback(async (targetSize: number = size): Promise<string | null> => {
    if (mode === 'text') {
      return generateFaviconFromText(targetSize)
    } else if (image) {
      return await generateFaviconFromImage(targetSize)
    }
    return null
  }, [mode, size, image, generateFaviconFromImage, generateFaviconFromText])


  const downloadFavicon = async (targetSize: number = size, filename?: string) => {
    const dataUrl = await generateFavicon(targetSize)
    if (!dataUrl) return

    const link = document.createElement('a')
    link.download = filename || `favicon-${targetSize}x${targetSize}.png`
    link.href = dataUrl
    link.click()
  }

  const downloadPackage = async () => {
    for (const targetSize of selectedSizes) {
      const dataUrl = await generateFavicon(targetSize)
      if (!dataUrl) continue

      await new Promise<void>((resolve) => {
        const link = document.createElement('a')
        link.download = `favicon-${targetSize}x${targetSize}.png`
        link.href = dataUrl
        link.click()
        setTimeout(resolve, 100) // Small delay between downloads
      })
    }
  }

  const generateHTML = async (): Promise<string> => {
    const sizes = mode === 'package' ? selectedSizes : [size]
    const html: string[] = []
    
    for (const targetSize of sizes) {
      const dataUrl = await generateFavicon(targetSize)
      if (!dataUrl) continue

      if (targetSize === 16) {
        html.push(`<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">`)
      } else if (targetSize === 32) {
        html.push(`<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">`)
      } else if (targetSize === 180) {
        html.push(`<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">`)
      } else if (targetSize === 192) {
        html.push(`<link rel="icon" type="image/png" sizes="192x192" href="android-chrome-192x192.png">`)
      } else if (targetSize === 512) {
        html.push(`<link rel="icon" type="image/png" sizes="512x512" href="android-chrome-512x512.png">`)
      } else {
        html.push(`<link rel="icon" type="image/png" sizes="${targetSize}x${targetSize}" href="favicon-${targetSize}x${targetSize}.png">`)
      }
    }

    return html.join('\n')
  }

  const copyHTML = async () => {
    const html = await generateHTML()
    await navigator.clipboard.writeText(html)
  }

  // Update preview when settings change
  useEffect(() => {
    if (!autoGenerate) {
      setPreviewUrl(null)
      return
    }

    if (!image && mode !== 'text') {
      setPreviewUrl(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      // For package mode, use first selected size for preview
      const previewSize = mode === 'package' && selectedSizes.length > 0 
        ? selectedSizes[0] 
        : size
      const url = await generateFavicon(previewSize)
      setPreviewUrl(url)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [autoGenerate, image, mode, size, selectedSizes, text, textColor, bgColor, fontSize, generateFavicon])

  // SEO data
  const toolPath = '/favicon-generator'
  const toolName = 'Favicon Generator'
  const category = 'generator'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is a favicon?",
      answer: "A favicon (favorite icon) is a small icon displayed in browser tabs, bookmarks, and browser history. It helps users identify your website visually. Standard favicon size is 16x16 or 32x32 pixels."
    },
    {
      question: "How do I generate a favicon from an image?",
      answer: "Upload an image file, select the size (16x16 to 512x512), choose 'Single' mode for one favicon or 'Package' for multiple sizes, and the favicon is generated automatically. Download the PNG file."
    },
    {
      question: "Can I create a favicon from text?",
      answer: "Yes! Select 'Text' mode, enter your text (usually 1-2 characters), choose text color and background color, set font size, and the favicon is generated with your text on a colored background."
    },
    {
      question: "What is a favicon package?",
      answer: "A favicon package includes multiple sizes (16, 32, 48, 64, 180, 192, 512 pixels) for different devices and use cases. This ensures your favicon looks good on all platforms: desktop browsers, mobile devices, Apple touch icons, and Android Chrome icons."
    },
    {
      question: "What sizes should I generate?",
      answer: "For a complete package, generate: 16x16 (standard favicon), 32x32 (high-DPI), 180x180 (Apple touch icon), 192x192 (Android Chrome), and 512x512 (PWA icon). The generator includes a package mode that creates all standard sizes."
    },
    {
      question: "Is the favicon generator free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All favicon generation happens in your browser - we never see or store your images."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Choose Generation Mode",
      text: "Select 'Single' to generate one favicon, 'Package' to generate multiple sizes, or 'Text' to create a favicon from text with custom colors."
    },
    {
      name: "Upload Image or Enter Text",
      text: "For image mode: upload your image file. For text mode: enter text (1-2 characters), choose text color, background color, and font size."
    },
    {
      name: "Select Sizes",
      text: "Choose the favicon size(s) you need. For packages, select multiple sizes. Standard sizes include 16x16, 32x32, 180x180, 192x192, and 512x512."
    },
    {
      name: "Preview and Generate",
      text: "See the favicon preview in real-time. The favicon is generated automatically when auto-generate is enabled, or click 'Generate' manually."
    },
    {
      name: "Download Favicon",
      text: "Download individual favicons or the complete package. For packages, you also get HTML code to include in your website's <head> section."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Generate Favicons",
      "Learn how to generate favicons from images or text using our free online favicon generator tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Favicon Generator",
      "Free online favicon generator. Create favicons from images or text. Generate single favicons or complete packages for all devices. Export PNG files and HTML code.",
      "https://prylad.pro/favicon-generator",
      "UtilityApplication"
    )
  ]

  const toggleSize = (targetSize: FaviconSize) => {
    if (selectedSizes.includes(targetSize)) {
      setSelectedSizes(selectedSizes.filter(s => s !== targetSize))
    } else {
      setSelectedSizes([...selectedSizes, targetSize].sort((a, b) => a - b))
    }
  }

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🎯 Favicon Generator"
        description="Generate favicons from images or text online for free. Create single favicons or complete favicon packages for all devices. Export PNG files and HTML code."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Settings */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Favicon Settings</h2>
            </div>

            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Generation Mode:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setMode('single')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    mode === 'single'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Single
                </button>
                <button
                  onClick={() => setMode('package')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    mode === 'package'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Package
                </button>
                <button
                  onClick={() => {
                    setMode('text')
                    setImage(null)
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    mode === 'text'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Text
                </button>
              </div>
            </div>

            {/* Image Upload (for single/package mode) */}
            {mode !== 'text' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Upload Image
                </label>
                <FileDropZone
                  onFileSelect={handleFileSelect}
                  accept="image/*"
                  maxSize={10 * 1024 * 1024}
                >
                  <div className="text-center py-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </FileDropZone>
                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
                {image && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-700">✓ Image loaded successfully</p>
                  </div>
                )}
              </div>
            )}

            {/* Text Mode Options */}
            {mode === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Text (first character will be used)
                  </label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value || 'F')}
                    maxLength={1}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-center text-2xl font-bold bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Background Color</label>
                    <label className="relative block cursor-pointer group">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-full h-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary-400 transition-all opacity-0 absolute bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      />
                      <div 
                        className="w-full h-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary-400 transition-all flex items-center justify-end px-3 relative overflow-hidden"
                        style={{ backgroundColor: bgColor }}
                      >
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <svg className="w-4 h-4 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8)) drop-shadow(0 0 1px rgba(0,0,0,0.9))' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Text Color</label>
                    <label className="relative block cursor-pointer group">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary-400 transition-all opacity-0 absolute bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      />
                      <div 
                        className="w-full h-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary-400 transition-all flex items-center justify-end px-3 relative overflow-hidden"
                        style={{ backgroundColor: textColor }}
                      >
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <svg className="w-4 h-4 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8)) drop-shadow(0 0 1px rgba(0,0,0,0.9))' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                </div>
              </div>
            )}

            {/* Size Selection */}
            {mode === 'single' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Size: {size}x{size}px
                </label>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {standardSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        size === s
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {s}×{s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Package Size Selection */}
            {mode === 'package' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Select Sizes (click to toggle):
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {standardSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        selectedSizes.includes(s)
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {s}×{s}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Selected: {selectedSizes.length} size{selectedSizes.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

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
                onClick={async () => {
                  await generateFavicon()
                }}
                disabled={!image && mode !== 'text'}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50"
              >
                Generate Favicon
              </button>
            )}
          </div>

          {/* Preview */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <h2 className="text-xl font-bold">Preview</h2>

            {/* Hidden canvas */}
            <canvas
              ref={canvasRef}
              style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
            />

            {previewUrl ? (
              <div className="space-y-6">
                {/* Main Preview */}
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-800 flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt={`Favicon ${size}x${size}`}
                    className="border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    {mode === 'single' ? `${size}×${size}px` : `${selectedSizes.length} sizes`}
                  </p>
                </div>

                {/* Browser Tab Preview */}
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Browser Tab Preview:</h3>
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded px-3 py-2">
                    <img src={previewUrl} alt="Favicon" className="w-4 h-4" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Example Website</span>
                  </div>
                </div>

                {/* Mobile Preview */}
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Mobile Home Screen:</h3>
                  <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                    <img src={previewUrl} alt="App Icon" className="w-12 h-12 rounded-lg" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Example App</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Website</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {mode === 'single' ? (
                    <button
                      onClick={() => downloadFavicon()}
                      className="w-full bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors"
                    >
                      Download PNG
                    </button>
                  ) : (
                    <button
                      onClick={downloadPackage}
                      className="w-full bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors"
                    >
                      Download Package ({selectedSizes.length} files)
                    </button>
                  )}
                  <button
                    onClick={copyHTML}
                    className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    Copy HTML Code
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 bg-gray-50 dark:bg-gray-800 text-center text-gray-400">
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Favicon will appear here</p>
                <p className="text-sm">
                  {mode === 'text' 
                    ? 'Enter text and customize colors'
                    : 'Upload an image to get started'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is a Favicon?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                A favicon (favorite icon) is a small icon displayed in browser tabs, bookmarks, browser history, 
                and mobile home screens. It helps users identify your website quickly and adds a professional touch 
                to your brand identity.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our free favicon generator creates favicons from images or text instantly in your browser. 
                Generate single favicons or complete favicon packages with all standard sizes for desktop browsers, 
                mobile devices, and app icons. Perfect for web developers, designers, and anyone creating a website.
              </p>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use Our Favicon Generator</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li><strong>Choose Mode:</strong> Select Single (one size), Package (multiple sizes), or Text (generate from text/emoji).</li>
                <li><strong>Upload Image or Enter Text:</strong> For image mode, upload a PNG, JPG, or other image file. For text mode, enter a letter or emoji.</li>
                <li><strong>Select Sizes:</strong> Choose the favicon size(s) you need. Standard sizes include 16×16, 32×32, 48×48, 180×180 (Apple), 192×192, and 512×512 (Android).</li>
                <li><strong>Customize (Text Mode):</strong> Adjust background color, text color, and font size for text-based favicons.</li>
                <li><strong>Preview & Download:</strong> See how your favicon looks in browser tabs and mobile home screens. Download PNG files or copy HTML code.</li>
              </ol>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Favicon Sizes</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🌐 Desktop Browsers</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• 16×16px - Standard browser tab icon</li>
                  <li>• 32×32px - High-DPI displays</li>
                  <li>• 48×48px - Windows taskbar</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📱 Mobile Devices</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• 180×180px - Apple touch icon (iOS)</li>
                  <li>• 192×192px - Android Chrome</li>
                  <li>• 512×512px - Android Chrome (large)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What image formats are supported?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  You can upload any common image format (PNG, JPG, JPEG, GIF, WebP, SVG). The generator will 
                  convert it to PNG format, which is the standard for favicons.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Do I need multiple favicon sizes?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  For best compatibility across all devices and browsers, yes. Use our Package mode to generate 
                  all standard sizes at once. Modern browsers will automatically select the appropriate size.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How do I add a favicon to my website?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  After generating your favicon, download the PNG file(s) and upload them to your website&apos;s root 
                  directory. Then add the HTML code (provided by our generator) to your website&apos;s &lt;head&gt; section. 
                  Use our &quot;Copy HTML Code&quot; button for ready-to-use code.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I use text or emojis for favicons?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes! Our Text mode allows you to create favicons from a single character or emoji. Customize the 
                  background color, text color, and font size to match your brand.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Is my image stored or transmitted?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, all favicon generation happens entirely in your browser. We never see, store, or transmit 
                  any of your images or settings. Your privacy is completely protected.
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

