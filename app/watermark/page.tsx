'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import FileDropZone from '@/components/FileDropZone'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type WatermarkPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
type WatermarkType = 'text' | 'image'

export default function WatermarkPage() {
  const [image, setImage] = useState<string | null>(null)
  const [watermarkText, setWatermarkText] = useState('Watermark')
  const [fontSize, setFontSize] = useState(48)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('bold')
  const [opacity, setOpacity] = useState(0.4)
  const [position, setPosition] = useState<WatermarkPosition>('center')
  const [color, setColor] = useState('#FFFFFF')
  const [rotation, setRotation] = useState(-30)
  const [tileWatermark, setTileWatermark] = useState(true)
  const [tileSpacing, setTileSpacing] = useState(200)
  const [margin, setMargin] = useState(40)
  const [autoApply, setAutoApply] = useState(true)
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text')
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null)
  const [watermarkScale, setWatermarkScale] = useState(40)
  const [imageInfo, setImageInfo] = useState({ width: 0, height: 0, size: 0 })
  const [error, setError] = useState('')
  const [operations, setOperations] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const examples = [
    'Confidential',
    '© 2025 YourBrand',
    'Sample Image',
    'Do Not Copy',
    'Preview'
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    handleFileSelect(file)
  }

  const handleFileSelect = (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      setError('Please upload images smaller than 8MB')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onloadend = () => {
      setImage(reader.result as string)
      const img = new Image()
      img.onload = () => {
        setImageInfo({ width: img.width, height: img.height, size: file.size })
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      setError('Please upload watermark images smaller than 4MB')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onerror = () => {
      setError('Failed to read watermark image')
    }
    reader.onloadend = () => {
      setWatermarkImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const applyWatermark = useCallback(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onerror = () => {
      setError('Failed to load image')
    }
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      ctx.globalAlpha = opacity

      const drawTextWatermark = (x: number, y: number) => {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = color
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
        ctx.fillText(watermarkText, 0, 0)
        ctx.restore()
      }

      const drawImageWatermark = (x: number, y: number, watermarkImg: HTMLImageElement) => {
        const scale = watermarkScale / 100
        const w = watermarkImg.width * scale
        const h = watermarkImg.height * scale
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.drawImage(watermarkImg, -w / 2, -h / 2, w, h)
        ctx.restore()
      }

      const drawWatermark = (drawFn: (x: number, y: number, img?: HTMLImageElement) => void, watermarkImg?: HTMLImageElement) => {
        if (tileWatermark) {
          // Start from center and tile outward
          const startX = canvas.width / 2
          const startY = canvas.height / 2
          for (let x = startX % tileSpacing; x < canvas.width + tileSpacing; x += tileSpacing) {
            for (let y = startY % tileSpacing; y < canvas.height + tileSpacing; y += tileSpacing) {
              drawFn(x, y, watermarkImg)
            }
          }
        } else {
          let x = canvas.width / 2
          let y = canvas.height / 2

          if (position === 'top-left') {
            x = margin + (watermarkType === 'text' ? fontSize : watermarkScale)
            y = margin + (watermarkType === 'text' ? fontSize : watermarkScale)
          } else if (position === 'top-right') {
            x = canvas.width - margin - (watermarkType === 'text' ? fontSize : watermarkScale)
            y = margin + (watermarkType === 'text' ? fontSize : watermarkScale)
          } else if (position === 'bottom-left') {
            x = margin + (watermarkType === 'text' ? fontSize : watermarkScale)
            y = canvas.height - margin - (watermarkType === 'text' ? fontSize : watermarkScale)
          } else if (position === 'bottom-right') {
            x = canvas.width - margin - (watermarkType === 'text' ? fontSize : watermarkScale)
            y = canvas.height - margin - (watermarkType === 'text' ? fontSize : watermarkScale)
          }
          drawFn(x, y, watermarkImg)
        }
      }

      if (watermarkType === 'text' && watermarkText.trim()) {
        drawWatermark(drawTextWatermark)
        ctx.globalAlpha = 1
        setOperations((prev) => prev + 1)
      } else if (watermarkType === 'image' && watermarkImage) {
        const watermarkImg = new Image()
        watermarkImg.onerror = () => {
          setError('Failed to load watermark image')
          ctx.globalAlpha = 1
        }
        watermarkImg.onload = () => {
          drawWatermark((x, y) => drawImageWatermark(x, y, watermarkImg))
          ctx.globalAlpha = 1
          setOperations((prev) => prev + 1)
        }
        watermarkImg.src = watermarkImage
      } else {
        ctx.globalAlpha = 1
      }
    }
    img.src = image
  }, [
    image,
    watermarkText,
    fontSize,
    fontFamily,
    fontWeight,
    opacity,
    color,
    rotation,
    tileWatermark,
    tileSpacing,
    position,
    margin,
    watermarkType,
    watermarkImage,
    watermarkScale
  ])

  useEffect(() => {
    if (autoApply && image) {
      const timeoutId = setTimeout(() => {
        applyWatermark()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [autoApply, image, applyWatermark])

  // SEO data
  const toolPath = '/watermark'
  const toolName = 'Watermark Generator'
  const category = 'image'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is a watermark?",
      answer: "A watermark is a visible or semi-transparent overlay added to images to protect copyright, brand identity, or indicate ownership. It can be text (like a copyright notice) or an image (like a logo)."
    },
    {
      question: "How do I add a watermark to an image?",
      answer: "Upload your image, choose watermark type (text or image), customize the watermark (text, font, size, color, opacity, position, rotation), and the watermark is applied automatically. Download the watermarked image."
    },
    {
      question: "Can I use an image as a watermark?",
      answer: "Yes! Select 'Image' watermark type, upload your logo or watermark image, adjust scale and opacity, and position it on your image. Perfect for adding logos or brand marks."
    },
    {
      question: "What customization options are available?",
      answer: "For text watermarks: text content, font family, font size, font weight, color, opacity, rotation, position, tiling, and margin. For image watermarks: scale, opacity, position, rotation, tiling, and margin."
    },
    {
      question: "Can I tile watermarks across the image?",
      answer: "Yes! Enable 'Tile Watermark' to repeat the watermark across the entire image. Adjust tile spacing to control how frequently the watermark appears. This is useful for protecting images from unauthorized use."
    },
    {
      question: "Is the watermark tool free and secure?",
      answer: "Yes, completely free and secure! All watermark processing happens entirely in your browser. We never see, store, transmit, or have access to your images. Your privacy is completely protected."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Upload Image",
      text: "Upload your image by dragging and dropping it or clicking to select. Supported formats: JPEG, PNG, WebP. The image loads instantly for watermarking."
    },
    {
      name: "Choose Watermark Type",
      text: "Select 'Text' to add a text watermark (copyright notice, name, etc.) or 'Image' to add a logo or image watermark."
    },
    {
      name: "Customize Watermark",
      text: "For text: enter text, choose font, size, weight, color, opacity, and rotation. For image: upload watermark image, adjust scale and opacity."
    },
    {
      name: "Set Position and Tiling",
      text: "Choose watermark position (center, corners) or enable tiling to repeat across the image. Adjust margin and tile spacing as needed."
    },
    {
      name: "Download Watermarked Image",
      text: "Preview the watermarked image, then download it. The watermark is permanently applied to protect your image."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Add Watermarks to Images",
      "Learn how to add professional watermarks to your images using our free online watermark generator tool.",
      howToSteps,
      "PT3M"
    ),
    generateSoftwareApplicationSchema(
      "Watermark Generator",
      "Free online watermark generator. Add custom text or logo watermarks to images. Adjust opacity, rotation, tiling, and placement. 100% browser-based, no uploads, no registration.",
      "https://prylad.pro/watermark",
      "WebApplication"
    )
  ]

  const downloadImage = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `watermarked-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  const resetSettings = () => {
    setWatermarkText('Watermark')
    setFontSize(48)
    setFontFamily('Arial')
    setFontWeight('bold')
    setOpacity(0.4)
    setPosition('center')
    setColor('#FFFFFF')
    setRotation(-30)
    setTileWatermark(true)
    setTileSpacing(200)
    setMargin(40)
    setWatermarkType('text')
    setWatermarkImage(null)
    setWatermarkScale(40)
  }

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="💧 Add Watermark to Image Online"
        description="Add professional watermarks to your images online. Customize text or image watermarks, opacity, rotation, tiling, and more. All processing happens in your browser."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Watermark Settings</h2>
              <button
                onClick={resetSettings}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 transition-colors"
              >
                Reset settings
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload Image</label>
                <FileDropZone
                  onFileSelect={handleFileSelect}
                  accept="image/*"
                  maxSize={8 * 1024 * 1024}
                >
                  <div className="text-center py-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 8MB</p>
                  </div>
                </FileDropZone>
                {error && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Watermark Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setWatermarkType('text')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      watermarkType === 'text'
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Text Watermark
                  </button>
                  <button
                    onClick={() => setWatermarkType('image')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      watermarkType === 'image'
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Image Watermark
                  </button>
                </div>
              </div>

              {watermarkType === 'text' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Watermark Text</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Font Size: {fontSize}px
                      </label>
                      <input
                        type="range"
                        min="16"
                        max="200"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-primary-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Font Family</label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Montserrat">Montserrat</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fontWeight === 'bold'}
                        onChange={(e) => setFontWeight(e.target.checked ? 'bold' : 'normal')}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Bold text</span>
                    </label>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color</label>
                      <label className="relative block cursor-pointer group">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-full h-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary-400 transition-all opacity-0 absolute bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        />
                        <div 
                          className="w-full h-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary-400 transition-all flex items-center justify-end px-3 relative overflow-hidden"
                          style={{ backgroundColor: color }}
                        >
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          <svg className="w-4 h-4 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8)) drop-shadow(0 0 1px rgba(0,0,0,0.9))' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload Watermark Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleWatermarkImageUpload}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Watermark Scale: {watermarkScale}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={watermarkScale}
                      onChange={(e) => setWatermarkScale(Number(e.target.value))}
                      className="w-full accent-primary-600"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Opacity: {Math.round(opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Rotation: {rotation}°
                  </label>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tileWatermark}
                  onChange={(e) => setTileWatermark(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Repeat watermark across image</span>
              </label>

              {tileWatermark ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tile Spacing: {tileSpacing}px
                  </label>
                  <input
                    type="range"
                    min="80"
                    max="400"
                    value={tileSpacing}
                    onChange={(e) => setTileSpacing(Number(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Position
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as WatermarkPosition)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="center">Center</option>
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mt-3 mb-2">
                    Margin: {margin}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoApply}
                  onChange={(e) => setAutoApply(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Auto apply changes as you edit</span>
              </label>

              {!autoApply && (
                <button
                  onClick={applyWatermark}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
                >
                  Apply Watermark
                </button>
              )}
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Preview & Export</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total operations: <span className="font-semibold text-gray-900 dark:text-gray-100">{operations}</span>
              </div>
            </div>

            {image ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto rounded-lg shadow-inner"
                    style={{ maxHeight: '500px' }}
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <button
                    onClick={downloadImage}
                    className="px-4 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={resetSettings}
                    className="px-4 py-3 bg-gray-200 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Reset Settings
                  </button>
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 justify-center md:justify-start">
                    <input
                      type="checkbox"
                      checked={autoApply}
                      onChange={(e) => setAutoApply(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span>Auto apply changes</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 bg-gray-50 dark:bg-gray-800 text-center text-gray-500 dark:text-gray-400">
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload an image to get started</p>
                <p className="text-sm">Supported formats: JPG, PNG, WebP (up to 8MB)</p>
              </div>
            )}

            {image && (
              <div className="grid sm:grid-cols-3 gap-4 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 bg-gray-50 dark:bg-gray-800">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Resolution</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {imageInfo.width || '-'} × {imageInfo.height || '-'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">File Size</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {imageInfo.size ? `${(imageInfo.size / (1024 * 1024)).toFixed(2)} MB` : '-'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Watermark Mode</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">{watermarkType}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Quick Watermark Text</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tap to insert</p>
          </div>
          <div className="grid md:grid-cols-5 sm:grid-cols-3 grid-cols-2 gap-3">
            {examples.map((example) => (
              <button
                key={example}
                onClick={() => setWatermarkText(example)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Why Add Watermarks to Images?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Watermarks protect your creative work by clearly attributing ownership and discouraging unauthorized use.
                Designers, photographers, marketers, and agencies add subtle yet visible marks to ensure that even if their images are shared online,
                the brand or author stays visible. Watermarks also help identify drafts, proofs, and preview versions.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our free watermark generator runs entirely in your browser — upload your image, customize watermark text or upload your own logo,
                adjust opacity, rotation, tiling, and instantly preview the result. No uploads to servers, no account required.
              </p>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use the Watermark Generator</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li><strong>Upload your image:</strong> JPG, PNG, and WebP up to 8MB are supported. Everything stays on your device.</li>
                <li><strong>Choose watermark type:</strong> Select text for quick branding or upload a PNG/SVG logo for image-based watermarks.</li>
                <li><strong>Customize style:</strong> Adjust font, color, size, opacity, rotation, and choose between single placement or tiled pattern.</li>
                <li><strong>Preview instantly:</strong> Enable auto apply to see changes in real time or manually re-render when needed.</li>
                <li><strong>Download:</strong> Export the final image as a PNG with the watermark baked in.</li>
              </ol>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Best Practices for Effective Watermarks</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
              <p><strong>Balance visibility and aesthetics:</strong> Use opacity between 30-50% for subtle branding that doesn’t ruin the photo.</p>
              <p><strong>Use tiling for protection:</strong> A repeated watermark pattern deters removal because it covers the entire image.</p>
              <p><strong>Include brand information:</strong> Add your website, social handle, or copyright notice for better attribution.</p>
              <p><strong>Rotate the watermark:</strong> Angled watermarks are harder to remove and are common in stock photo previews.</p>
              <p><strong>Keep margins consistent:</strong> When using corner placements, leave enough padding so the watermark isn’t cut off when cropped.</p>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📸 Photography</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Protect client galleries, portfolio previews, and social media posts with branded watermarks.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎨 Design Portfolios</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Add subtle diagonal watermarks to UI mockups or illustrations shared online.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🏢 Agencies & Marketing</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Protect drafts sent to clients or provide branded previews for approval workflows.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🛒 E-commerce</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Deter product photo theft by overlaying your shop name on catalog images.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Does this tool upload my images?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No. All watermarking happens locally in your browser using the Canvas API. Your files never leave your device.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I use my logo as a watermark?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes! Switch to the “Image Watermark” tab and upload a transparent PNG or SVG logo. Adjust scaling, opacity, rotation, and tiling.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What image formats are supported?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  You can upload JPG, PNG, or WebP up to 8MB. Downloads are exported as PNG to preserve transparency and quality.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Why use tiling?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  A tiled watermark makes it difficult for others to crop or clone out your branding. It’s commonly used for proofs and stock photos.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Image Tools" />
      )}
    </Layout>
    </>
  )
}

