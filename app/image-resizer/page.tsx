'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import FileDropZone from '@/components/FileDropZone'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type ResizeMode = 'custom' | 'percentage' | 'preset'
type AspectRatioMode = 'maintain' | 'free'

interface PresetSize {
  name: string
  width: number
  height: number
}

const PRESET_SIZES: PresetSize[] = [
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Cover', width: 1200, height: 630 },
  { name: 'Twitter Header', width: 1500, height: 500 },
  { name: 'LinkedIn Post', width: 1200, height: 627 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'HD (720p)', width: 1280, height: 720 },
  { name: 'Full HD (1080p)', width: 1920, height: 1080 },
  { name: '4K (2160p)', width: 3840, height: 2160 },
  { name: 'Square 512', width: 512, height: 512 },
  { name: 'Square 1024', width: 1024, height: 1024 },
  { name: 'Icon 256', width: 256, height: 256 },
]

export default function ImageResizerPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [originalWidth, setOriginalWidth] = useState(0)
  const [originalHeight, setOriginalHeight] = useState(0)
  const [originalSize, setOriginalSize] = useState(0)
  const [processedSize, setProcessedSize] = useState(0)
  
  // Resize settings
  const [resizeMode, setResizeMode] = useState<ResizeMode>('custom')
  const [aspectRatioMode, setAspectRatioMode] = useState<AspectRatioMode>('maintain')
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const [percentage, setPercentage] = useState(100)
  const [selectedPreset, setSelectedPreset] = useState<PresetSize | null>(null)
  
  // Transform settings
  const [rotation, setRotation] = useState(0)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  
  // Compression settings
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg')
  const [quality, setQuality] = useState(85)
  const [enableCompression, setEnableCompression] = useState(true)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const loadImage = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setOriginalWidth(img.width)
        setOriginalHeight(img.height)
        setOriginalSize(file.size)
        setCustomWidth(img.width.toString())
        setCustomHeight(img.height.toString())
        setOriginalImage(e.target?.result as string)
        setOriginalFile(file)
        setProcessedImage(null)
        setError('')
        // Reset transforms
        setRotation(0)
        setFlipHorizontal(false)
        setFlipVertical(false)
        setPercentage(100)
        setSelectedPreset(null)
        setResizeMode('custom')
      }
      img.onerror = () => {
        setError('Failed to load image')
      }
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      setError('Failed to read file')
    }
    reader.readAsDataURL(file)
  }, [])

  const processImage = useCallback(async (
    imageUrl: string,
    targetWidth: number,
    targetHeight: number,
    rotationAngle: number,
    flipH: boolean,
    flipV: boolean,
    outputFormat: 'jpeg' | 'png' | 'webp',
    outputQuality: number
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) {
          reject(new Error('Canvas not available'))
          return
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Calculate dimensions after rotation
        let finalWidth = targetWidth
        let finalHeight = targetHeight
        
        if (rotationAngle === 90 || rotationAngle === 270) {
          // Swap dimensions for 90/270 degree rotations
          const temp = finalWidth
          finalWidth = finalHeight
          finalHeight = temp
        }

        // Set canvas size
        canvas.width = finalWidth
        canvas.height = finalHeight

        // Use high-quality image rendering
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Save context
        ctx.save()

        // Move to center of canvas
        ctx.translate(finalWidth / 2, finalHeight / 2)

        // Apply rotation
        ctx.rotate((rotationAngle * Math.PI) / 180)

        // Apply flips
        const scaleX = flipH ? -1 : 1
        const scaleY = flipV ? -1 : 1
        ctx.scale(scaleX, scaleY)

        // Draw image centered
        ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight)

        // Restore context
        ctx.restore()

        // Convert to blob
        const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : outputFormat === 'png' ? 'image/png' : 'image/webp'
        const qualityValue = outputFormat === 'png' ? undefined : outputQuality / 100

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'))
              return
            }
            const url = URL.createObjectURL(blob)
            resolve(url)
          },
          mimeType,
          qualityValue
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imageUrl
    })
  }, [])

  const calculateDimensions = useCallback((): { width: number; height: number } | null => {
    if (!originalWidth || !originalHeight) return null

    if (resizeMode === 'percentage') {
      const width = Math.round(originalWidth * (percentage / 100))
      const height = Math.round(originalHeight * (percentage / 100))
      return { width, height }
    } else if (resizeMode === 'preset' && selectedPreset) {
      if (aspectRatioMode === 'maintain') {
        const aspectRatio = originalWidth / originalHeight
        const presetAspectRatio = selectedPreset.width / selectedPreset.height

        let width: number
        let height: number

        if (aspectRatio > presetAspectRatio) {
          width = selectedPreset.width
          height = Math.round(selectedPreset.width / aspectRatio)
        } else {
          height = selectedPreset.height
          width = Math.round(selectedPreset.height * aspectRatio)
        }

        return { width, height }
      } else {
        return { width: selectedPreset.width, height: selectedPreset.height }
      }
    } else if (resizeMode === 'custom') {
      const width = parseInt(customWidth) || 0
      const height = parseInt(customHeight) || 0

      if (width <= 0 || height <= 0) return null

      if (aspectRatioMode === 'maintain') {
        const aspectRatio = originalWidth / originalHeight
        if (width / height > aspectRatio) {
          return { width, height: Math.round(width / aspectRatio) }
        } else {
          return { width: Math.round(height * aspectRatio), height }
        }
      } else {
        return { width, height }
      }
    }

    return null
  }, [resizeMode, percentage, selectedPreset, customWidth, customHeight, aspectRatioMode, originalWidth, originalHeight])

  const applyProcessing = useCallback(async () => {
    if (!originalImage) return

    const dimensions = calculateDimensions()
    if (!dimensions) {
      // If no valid dimensions, use original dimensions
      const dims = { width: originalWidth, height: originalHeight }
      if (dims.width <= 0 || dims.height <= 0) return
      
      setLoading(true)
      setError('')
      
      try {
        const processedUrl = await processImage(
          originalImage,
          dims.width,
          dims.height,
          rotation,
          flipHorizontal,
          flipVertical,
          format,
          enableCompression ? quality : 100
        )
        setProcessedImage(processedUrl)
        
        // Get processed size
        const response = await fetch(processedUrl)
        const blob = await response.blob()
        setProcessedSize(blob.size)
      } catch (err) {
        setError((err as Error).message || 'Failed to process image')
      } finally {
        setLoading(false)
      }
      return
    }

    setLoading(true)
    setError('')

    try {
      const processedUrl = await processImage(
        originalImage,
        dimensions.width,
        dimensions.height,
        rotation,
        flipHorizontal,
        flipVertical,
        format,
        enableCompression ? quality : 100
      )
      setProcessedImage(processedUrl)
      
      // Get processed size
      const response = await fetch(processedUrl)
      const blob = await response.blob()
      setProcessedSize(blob.size)
    } catch (err) {
      setError((err as Error).message || 'Failed to process image')
    } finally {
      setLoading(false)
    }
  }, [originalImage, calculateDimensions, processImage, rotation, flipHorizontal, flipVertical, format, quality, enableCompression, originalWidth, originalHeight])

  // Auto-apply changes
  useEffect(() => {
    if (originalImage) {
      const timeoutId = setTimeout(() => {
        applyProcessing()
      }, 300) // Debounce for 300ms
      
      return () => clearTimeout(timeoutId)
    }
  }, [originalImage, resizeMode, customWidth, customHeight, percentage, selectedPreset, aspectRatioMode, rotation, flipHorizontal, flipVertical, format, quality, enableCompression, applyProcessing])

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Image size must be less than 50MB')
      return
    }

    loadImage(file)
  }, [loadImage])

  const downloadImage = () => {
    if (!processedImage) return

    const a = document.createElement('a')
    a.href = processedImage
    a.download = `processed.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const rotateBy = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360)
  }

  const resetAll = () => {
    setRotation(0)
    setFlipHorizontal(false)
    setFlipVertical(false)
    setPercentage(100)
    setSelectedPreset(null)
    setResizeMode('custom')
    if (originalWidth && originalHeight) {
      setCustomWidth(originalWidth.toString())
      setCustomHeight(originalHeight.toString())
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const handleWidthChange = (value: string) => {
    setCustomWidth(value)
    if (aspectRatioMode === 'maintain' && originalWidth && originalHeight) {
      const width = parseInt(value) || 0
      if (width > 0) {
        const aspectRatio = originalWidth / originalHeight
        setCustomHeight(Math.round(width / aspectRatio).toString())
      }
    }
  }

  const handleHeightChange = (value: string) => {
    setCustomHeight(value)
    if (aspectRatioMode === 'maintain' && originalWidth && originalHeight) {
      const height = parseInt(value) || 0
      if (height > 0) {
        const aspectRatio = originalWidth / originalHeight
        setCustomWidth(Math.round(height * aspectRatio).toString())
      }
    }
  }

  const dimensions = calculateDimensions()
  const compressionRatio = originalSize > 0 && processedSize > 0
    ? ((1 - processedSize / originalSize) * 100).toFixed(1)
    : '0'

  // SEO data
  const toolPath = '/image-resizer'
  const toolName = 'Image Editor'
  const category = 'image'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "How do I resize an image?",
      answer: "Upload your image, choose resize mode (custom dimensions, percentage, or preset), set width and height, and the image is resized automatically. You can maintain aspect ratio or set free dimensions."
    },
    {
      question: "What image formats are supported?",
      answer: "The editor supports JPEG, PNG, and WebP formats. You can upload images in any of these formats and export in your preferred format with quality control."
    },
    {
      question: "Can I compress images to reduce file size?",
      answer: "Yes! Enable compression and adjust the quality slider to reduce file size. Lower quality settings result in smaller files but may reduce image quality. You can preview the result before downloading."
    },
    {
      question: "How do I rotate or flip an image?",
      answer: "Use the rotation slider to rotate the image by any angle (0-360 degrees). Use flip buttons to flip the image horizontally or vertically. All transformations are applied in real-time."
    },
    {
      question: "What preset sizes are available?",
      answer: "The editor includes presets for social media (Instagram, Facebook, Twitter, LinkedIn, YouTube), video resolutions (HD, Full HD, 4K), and common sizes (squares, icons). Click on any preset to apply it instantly."
    },
    {
      question: "Is the image editor free and secure?",
      answer: "Yes, completely free and secure! All image processing happens entirely in your browser. We never see, store, transmit, or have access to your images. Your privacy is completely protected."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Upload Image",
      text: "Upload your image by dragging and dropping it or clicking to select. Supported formats: JPEG, PNG, WebP. The image loads instantly for editing."
    },
    {
      name: "Choose Resize Mode",
      text: "Select resize mode: Custom (set exact dimensions), Percentage (scale by percentage), or Preset (choose from social media and standard sizes)."
    },
    {
      name: "Set Dimensions",
      text: "Enter width and height values, or select a preset size. Choose whether to maintain aspect ratio or allow free dimensions. The preview updates in real-time."
    },
    {
      name: "Apply Transformations",
      text: "Rotate the image by any angle, flip horizontally or vertically. Enable compression and adjust quality to reduce file size if needed."
    },
    {
      name: "Download Result",
      text: "Preview the edited image, choose output format (JPEG, PNG, WebP), and download. The processed image is ready to use."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Resize, Rotate, Flip, and Compress Images",
      "Learn how to edit images online: resize, rotate, flip, and compress images using our free online image editor tool.",
      howToSteps,
      "PT3M"
    ),
    generateSoftwareApplicationSchema(
      "Image Editor",
      "Free online image editor. Resize, rotate, flip, and compress images. Support for JPEG, PNG, WebP. Preset sizes for social media. Real-time preview and quality control.",
      "https://prylad.pro/image-resizer",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🖼️ Image Editor - Resize, Compress, Rotate & Flip"
        description="Complete image editor: resize, compress, rotate, and flip images online for free. Change image dimensions, reduce file size, rotate by any angle, and flip horizontally/vertically. Support for JPEG, PNG, and WebP formats. No registration required."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* File Upload */}
            {!originalImage && (
              <FileDropZone
                onFileSelect={handleFileSelect}
                accept="image/*"
                maxSize={50 * 1024 * 1024}
              >
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Upload an image to edit
                  </p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Drag and drop or click to select
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    Max size: 50 MB
                  </p>
                </div>
              </FileDropZone>
            )}

            {originalImage && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Original Image */}
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Original Image</h3>
                      <button
                        onClick={() => {
                          setOriginalImage(null)
                          setProcessedImage(null)
                          setOriginalFile(null)
                          setError('')
                          resetAll()
                        }}
                        className="px-3 py-1.5 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium transition-colors"
                      >
                        Change Image
                      </button>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                      {originalWidth} × {originalHeight} px • {formatFileSize(originalSize)}
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded p-2 border border-blue-200 dark:border-blue-700">
                      <img
                        src={originalImage}
                        alt="Original"
                        className="max-w-full max-h-64 object-contain mx-auto"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Processed Image */}
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">Processed Image</h3>
                      {processedSize > 0 && originalSize > 0 && (
                        <span className={`text-xs font-medium ${
                          processedSize < originalSize 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {formatFileSize(processedSize)}
                          {processedSize < originalSize && ` (-${compressionRatio}%)`}
                        </span>
                      )}
                    </div>
                    {dimensions && (
                      <p className="text-xs text-green-700 dark:text-green-300 mb-2">
                        {dimensions.width} × {dimensions.height} px
                        {rotation !== 0 && ` • Rotated ${rotation}°`}
                        {flipHorizontal && ' • H-flipped'}
                        {flipVertical && ' • V-flipped'}
                      </p>
                    )}
                    <div className="bg-white dark:bg-gray-800 rounded p-2 border border-green-200 dark:border-green-700 relative">
                      {loading && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                      {processedImage ? (
                        <img
                          src={processedImage}
                          alt="Processed"
                          className="max-w-full max-h-64 object-contain mx-auto"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
                          <p className="text-sm">Processing...</p>
                        </div>
                      )}
                    </div>
                    {processedImage && !loading && (
                      <button
                        onClick={downloadImage}
                        className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                      >
                        Download Processed Image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            {originalImage && (
              <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* Resize Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Resize</h3>
                    <button
                      onClick={resetAll}
                      className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                      Reset All
                    </button>
                  </div>
                  
                  {/* Resize Mode Selection */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setResizeMode('custom')}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        resizeMode === 'custom'
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Custom
                    </button>
                    <button
                      onClick={() => setResizeMode('percentage')}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        resizeMode === 'percentage'
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Percentage
                    </button>
                    <button
                      onClick={() => setResizeMode('preset')}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        resizeMode === 'preset'
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Preset
                    </button>
                  </div>

                  {/* Custom Size */}
                  {resizeMode === 'custom' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="maintainAspect"
                          checked={aspectRatioMode === 'maintain'}
                          onChange={(e) => setAspectRatioMode(e.target.checked ? 'maintain' : 'free')}
                          className="w-4 h-4 accent-primary-600"
                        />
                        <label htmlFor="maintainAspect" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                          Maintain aspect ratio
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Width (px)
                          </label>
                          <input
                            type="number"
                            value={customWidth}
                            onChange={(e) => handleWidthChange(e.target.value)}
                            min="1"
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Height (px)
                          </label>
                          <input
                            type="number"
                            value={customHeight}
                            onChange={(e) => handleHeightChange(e.target.value)}
                            min="1"
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Percentage */}
                  {resizeMode === 'percentage' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Resize to: {percentage}%
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="500"
                        value={percentage}
                        onChange={(e) => setPercentage(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>1%</span>
                        <span>500%</span>
                      </div>
                      {dimensions && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          New size: {dimensions.width} × {dimensions.height} px
                        </p>
                      )}
                    </div>
                  )}

                  {/* Preset */}
                  {resizeMode === 'preset' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="presetMaintainAspect"
                          checked={aspectRatioMode === 'maintain'}
                          onChange={(e) => setAspectRatioMode(e.target.checked ? 'maintain' : 'free')}
                          className="w-4 h-4 accent-primary-600"
                        />
                        <label htmlFor="presetMaintainAspect" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                          Maintain aspect ratio (fit within preset)
                        </label>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Select Preset:
                        </label>
                        <select
                          value={selectedPreset ? `${selectedPreset.width}x${selectedPreset.height}` : ''}
                          onChange={(e) => {
                            const [width, height] = e.target.value.split('x').map(Number)
                            const preset = PRESET_SIZES.find(p => p.width === width && p.height === height)
                            setSelectedPreset(preset || null)
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">Choose a preset...</option>
                          {PRESET_SIZES.map((preset) => (
                            <option key={`${preset.width}x${preset.height}`} value={`${preset.width}x${preset.height}`}>
                              {preset.name} ({preset.width} × {preset.height})
                            </option>
                          ))}
                        </select>
                      </div>
                      {selectedPreset && dimensions && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {aspectRatioMode === 'maintain' ? 'Fitted size' : 'Target size'}: {dimensions.width} × {dimensions.height} px
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Transform Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transform</h3>
                  
                  {/* Rotation */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rotation: {rotation}°
                    </label>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <button
                        onClick={() => rotateBy(-90)}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        ↺ 90°
                      </button>
                      <button
                        onClick={() => rotateBy(90)}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        ↻ 90°
                      </button>
                      <button
                        onClick={() => rotateBy(180)}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        ↻ 180°
                      </button>
                      <button
                        onClick={() => setRotation(0)}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>

                  {/* Flip */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Flip
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setFlipHorizontal(!flipHorizontal)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          flipHorizontal
                            ? 'bg-primary-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        ↔ Flip Horizontal
                      </button>
                      <button
                        onClick={() => setFlipVertical(!flipVertical)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          flipVertical
                            ? 'bg-primary-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        ↕ Flip Vertical
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compression & Format Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Output Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Format
                      </label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      >
                        <option value="jpeg">JPEG</option>
                        <option value="png">PNG</option>
                        <option value="webp">WebP</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          id="enableCompression"
                          checked={enableCompression}
                          onChange={(e) => setEnableCompression(e.target.checked)}
                          className="w-4 h-4 accent-primary-600"
                        />
                        <label htmlFor="enableCompression" className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                          Enable Compression
                        </label>
                      </div>
                      {enableCompression && format !== 'png' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Quality: {quality}%
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={quality}
                            onChange={(e) => setQuality(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>Smaller</span>
                            <span>Larger</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200 font-medium text-sm">Error</p>
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Complete Image Editor</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Our all-in-one image editor combines resizing, rotation, flipping, and compression in a single, 
            easy-to-use interface. Upload your image once and apply all transformations with live preview.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            All changes are applied automatically as you adjust settings, so you can see the results instantly 
            without clicking any buttons. Compare file sizes and dimensions side-by-side before downloading.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Features</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Resize</h3>
              <p className="text-sm">Resize images using custom dimensions, percentage scaling, or preset sizes for social media platforms. Maintain aspect ratio or set free dimensions.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Transform</h3>
              <p className="text-sm">Rotate images by any angle (0-360°) or use quick rotation buttons. Flip images horizontally or vertically.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Compress</h3>
              <p className="text-sm">Reduce file size with quality control. Choose between JPEG, PNG, or WebP formats. See compression ratio and file size savings in real-time.</p>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Best Practices</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Workflow:</strong> Resize first, then apply rotations/flips, and finally adjust compression to balance quality and file size.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Quality Settings:</strong> Use 80-90% quality for web images, 70-80% for thumbnails, and 90-100% for print or high-quality displays.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Format Selection:</strong> JPEG for photos, PNG for transparency, WebP for modern web optimization with better compression.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Live Preview:</strong> All changes are applied automatically. Watch the file size and dimensions update in real-time as you adjust settings.</span>
            </li>
          </ul>
        </section>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Image Tools" />
      )}
    </Layout>
    </>
  )
}
