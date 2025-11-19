'use client'

import { useState, useCallback, useRef } from 'react'
import Layout from '@/components/Layout'
import FileDropZone from '@/components/FileDropZone'

export default function ImageCompressorPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [compressedImage, setCompressedImage] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [quality, setQuality] = useState(80)
  const [format, setFormat] = useState<'jpeg' | 'webp'>('jpeg')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const compressImage = useCallback((file: File, quality: number, outputFormat: 'jpeg' | 'webp') => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to create canvas context'))
            return
          }

          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : 'image/webp'
          const outputQuality = quality / 100

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'))
                return
              }
              const url = URL.createObjectURL(blob)
              resolve(url)
            },
            mimeType,
            outputQuality
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }, [])

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return
    }

    setLoading(true)
    setOriginalSize(file.size)
    setOriginalImage(URL.createObjectURL(file))

    try {
      const compressedUrl = await compressImage(file, quality, format)
      setCompressedImage(compressedUrl)
      
      // Get compressed size
      const response = await fetch(compressedUrl)
      const blob = await response.blob()
      setCompressedSize(blob.size)
      
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }, [quality, format, compressImage, ])

  const handleRecompress = useCallback(async () => {
    if (!originalImage) return
    
    setLoading(true)
    try {
      const response = await fetch(originalImage)
      const blob = await response.blob()
      const file = new File([blob], 'image', { type: blob.type })
      
      const compressedUrl = await compressImage(file, quality, format)
      setCompressedImage(compressedUrl)
      
      const newResponse = await fetch(compressedUrl)
      const newBlob = await newResponse.blob()
      setCompressedSize(newBlob.size)
      
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }, [originalImage, quality, format, compressImage, ])

  const downloadImage = () => {
    if (!compressedImage) return
    
    const a = document.createElement('a')
    a.href = compressedImage
    a.download = `compressed.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const compressionRatio = originalSize > 0 
    ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
    : '0'

  return (
    <Layout
      title="🗜️ Image Compressor"
      description="Compress images online for free. Reduce file size of JPEG, PNG, and WebP images with quality control."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => {
                    setQuality(parseInt(e.target.value))
                    if (originalImage) {
                      handleRecompress()
                    }
                  }}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Smaller</span>
                  <span>Larger</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Output Format
                </label>
                <select
                  value={format}
                  onChange={(e) => {
                    setFormat(e.target.value as 'jpeg' | 'webp')
                    if (originalImage) {
                      handleRecompress()
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="jpeg">JPEG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
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

            {/* Comparison */}
            {originalImage && compressedImage && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Original
                    </label>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(originalSize)}
                    </span>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                </div>

                {/* Compressed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Compressed
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatFileSize(compressedSize)}
                      </span>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        -{compressionRatio}%
                      </span>
                    </div>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden relative">
                    {loading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <div className="text-white font-medium">Compressing...</div>
                      </div>
                    )}
                    <img
                      src={compressedImage}
                      alt="Compressed"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            {originalSize > 0 && compressedSize > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Original Size:</span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
                      {formatFileSize(originalSize)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Compressed Size:</span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
                      {formatFileSize(compressedSize)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Reduction:</span>
                    <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                      {compressionRatio}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Saved:</span>
                    <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                      {formatFileSize(originalSize - compressedSize)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Download */}
            {compressedImage && (
              <div className="flex justify-center">
                <button
                  onClick={downloadImage}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Download Compressed Image
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 mt-10">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Compress Images Online</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <li>Upload a JPG, PNG, or WebP image (up to 10 MB) or drag &amp; drop files into the dropzone.</li>
            <li>Set the desired quality percentage and pick the output format (JPEG or WebP).</li>
            <li>Compare the original and compressed previews, including file sizes and reduction percent.</li>
            <li>Download the optimized image when you are satisfied with the quality.</li>
          </ol>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Pro tip: WebP usually produces smaller files than JPEG while keeping similar visual quality.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Supported Formats &amp; Settings</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Input Formats</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>JPEG / JPG photos</li>
                <li>PNG graphics with transparency</li>
                <li>WebP images</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Output Controls</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Quality slider (10–100%)</li>
                <li>JPEG or WebP output format</li>
                <li>Live percentage savings &amp; file size stats</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Best Practices for Image Compression</h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed list-disc list-inside">
            <li>Keep quality between 70–85% for web photos to balance sharpness and file size.</li>
            <li>Switch to WebP for UI graphics or hero images to unlock extra savings.</li>
            <li>Resize images to their actual display dimensions before compressing to avoid extra weight.</li>
            <li>Use higher quality for product shots or detailed illustrations where clarity matters.</li>
          </ul>
        </section>
      </div>

      </Layout>
  )
}

