'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import FileDropZone from '@/components/FileDropZone'

type TextPosition = 'top' | 'bottom' | 'center' | 'custom'
type FontFamily = 'Impact' | 'Arial' | 'Comic Sans MS' | 'Verdana' | 'Georgia' | 'Times New Roman'

interface TextBlock {
  id: string
  text: string
  position: { x: number; y: number }
  fontSize: number
  fontColor: string
  strokeColor: string
  strokeWidth: number
  fontFamily: FontFamily
  align: 'left' | 'center' | 'right'
}

const memeTemplates = [
  { name: 'Drake Pointing', url: 'https://i.imgflip.com/30b1gx.jpg', topText: 'No', bottomText: 'Yes' },
  { name: 'Distracted Boyfriend', url: 'https://i.imgflip.com/1ur9b0.jpg', topText: 'Me', bottomText: 'Also me' },
  { name: 'Change My Mind', url: 'https://i.imgflip.com/24y43o.jpg', topText: 'Change my mind', bottomText: '' },
  { name: 'Expanding Brain', url: 'https://i.imgflip.com/1jhl7v.jpg', topText: 'Small brain', bottomText: 'Big brain' },
  { name: 'Woman Yelling at Cat', url: 'https://i.imgflip.com/345v97.jpg', topText: 'Woman yelling', bottomText: 'Cat sitting' },
  { name: 'This Is Fine', url: 'https://i.imgflip.com/26am.jpg', topText: 'This is fine', bottomText: '' },
]

export default function MemeGeneratorPage() {
  const [image, setImage] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('')
  const [fontSize, setFontSize] = useState(40)
  const [fontColor, setFontColor] = useState('#FFFFFF')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [fontFamily, setFontFamily] = useState<FontFamily>('Impact')
  const [autoGenerate, setAutoGenerate] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalGenerated, setTotalGenerated] = useState(0)
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
      setImageUrl('')
    }
    reader.onerror = () => {
      setError('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  const loadTemplate = (template: typeof memeTemplates[0]) => {
    setImageUrl(template.url)
    setImage(null)
    setTopText(template.topText)
    setBottomText(template.bottomText)
  }

  const generateMeme = useCallback(() => {
    const imageSource = image || imageUrl
    if (!imageSource || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onerror = () => {
      setError('Failed to load image')
    }
    img.onload = () => {
      // Set canvas size to image size, but limit max dimensions for display
      const maxWidth = 1200
      const maxHeight = 1200
      let width = img.width
      let height = img.height

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = width * ratio
        height = height * ratio
      }

      canvas.width = width
      canvas.height = height

      // Draw image
      ctx.drawImage(img, 0, 0, width, height)

      // Text settings
      ctx.font = `bold ${fontSize}px ${fontFamily}`
      ctx.fillStyle = fontColor
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      // Top text
      if (topText) {
        const x = canvas.width / 2
        const y = 20
        ctx.strokeText(topText, x, y)
        ctx.fillText(topText, x, y)
      }

      // Bottom text
      if (bottomText) {
        ctx.textBaseline = 'bottom'
        const x = canvas.width / 2
        const y = canvas.height - 20
        ctx.strokeText(bottomText, x, y)
        ctx.fillText(bottomText, x, y)
      }

      setTotalGenerated(prev => prev + 1)
    }
    img.src = imageSource
  }, [image, imageUrl, topText, bottomText, fontSize, fontColor, strokeColor, strokeWidth, fontFamily])

  useEffect(() => {
    if (autoGenerate && (image || imageUrl)) {
      const timeoutId = setTimeout(() => {
        generateMeme()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [autoGenerate, image, imageUrl, topText, bottomText, fontSize, fontColor, strokeColor, strokeWidth, fontFamily, generateMeme])

  const downloadMeme = (format: 'png' | 'jpg' = 'png') => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `meme-${Date.now()}.${format}`
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

  const clearAll = () => {
    setImage(null)
    setImageUrl('')
    setTopText('')
    setBottomText('')
    setError(null)
  }

  return (
    <Layout
      title="😂 Meme Generator - Create Memes Online for Free"
      description="Create memes online for free. Upload your own images or use popular meme templates. Add text, customize fonts, colors, and download your memes instantly."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Settings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Meme Settings</h2>
              {totalGenerated > 0 && (
                <div className="text-sm text-gray-500">
                  Generated: <span className="font-semibold text-gray-900">{totalGenerated}</span>
                </div>
              )}
            </div>

            {/* Popular Templates */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Popular Templates:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {memeTemplates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => loadTemplate(template)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-xs font-medium transition-colors"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Your Image
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
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </FileDropZone>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
              {(image || imageUrl) && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">✓ Image loaded successfully</p>
                </div>
              )}
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Or Enter Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value)
                  setImage(null)
                }}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Top Text */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Top Text
              </label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Enter top text..."
              />
            </div>

            {/* Bottom Text */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bottom Text
              </label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Enter bottom text..."
              />
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="20"
                max="120"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="Impact">Impact</option>
                <option value="Arial">Arial</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
              </select>
            </div>

            {/* Colors */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Text Color</label>
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="w-full h-10 rounded-lg border-2 border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stroke Color</label>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-full h-10 rounded-lg border-2 border-gray-200"
                />
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stroke Width: {strokeWidth}px
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
            </div>

            {/* Auto Generate */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerate}
                onChange={(e) => setAutoGenerate(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Auto-generate as you edit</span>
            </label>

            {!autoGenerate && (
              <button
                onClick={generateMeme}
                disabled={!image && !imageUrl}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50"
              >
                Generate Meme
              </button>
            )}

            <button
              onClick={clearAll}
              className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Preview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold">Preview</h2>

            {(image || imageUrl) ? (
              <div className="space-y-4">
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 overflow-auto max-h-[600px]">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto rounded-lg mx-auto block"
                    style={{ display: 'block' }}
                  />
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => downloadMeme('png')}
                    className="w-full bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={() => downloadMeme('jpg')}
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
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 bg-gray-50 text-center text-gray-400">
                <p className="font-semibold text-gray-700 mb-2">Meme will appear here</p>
                <p className="text-sm">Upload an image or select a template to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is a Meme Generator?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                A meme generator is an online tool that allows you to create memes by adding text to images. 
                Memes are humorous images, videos, or text that spread rapidly across the internet, often with 
                captions that make them relatable or funny.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free meme generator lets you create memes instantly in your browser. Upload your own images, 
                use popular meme templates, customize text with different fonts and colors, and download your 
                creations as PNG or JPG files. Perfect for social media, messaging apps, and having fun with friends.
              </p>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Our Meme Generator</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li><strong>Choose an Image:</strong> Upload your own image file or enter an image URL. You can also select from popular meme templates like Drake Pointing, Distracted Boyfriend, or Change My Mind.</li>
                <li><strong>Add Text:</strong> Enter your top text and bottom text. These will appear at the top and bottom of your meme.</li>
                <li><strong>Customize Appearance:</strong> Adjust font size (20-120px), choose a font family (Impact, Arial, Comic Sans, etc.), set text color and stroke color, and adjust stroke width for better readability.</li>
                <li><strong>Preview:</strong> See your meme update in real-time as you make changes (if auto-generate is enabled).</li>
                <li><strong>Download:</strong> Export your meme as PNG or JPG, or copy the data URL to share directly.</li>
              </ol>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Popular Meme Templates</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Drake Pointing</h3>
                <p className="text-gray-700 text-sm">
                  The classic &quot;No&quot; vs &quot;Yes&quot; meme. Perfect for comparing two options or showing preference.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">👀 Distracted Boyfriend</h3>
                <p className="text-gray-700 text-sm">
                  The distracted boyfriend meme. Great for showing temptation or being torn between choices.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💭 Change My Mind</h3>
                <p className="text-gray-700 text-sm">
                  The &quot;Change my mind&quot; meme. Perfect for expressing strong opinions or controversial takes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🧠 Expanding Brain</h3>
                <p className="text-gray-700 text-sm">
                  The expanding brain meme. Shows progression from simple to complex thinking or ideas.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What image formats are supported?</h3>
                <p className="text-gray-700 text-sm">
                  You can upload any common image format (PNG, JPG, JPEG, GIF, WebP). You can also use image URLs 
                  from the internet. The generator will convert your meme to PNG or JPG format for download.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I use my own images?</h3>
                <p className="text-gray-700 text-sm">
                  Yes! Upload any image from your device or enter an image URL. Make sure you have the rights to 
                  use the image, especially if you plan to share the meme publicly.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What&apos;s the maximum image size?</h3>
                <p className="text-gray-700 text-sm">
                  Uploaded images can be up to 10MB. The generator will automatically resize large images to fit 
                  within 1200x1200 pixels for optimal display and performance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I customize the text appearance?</h3>
                <p className="text-gray-700 text-sm">
                  Yes! You can adjust font size (20-120px), choose from 6 different font families, set text color 
                  and stroke color, and adjust stroke width (0-10px) for better readability on any background.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my image stored or transmitted?</h3>
                <p className="text-gray-700 text-sm">
                  No, all meme generation happens entirely in your browser. We never see, store, or transmit any 
                  of your images or settings. Your privacy is completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}
