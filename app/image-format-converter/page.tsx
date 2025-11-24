'use client'

import { useState, useCallback, useRef } from 'react'
import Layout from '@/components/Layout'
import FileDropZone from '@/components/FileDropZone'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type ImageFormat = 'png' | 'jpg' | 'webp' | 'svg'

interface FormatInfo {
  label: string
  mimeType: string
  extension: string
  description: string
}

const FORMATS: Record<ImageFormat, FormatInfo> = {
  png: {
    label: 'PNG',
    mimeType: 'image/png',
    extension: 'png',
    description: 'Lossless compression, supports transparency'
  },
  jpg: {
    label: 'JPG',
    mimeType: 'image/jpeg',
    extension: 'jpg',
    description: 'Lossy compression, smaller file size'
  },
  webp: {
    label: 'WebP',
    mimeType: 'image/webp',
    extension: 'webp',
    description: 'Modern format, good compression and quality'
  },
  svg: {
    label: 'SVG',
    mimeType: 'image/svg+xml',
    extension: 'svg',
    description: 'Vector format, scalable without quality loss'
  }
}

export default function ImageFormatConverterPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [convertedImage, setConvertedImage] = useState<string | null>(null)
  const [originalFormat, setOriginalFormat] = useState<ImageFormat | null>(null)
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('png')
  const [originalSize, setOriginalSize] = useState(0)
  const [convertedSize, setConvertedSize] = useState(0)
  const [quality, setQuality] = useState(90)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalConverted, setTotalConverted] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const detectFormat = useCallback((file: File): ImageFormat | null => {
    const type = file.type.toLowerCase()
    const name = file.name.toLowerCase()
    
    if (type.includes('png') || name.endsWith('.png')) return 'png'
    if (type.includes('jpeg') || type.includes('jpg') || name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'jpg'
    if (type.includes('webp') || name.endsWith('.webp')) return 'webp'
    if (type.includes('svg') || name.endsWith('.svg')) return 'svg'
    
    return null
  }, [])

  const loadImage = useCallback((file: File) => {
    const detectedFormat = detectFormat(file)
    if (!detectedFormat) {
      setError('Unsupported image format. Please use PNG, JPG, WebP, or SVG.')
      return
    }

    setError('')
    setOriginalFile(file)
    setOriginalSize(file.size)
    setOriginalFormat(detectedFormat)
    setConvertedImage(null)
    setConvertedSize(0)
    
    // Set default target format (different from original)
    const availableFormats: ImageFormat[] = ['png', 'jpg', 'webp', 'svg']
    const defaultTarget = availableFormats.find(f => f !== detectedFormat) || 'png'
    setTargetFormat(defaultTarget)

    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string)
    }
    reader.onerror = () => {
      setError('Failed to read file')
    }
    reader.readAsDataURL(file)
  }, [detectFormat])

  const convertToRaster = useCallback(async (
    imageUrl: string,
    format: 'png' | 'jpg' | 'webp',
    quality: number
  ): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) {
          resolve(null)
          return
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }

        canvas.width = img.width
        canvas.height = img.height

        // Fill with white background for JPG (no transparency support)
        if (format === 'jpg') {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        ctx.drawImage(img, 0, 0)

        canvas.toBlob(
          (blob) => {
            resolve(blob)
          },
          FORMATS[format].mimeType,
          format === 'jpg' || format === 'webp' ? quality / 100 : undefined
        )
      }

      img.onerror = () => {
        resolve(null)
      }

      img.src = imageUrl
    })
  }, [])

  const convertRasterToSVG = useCallback((imageUrl: string, width: number, height: number): string => {
    // Create SVG wrapper with embedded base64 image
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image width="${width}" height="${height}" xlink:href="${imageUrl}"/>
</svg>`
  }, [])

  const sanitizeSVG = useCallback((svgString: string): string => {
    // Remove script tags and event handlers for security
    let sanitized = svgString
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
    
    // Ensure SVG has proper namespace
    if (!sanitized.includes('xmlns=')) {
      sanitized = sanitized.replace(
        /<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      )
    }
    
    return sanitized
  }, [])

  const convertSVGToRaster = useCallback(async (
    svgString: string,
    format: 'png' | 'jpg' | 'webp',
    quality: number
  ): Promise<Blob | null> => {
    return new Promise((resolve) => {
      // Sanitize SVG for security
      const sanitizedSVG = sanitizeSVG(svgString)
      
      const img = new Image()
      const svgBlob = new Blob([sanitizedSVG], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      // Set timeout to prevent hanging on invalid SVG
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url)
        resolve(null)
      }, 10000) // 10 second timeout

      img.onload = () => {
        clearTimeout(timeout)
        const canvas = canvasRef.current
        if (!canvas) {
          URL.revokeObjectURL(url)
          resolve(null)
          return
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(url)
          resolve(null)
          return
        }

        // Handle zero or invalid dimensions
        if (img.width === 0 || img.height === 0) {
          URL.revokeObjectURL(url)
          resolve(null)
          return
        }

        canvas.width = img.width
        canvas.height = img.height

        // Fill with white background for JPG
        if (format === 'jpg') {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        ctx.drawImage(img, 0, 0)

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url)
            resolve(blob)
          },
          FORMATS[format].mimeType,
          format === 'jpg' || format === 'webp' ? quality / 100 : undefined
        )
      }

      img.onerror = () => {
        clearTimeout(timeout)
        URL.revokeObjectURL(url)
        resolve(null)
      }

      img.src = url
    })
  }, [sanitizeSVG])

  const handleConvert = useCallback(async () => {
    if (!originalImage || !originalFormat) {
      setError('Please select an image first')
      return
    }

    if (originalFormat === targetFormat) {
      setError('Source and target formats are the same. Please select a different target format.')
      return
    }

    setLoading(true)
    setError('')
    setConvertedImage(null)
    setConvertedSize(0)

    try {
      let result: Blob | string | null = null

      // Case 1: Raster to Raster (PNG/JPG/WebP ↔ PNG/JPG/WebP)
      if (originalFormat !== 'svg' && targetFormat !== 'svg') {
        result = await convertToRaster(originalImage, targetFormat, quality)
        if (result) {
          const url = URL.createObjectURL(result)
          setConvertedImage(url)
          setConvertedSize(result.size)
          setTotalConverted(prev => prev + 1)
        } else {
          setError('Failed to convert image')
        }
      }
      // Case 2: Raster to SVG (PNG/JPG/WebP → SVG)
      else if (originalFormat !== 'svg' && targetFormat === 'svg') {
        const img = new Image()
        img.onload = () => {
          const svgString = convertRasterToSVG(originalImage, img.width, img.height)
          const blob = new Blob([svgString], { type: 'image/svg+xml' })
          const url = URL.createObjectURL(blob)
          setConvertedImage(url)
          setConvertedSize(blob.size)
          setTotalConverted(prev => prev + 1)
        }
        img.onerror = () => {
          setError('Failed to load image for SVG conversion')
        }
        img.src = originalImage
      }
      // Case 3: SVG to Raster (SVG → PNG/JPG/WebP)
      else if (originalFormat === 'svg' && targetFormat !== 'svg') {
        // Read SVG as text - handle both data URL and blob URL
        let svgText: string
        try {
          if (originalImage.startsWith('data:')) {
            // Extract SVG from data URL
            const base64Match = originalImage.match(/data:image\/svg\+xml[^,]+,(.+)/)
            if (base64Match) {
              try {
                svgText = decodeURIComponent(atob(base64Match[1]))
              } catch {
                // Try without base64 decoding (already URL-encoded)
                svgText = decodeURIComponent(base64Match[1])
              }
            } else {
              // Try URL-encoded data URL
              const urlMatch = originalImage.match(/data:image\/svg\+xml[^;]*;charset=utf-8,(.+)/)
              if (urlMatch) {
                svgText = decodeURIComponent(urlMatch[1])
              } else {
                // Try plain data URL
                const plainMatch = originalImage.match(/data:image\/svg\+xml,(.+)/)
                if (plainMatch) {
                  svgText = decodeURIComponent(plainMatch[1])
                } else {
                  throw new Error('Failed to parse SVG data URL')
                }
              }
            }
          } else {
            // Fetch from blob URL or regular URL
            const response = await fetch(originalImage)
            if (!response.ok) {
              throw new Error('Failed to fetch SVG file')
            }
            svgText = await response.text()
          }
          
          if (!svgText || svgText.trim().length === 0) {
            throw new Error('SVG content is empty')
          }
          
          result = await convertSVGToRaster(svgText, targetFormat, quality)
          if (result) {
            const url = URL.createObjectURL(result)
            setConvertedImage(url)
            setConvertedSize(result.size)
            setTotalConverted(prev => prev + 1)
          } else {
            setError('Failed to convert SVG to raster format. The SVG may contain unsupported features or external resources.')
          }
        } catch (err) {
          setError(`SVG conversion error: ${(err as Error).message}`)
        }
      }

      setLoading(false)
    } catch (err) {
      setError(`Conversion error: ${(err as Error).message}`)
      setLoading(false)
    }
  }, [originalImage, originalFormat, targetFormat, quality, convertToRaster, convertRasterToSVG, convertSVGToRaster])

  const downloadImage = useCallback(() => {
    if (!convertedImage || !originalFile) return

    const format = FORMATS[targetFormat]
    const originalName = originalFile.name.replace(/\.[^/.]+$/, '')
    const filename = `${originalName}.${format.extension}`

    const link = document.createElement('a')
    link.href = convertedImage
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [convertedImage, targetFormat, originalFile])

  const copyToClipboard = useCallback(async () => {
    if (!convertedImage) return

    try {
      if (targetFormat === 'svg') {
        // For SVG, copy as text
        const response = await fetch(convertedImage)
        const text = await response.text()
        await navigator.clipboard.writeText(text)
      } else {
        // For raster images, copy as image
        const response = await fetch(convertedImage)
        const blob = await response.blob()
        await navigator.clipboard.write([
          new ClipboardItem({ [FORMATS[targetFormat].mimeType]: blob })
        ])
      }
    } catch (err) {
      // Fallback: try copying as data URL
      try {
        await navigator.clipboard.writeText(convertedImage)
      } catch (e) {
        setError('Failed to copy to clipboard')
      }
    }
  }, [convertedImage, targetFormat])

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }, [])

  // SEO data
  const toolPath = '/image-format-converter'
  const toolName = 'Image Format Converter'
  const category = 'image'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  const faqSchema = generateFAQSchema([
    {
      question: 'What image formats can I convert?',
      answer: 'You can convert between PNG, JPG, WebP, and SVG formats. The tool supports converting from any of these formats to any other format.'
    },
    {
      question: 'Is the conversion done in my browser?',
      answer: 'Yes, all conversions are performed entirely in your browser. Your images never leave your device, ensuring complete privacy and security.'
    },
    {
      question: 'Can I convert SVG to PNG or JPG?',
      answer: 'Yes, you can convert SVG files to PNG, JPG, or WebP formats. The SVG will be rendered at its original size.'
    },
    {
      question: 'What quality settings are available?',
      answer: 'For JPG and WebP formats, you can adjust the quality from 1 to 100. PNG format always uses lossless compression and doesn\'t support quality settings.'
    },
    {
      question: 'How do I convert PNG to JPG?',
      answer: 'Simply upload your PNG image, select JPG as the target format, adjust quality if needed, and click "Convert". Then download the converted image.'
    }
  ])

  const howToSchema = generateHowToSchema(
    'Convert Image Format',
    'Learn how to convert images between different formats using our free online tool',
    [
      {
        name: 'Upload your image',
        text: 'Click the upload area or drag and drop your image file (PNG, JPG, WebP, or SVG)',
        image: '/og-image.jpg'
      },
      {
        name: 'Select target format',
        text: 'Choose the format you want to convert to: PNG, JPG, WebP, or SVG',
        image: '/og-image.jpg'
      },
      {
        name: 'Adjust settings',
        text: 'For JPG and WebP, adjust the quality slider (1-100). PNG always uses lossless compression.',
        image: '/og-image.jpg'
      },
      {
        name: 'Convert and download',
        text: 'Click "Convert" to process your image, then download the converted file',
        image: '/og-image.jpg'
      }
    ]
  )

  const softwareSchema = generateSoftwareApplicationSchema(
    'Image Format Converter',
    'Free online tool to convert images between PNG, JPG, WebP, and SVG formats',
    'https://prylad.pro/image-format-converter',
    'ImageConverterApplication',
    'Web Browser'
  )

  return (
    <Layout
      title="🖼️ Image Format Converter"
      description="Convert images between PNG, JPG, WebP, and SVG formats online for free. Fast, secure, and works entirely in your browser."
      breadcrumbs={breadcrumbs}
    >
      <StructuredData data={[faqSchema, howToSchema, softwareSchema]} />
      
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Upload Image
              </label>
              <FileDropZone
                onFileSelect={loadImage}
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"
                maxSize={10 * 1024 * 1024} // 10MB
                disabled={loading}
              >
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
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
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, WebP, SVG (max 10MB)
                  </p>
                </div>
              </FileDropZone>
            </div>

            {/* Original Image Info */}
            {originalImage && originalFormat && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Original Image
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-blue-800 dark:text-blue-200">
                      <div>
                        <span className="font-medium">Format:</span> {FORMATS[originalFormat].label}
                      </div>
                      <div>
                        <span className="font-medium">Size:</span> {formatFileSize(originalSize)}
                      </div>
                    </div>
                  </div>
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-300 dark:border-blue-700">
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Conversion Settings */}
            {originalImage && originalFormat && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Convert To
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['png', 'jpg', 'webp', 'svg'] as ImageFormat[]).map((format) => {
                      const formatInfo = FORMATS[format]
                      const isOriginal = format === originalFormat
                      const isSelected = format === targetFormat
                      
                      return (
                        <button
                          key={format}
                          onClick={() => !isOriginal && setTargetFormat(format)}
                          disabled={isOriginal || loading}
                          className={`
                            p-4 rounded-lg border-2 transition-all text-left
                            ${isOriginal
                              ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                              : isSelected
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {formatInfo.label}
                            {isOriginal && <span className="text-xs text-gray-500 ml-1">(current)</span>}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {formatInfo.description}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Quality Slider (for JPG and WebP) */}
                {(targetFormat === 'jpg' || targetFormat === 'webp') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Quality: {quality}%
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Lower size</span>
                      <span>Higher quality</span>
                    </div>
                  </div>
                )}

                {/* Convert Button */}
                <button
                  onClick={handleConvert}
                  disabled={loading || originalFormat === targetFormat}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Converting...' : 'Convert Image'}
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Converted Image */}
            {convertedImage && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                        Converted Image ({FORMATS[targetFormat].label})
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-green-800 dark:text-green-200 mb-3">
                        <div>
                          <span className="font-medium">Format:</span> {FORMATS[targetFormat].label}
                        </div>
                        <div>
                          <span className="font-medium">Size:</span> {formatFileSize(convertedSize)}
                        </div>
                        {originalSize > 0 && (
                          <div className="col-span-2">
                            <span className="font-medium">Size change:</span>{' '}
                            {convertedSize > originalSize
                              ? `+${formatFileSize(convertedSize - originalSize)} (+${(((convertedSize / originalSize) - 1) * 100).toFixed(1)}%)`
                              : `-${formatFileSize(originalSize - convertedSize)} (-${((1 - convertedSize / originalSize) * 100).toFixed(1)}%)`
                            }
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={downloadImage}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                        >
                          Download
                        </button>
                        <button
                          onClick={copyToClipboard}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-green-300 dark:border-green-700">
                      <img
                        src={convertedImage}
                        alt="Converted"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden Canvas for Conversion */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Stats */}
        {totalConverted > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total images converted: <span className="font-semibold text-primary-600 dark:text-primary-400">{totalConverted}</span>
            </p>
          </div>
        )}
      </div>

      {/* Related Tools */}
      <RelatedTools tools={relatedTools} />

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is Image Format Conversion?</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Image format conversion is the process of changing an image file from one format to another. Different image formats have different characteristics:
          </p>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>PNG:</strong> Lossless compression, supports transparency, best for graphics and images with text</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>JPG:</strong> Lossy compression, smaller file sizes, best for photographs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>WebP:</strong> Modern format with excellent compression, supports both lossy and lossless modes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
              <span><strong>SVG:</strong> Vector format, scalable without quality loss, best for logos and icons</span>
            </li>
          </ul>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Convert Image Formats</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>Upload your image by clicking the upload area or dragging and dropping your file</li>
            <li>Select the target format you want to convert to (PNG, JPG, WebP, or SVG)</li>
            <li>For JPG and WebP formats, adjust the quality slider to balance file size and image quality</li>
            <li>Click &quot;Convert Image&quot; to process your file</li>
            <li>Download the converted image or copy it to your clipboard</li>
          </ol>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">When to Use Each Format</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Use PNG for:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Images with transparency</li>
                <li>Graphics and illustrations</li>
                <li>Screenshots with text</li>
                <li>When you need lossless quality</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Use JPG for:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Photographs</li>
                <li>When file size is important</li>
                <li>Images without transparency</li>
                <li>Web images where small size matters</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Use WebP for:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Modern web applications</li>
                <li>When you need good compression</li>
                <li>Images for websites</li>
                <li>When browser support allows</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Use SVG for:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Logos and icons</li>
                <li>Vector graphics</li>
                <li>Scalable images</li>
                <li>Simple illustrations</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Privacy and Security</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            All image conversions are performed entirely in your browser. Your images never leave your device, ensuring complete privacy and security. No data is sent to any server, and no files are stored anywhere.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            This makes our tool perfect for converting sensitive images, personal photos, or any files you want to keep private.
          </p>
        </section>
      </div>
    </Layout>
  )
}

