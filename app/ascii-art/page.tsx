'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'

type ASCIIStyle = 'simple' | 'medium' | 'complex' | 'blocks' | 'dots' | 'shades'
type TextAlign = 'left' | 'center' | 'right'

const asciiChars: Record<ASCIIStyle, string> = {
  simple: '@%#*+=-:. ',
  medium: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
  complex: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  blocks: '█▓▒░ ',
  dots: '⣿⣷⣶⣵⣴⣳⣲⣱⣰⣯⣮⣭⣬⣫⣪⣩⣨⣧⣦⣥⣤⣣⣢⣡⣠⣟⣞⣝⣜⣛⣚⣙⣘⣗⣖⣕⣔⣓⣒⣑⣐⣏⣎⣍⣌⣋⣊⣉⣈⣇⣆⣅⣄⣃⣂⣁⣀ ',
  shades: '█▓▒░ ',
}

export default function ASCIIArtPage() {
  const [text, setText] = useState('HELLO')
  const [style, setStyle] = useState<ASCIIStyle>('medium')
  const [width, setWidth] = useState(80)
  const [invert, setInvert] = useState(false)
  const [color, setColor] = useState('#00FF00')
  const [useColor, setUseColor] = useState(false)
  const [result, setResult] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [mode, setMode] = useState<'text' | 'image'>('text')
  const [imageWidth, setImageWidth] = useState(100)
  const [autoGenerate, setAutoGenerate] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalGenerated, setTotalGenerated] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateASCIIFromText = useCallback(() => {
    if (!text.trim()) {
      setResult('')
      return
    }

    const chars = invert ? asciiChars[style].split('').reverse().join('') : asciiChars[style]
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = width * 4
    canvas.height = width * 2

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'black'
    ctx.font = `bold ${width}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let ascii = ''

    for (let y = 0; y < canvas.height; y += 8) {
      for (let x = 0; x < canvas.width; x += 4) {
        const index = (y * canvas.width + x) * 4
        const r = imageData.data[index]
        const g = imageData.data[index + 1]
        const b = imageData.data[index + 2]
        const brightness = (r + g + b) / 3
        const charIndex = Math.floor((brightness / 255) * (chars.length - 1))
        const char = chars[charIndex] || ' '
        
        if (useColor) {
          const colorCode = rgbToHex(r, g, b)
          ascii += `<span style="color: ${colorCode}">${char}</span>`
        } else {
          ascii += char
        }
      }
      ascii += '\n'
    }

    setResult(ascii)
    setTotalGenerated(prev => prev + 1)
  }, [text, style, width, invert, useColor])

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  const generateASCIIFromImage = useCallback(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onerror = () => {
      setError('Failed to load image')
    }
    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      const maxWidth = imageWidth
      const aspectRatio = img.height / img.width
      const newWidth = maxWidth
      const newHeight = Math.floor(maxWidth * aspectRatio * 0.5) // Height is half due to character aspect ratio

      canvas.width = newWidth
      canvas.height = newHeight

      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      const imageData = ctx.getImageData(0, 0, newWidth, newHeight)

      const chars = invert ? asciiChars[style].split('').reverse().join('') : asciiChars[style]
      let ascii = ''

      for (let y = 0; y < newHeight; y++) {
        for (let x = 0; x < newWidth; x++) {
          const index = (y * newWidth + x) * 4
          const r = imageData.data[index]
          const g = imageData.data[index + 1]
          const b = imageData.data[index + 2]
          const brightness = (r + g + b) / 3
          const charIndex = Math.floor((brightness / 255) * (chars.length - 1))
          const char = chars[charIndex] || ' '
          
          if (useColor) {
            const colorCode = rgbToHex(r, g, b)
            ascii += `<span style="color: ${colorCode}">${char}</span>`
          } else {
            ascii += char
          }
        }
        ascii += '\n'
      }

      setResult(ascii)
      setTotalGenerated(prev => prev + 1)
    }
    img.src = image
  }, [image, style, imageWidth, invert, useColor])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
    }
    reader.onerror = () => {
      setError('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (autoGenerate) {
      const timeoutId = setTimeout(() => {
        if (mode === 'text') {
          generateASCIIFromText()
        } else {
          generateASCIIFromImage()
        }
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [autoGenerate, mode, text, style, width, invert, useColor, image, imageWidth, generateASCIIFromText, generateASCIIFromImage])

  const copyToClipboard = async () => {
    if (!result) return
    
    // Remove HTML tags if using color
    const plainText = useColor 
      ? result.replace(/<span[^>]*>|<\/span>/g, '')
      : result
    
    try {
      await navigator.clipboard.writeText(plainText)
    } catch (e) {
      console.error('Failed to copy')
    }
  }

  const exportToFile = () => {
    if (!result) return

    // Remove HTML tags if using color
    const plainText = useColor 
      ? result.replace(/<span[^>]*>|<\/span>/g, '')
      : result

    const blob = new Blob([plainText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `ascii-art-${Date.now()}.txt`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportToHTML = () => {
    if (!result) return

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ASCII Art</title>
  <style>
    body {
      background: #000;
      color: #00FF00;
      font-family: monospace;
      padding: 20px;
      white-space: pre;
    }
  </style>
</head>
<body>
${useColor ? result : result.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `ascii-art-${Date.now()}.html`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout
      title="🎨 ASCII Art Generator - Create ASCII Art from Text and Images"
      description="Generate ASCII art from text or images online for free. Choose from multiple styles, customize colors, and export as text or HTML. Perfect for code comments, art projects, and retro aesthetics."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Settings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">ASCII Art Settings</h2>
              {totalGenerated > 0 && (
                <div className="text-sm text-gray-500">
                  Generated: <span className="font-semibold text-gray-900">{totalGenerated}</span>
                </div>
              )}
            </div>

            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Mode:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMode('text')
                    setImage(null)
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    mode === 'text'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => setMode('image')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    mode === 'image'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Image
                </button>
              </div>
            </div>

            {/* Text Mode */}
            {mode === 'text' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Text</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter text..."
                  maxLength={30}
                />
              </div>
            )}

            {/* Image Mode */}
            {mode === 'image' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
                {image && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">✓ Image loaded successfully</p>
                  </div>
                )}
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Width: {imageWidth} characters
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="200"
                    value={imageWidth}
                    onChange={(e) => setImageWidth(Number(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                </div>
              </div>
            )}

            {/* Text Mode Width */}
            {mode === 'text' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Font Size: {width}px
                </label>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full accent-primary-600"
                />
              </div>
            )}

            {/* Style */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">ASCII Style:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(['simple', 'medium', 'complex', 'blocks', 'dots', 'shades'] as ASCIIStyle[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
                      style === s
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={invert}
                  onChange={(e) => setInvert(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Invert colors</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useColor}
                  onChange={(e) => setUseColor(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Use color (from image)</span>
              </label>
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
                onClick={mode === 'text' ? generateASCIIFromText : generateASCIIFromImage}
                disabled={mode === 'image' && !image}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50"
              >
                Generate ASCII Art
              </button>
            )}
          </div>

          {/* Preview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold">Preview</h2>

            {/* Hidden canvas for image processing */}
            <canvas
              ref={canvasRef}
              style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
            />

            {result ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-900 rounded-lg border-2 border-gray-200 overflow-auto max-h-[500px]">
                  {useColor ? (
                    <pre 
                      className="text-green-400 font-mono text-xs whitespace-pre"
                      dangerouslySetInnerHTML={{ __html: result }}
                    />
                  ) : (
                    <pre className="text-green-400 font-mono text-xs whitespace-pre">{result}</pre>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    onClick={copyToClipboard}
                    className="w-full bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    Copy Text
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={exportToFile}
                      className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Export TXT
                    </button>
                    <button
                      onClick={exportToHTML}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Export HTML
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 bg-gray-50 text-center text-gray-400">
                <p className="font-semibold text-gray-700 mb-2">ASCII art will appear here</p>
                <p className="text-sm">
                  {mode === 'text' 
                    ? 'Enter text and adjust settings'
                    : 'Upload an image to get started'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is ASCII Art?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                ASCII art is a graphic design technique that uses printable ASCII characters to create images and 
                text art. It was popular in the early days of computing when graphics capabilities were limited, 
                and remains popular today for code comments, retro aesthetics, and text-based art.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free ASCII art generator creates ASCII art from text or images instantly in your browser. 
                Choose from multiple styles (simple, medium, complex, blocks, dots, shades), customize colors, 
                and export as plain text or HTML. Perfect for developers, artists, and anyone who loves retro 
                computer aesthetics.
              </p>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Our ASCII Art Generator</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li><strong>Choose Mode:</strong> Select Text mode to convert text to ASCII art, or Image mode to convert images to ASCII art.</li>
                <li><strong>Enter Text or Upload Image:</strong> For text mode, enter up to 30 characters. For image mode, upload a PNG, JPG, or other image file.</li>
                <li><strong>Select Style:</strong> Choose from 6 ASCII styles: simple (basic characters), medium (detailed), complex (very detailed), blocks, dots, or shades.</li>
                <li><strong>Adjust Settings:</strong> For text mode, adjust font size (20-200px). For image mode, set width in characters (40-200).</li>
                <li><strong>Customize:</strong> Toggle invert colors for negative effect, or enable color mode to preserve image colors (image mode only).</li>
                <li><strong>Export:</strong> Copy to clipboard, export as TXT file, or export as HTML with styling.</li>
              </ol>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💻 Code Comments</h3>
                <p className="text-gray-700 text-sm">
                  Add ASCII art banners to your code comments for visual separation, headers, or just for fun. 
                  Export as plain text to paste directly into your code.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎨 Art Projects</h3>
                <p className="text-gray-700 text-sm">
                  Create text-based art for social media, forums, or messaging apps. ASCII art works great in 
                  monospace fonts and adds a retro aesthetic to your projects.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📱 Social Media</h3>
                <p className="text-gray-700 text-sm">
                  Generate ASCII art text for Twitter, Discord, or other platforms that support monospace text. 
                  Perfect for creating eye-catching headers or signatures.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🖼️ Image Conversion</h3>
                <p className="text-gray-700 text-sm">
                  Convert photos or images to ASCII art. Great for creating unique profile pictures, art pieces, 
                  or converting images to text format for special purposes.
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
                  You can upload any common image format (PNG, JPG, JPEG, GIF, WebP). The generator will convert 
                  the image to ASCII art by analyzing pixel brightness and mapping it to ASCII characters.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I use color in ASCII art?</h3>
                <p className="text-gray-700 text-sm">
                  Yes! Enable &quot;Use color (from image)&quot; to preserve colors from uploaded images. The color mode 
                  creates HTML output with color-coded characters. Note: Color only works in HTML export, not plain text.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What&apos;s the difference between styles?</h3>
                <p className="text-gray-700 text-sm">
                  Simple uses basic characters (@, %, #, *), medium uses more detailed characters for better gradients, 
                  complex uses the most detailed character set. Blocks, dots, and shades use special Unicode characters 
                  for different visual effects.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I use the exported ASCII art?</h3>
                <p className="text-gray-700 text-sm">
                  Plain text (TXT) can be pasted into code comments, text editors, or anywhere that supports monospace 
                  fonts. HTML export creates a complete HTML file with styling that you can open in a browser or embed 
                  in web pages.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my image stored or transmitted?</h3>
                <p className="text-gray-700 text-sm">
                  No, all ASCII art generation happens entirely in your browser. We never see, store, or transmit any 
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
