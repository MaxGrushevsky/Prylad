'use client'

import { useState, useCallback, useRef } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import FileDropZone from '@/components/FileDropZone'
import jsQR from 'jsqr'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

interface QRResult {
  data: string
  location: {
    topLeftCorner: { x: number; y: number }
    topRightCorner: { x: number; y: number }
    bottomLeftCorner: { x: number; y: number }
    bottomRightCorner: { x: number; y: number }
  }
}

export default function QRReaderPage() {
  const [image, setImage] = useState<string | null>(null)
  const [qrResult, setQrResult] = useState<QRResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [totalScanned, setTotalScanned] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const detectQRCode = useCallback((imageUrl: string) => {
    return new Promise<QRResult | null>((resolve) => {
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

        // Set canvas size to image size
        canvas.width = img.width
        canvas.height = img.height

        // Draw image on canvas
        ctx.drawImage(img, 0, 0)

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // Decode QR code - try multiple inversion attempts
        let code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        })

        // If not found, try with inversion
        if (!code) {
          code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          })
        }

        if (code) {
          resolve({
            data: code.data,
            location: {
              topLeftCorner: code.location.topLeftCorner,
              topRightCorner: code.location.topRightCorner,
              bottomLeftCorner: code.location.bottomLeftCorner,
              bottomRightCorner: code.location.bottomRightCorner,
            }
          })
        } else {
          resolve(null)
        }
      }

      img.onerror = () => {
        resolve(null)
      }

      img.src = imageUrl
      imageRef.current = img
    })
  }, [])

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setLoading(true)
    setError('')
    setQrResult(null)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string
        setImage(imageUrl)

        // Try to detect QR code
        const result = await detectQRCode(imageUrl)
        
        if (result) {
          setQrResult(result)
          setTotalScanned(prev => prev + 1)
        } else {
          setError('No QR code found in the image. Please make sure the image contains a clear QR code.')
        }
        setLoading(false)
      }
      reader.onerror = () => {
        setError('Failed to read image file')
        setLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Failed to process image')
      setLoading(false)
    }
  }, [detectQRCode])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Silent fail
    }
  }

  const clearAll = () => {
    setImage(null)
    setQrResult(null)
    setError('')
  }

  const getQRType = (data: string): { type: string; icon: string; description: string } => {
    if (data.startsWith('http://') || data.startsWith('https://')) {
      return { type: 'URL', icon: '🔗', description: 'Web link' }
    }
    if (data.startsWith('WIFI:')) {
      return { type: 'WiFi', icon: '📶', description: 'WiFi network credentials' }
    }
    if (data.startsWith('mailto:')) {
      return { type: 'Email', icon: '📧', description: 'Email address' }
    }
    if (data.startsWith('tel:')) {
      return { type: 'Phone', icon: '📞', description: 'Phone number' }
    }
    if (data.startsWith('sms:')) {
      return { type: 'SMS', icon: '💬', description: 'SMS message' }
    }
    if (data.startsWith('geo:')) {
      return { type: 'Location', icon: '📍', description: 'Geographic location' }
    }
    return { type: 'Text', icon: '📝', description: 'Plain text' }
  }

  const parseWiFiQR = (data: string) => {
    if (!data.startsWith('WIFI:')) return null
    
    const params: Record<string, string> = {}
    const parts = data.substring(5).split(';')
    
    parts.forEach(part => {
      const [key, value] = part.split(':')
      if (key && value) {
        params[key] = value
      }
    })

    return {
      ssid: params.S || '',
      password: params.P || '',
      security: params.T || 'nopass',
      hidden: params.H === 'true'
    }
  }

  const qrType = qrResult ? getQRType(qrResult.data) : null
  const wifiData = qrResult && qrResult.data.startsWith('WIFI:') ? parseWiFiQR(qrResult.data) : null

  // SEO data
  const toolPath = '/qr-reader'
  const toolName = 'QR Code Reader'
  const category = 'qr'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "How do I scan a QR code from an image?",
      answer: "Upload an image file containing a QR code (drag and drop or click to select), and the reader automatically detects and decodes the QR code. The decoded data is displayed immediately."
    },
    {
      question: "What image formats are supported?",
      answer: "The QR reader supports common image formats including JPG, JPEG, PNG, GIF, and WebP. The image should contain a clear, readable QR code for best results."
    },
    {
      question: "What types of data can QR codes contain?",
      answer: "QR codes can contain various types of data including plain text, URLs, WiFi network credentials (SSID, password, security type), email addresses, phone numbers, contact information (vCard), and more."
    },
    {
      question: "Can I scan QR codes from photos?",
      answer: "Yes! You can upload photos containing QR codes. For best results, ensure the QR code is clear, well-lit, and not distorted. The code should be large enough and in focus."
    },
    {
      question: "What if the QR code is not detected?",
      answer: "If the QR code is not detected, try: ensuring the image is clear and in focus, the QR code is not too small, there's good contrast between the code and background, and the code is not damaged or partially obscured."
    },
    {
      question: "Is the QR code reader free and secure?",
      answer: "Yes, completely free and secure! All QR code scanning happens entirely in your browser. We never see, store, transmit, or have access to your images or decoded data. Your privacy is completely protected."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Upload Image",
      text: "Upload an image file containing a QR code. You can drag and drop the image or click to select it from your device. Supported formats: JPG, PNG, GIF, WebP."
    },
    {
      name: "Automatic Detection",
      text: "The QR reader automatically detects and scans the QR code in the uploaded image. No manual selection or cropping needed."
    },
    {
      name: "View Decoded Data",
      text: "See the decoded QR code data displayed immediately. The data type (text, URL, WiFi, etc.) is automatically detected and formatted appropriately."
    },
    {
      name: "Use Decoded Information",
      text: "Copy the decoded data to your clipboard or use it directly. For URLs, click to open. For WiFi credentials, use them to connect to networks."
    },
    {
      name: "Scan More Codes",
      text: "Upload another image to scan more QR codes. The tool supports scanning multiple codes from different images."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Scan QR Codes from Images",
      "Learn how to scan and decode QR codes from uploaded images using our free online QR code reader tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "QR Code Reader",
      "Free online QR code reader. Scan and decode QR codes from uploaded images. Support for text, URLs, WiFi credentials, email addresses, and more. Automatic detection and decoding.",
      "https://prylad.pro/qr-reader",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="📱 QR Code Reader - Scan QR Codes from Images"
        description="Scan and decode QR codes from uploaded images online for free. Read QR codes containing text, URLs, WiFi credentials, and more. No registration required."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* File Upload */}
            {!image && (
              <FileDropZone
                onFileSelect={handleFileSelect}
                accept="image/*"
                maxSize={10 * 1024 * 1024}
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
                    Upload an image with QR code
                  </p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Drag and drop or click to select
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    Max size: 10 MB • Supports JPG, PNG, GIF, WebP
                  </p>
                </div>
              </FileDropZone>
            )}

            {image && (
              <>
                {/* Image Preview */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Uploaded Image
                    </label>
                    <button
                      onClick={clearAll}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      Change Image
                    </button>
                  </div>
                  <div className="relative bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex justify-center">
                    <div className="relative inline-block max-w-full">
                      <img
                        src={image}
                        alt="Uploaded"
                        ref={imageRef}
                        className="max-w-full max-h-96 object-contain rounded block"
                      />
                      {/* QR Code Detection Overlay SVG */}
                      {qrResult && imageRef.current && (() => {
                        const img = imageRef.current!
                        const imgWidth = img.naturalWidth || img.width
                        const imgHeight = img.naturalHeight || img.height
                        const displayWidth = img.offsetWidth || img.width
                        const displayHeight = img.offsetHeight || img.height
                        
                        return (
                          <svg
                            className="absolute top-0 left-0 pointer-events-none"
                            style={{
                              width: `${displayWidth}px`,
                              height: `${displayHeight}px`
                            }}
                            viewBox={`0 0 ${imgWidth} ${imgHeight}`}
                            preserveAspectRatio="xMidYMid meet"
                          >
                            <polyline
                              points={`
                                ${qrResult.location.topLeftCorner.x},${qrResult.location.topLeftCorner.y}
                                ${qrResult.location.topRightCorner.x},${qrResult.location.topRightCorner.y}
                                ${qrResult.location.bottomRightCorner.x},${qrResult.location.bottomRightCorner.y}
                                ${qrResult.location.bottomLeftCorner.x},${qrResult.location.bottomLeftCorner.y}
                                ${qrResult.location.topLeftCorner.x},${qrResult.location.topLeftCorner.y}
                              `}
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )
                      })()}
                    </div>
                  </div>
                </div>

                {/* Loading */}
                {loading && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Scanning for QR code...</p>
                  </div>
                )}

                {/* Error */}
                {error && !loading && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
                  </div>
                )}

                {/* QR Code Result */}
                {qrResult && !loading && (
                  <div className="space-y-4">
                    {/* QR Type Badge */}
                    {qrType && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{qrType.icon}</span>
                          <div>
                            <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">{qrType.type}</div>
                            <div className="text-xs text-blue-700 dark:text-blue-300">{qrType.description}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WiFi Credentials */}
                    {wifiData && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">WiFi Network Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-700 dark:text-green-300">Network Name (SSID):</span>
                            <span className="font-semibold text-green-900 dark:text-green-100">{wifiData.ssid}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700 dark:text-green-300">Password:</span>
                            <span className="font-semibold text-green-900 dark:text-green-100">{wifiData.password || 'No password'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700 dark:text-green-300">Security:</span>
                            <span className="font-semibold text-green-900 dark:text-green-100">{wifiData.security}</span>
                          </div>
                          {wifiData.hidden && (
                            <div className="flex justify-between">
                              <span className="text-green-700 dark:text-green-300">Hidden Network:</span>
                              <span className="font-semibold text-green-900 dark:text-green-100">Yes</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* QR Code Data */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          QR Code Content
                        </label>
                        <button
                          onClick={() => copyToClipboard(qrResult.data)}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <code className="text-sm font-mono break-all text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {qrResult.data}
                        </code>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {qrResult.data.startsWith('http://') || qrResult.data.startsWith('https://') ? (
                        <a
                          href={qrResult.data}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-center"
                        >
                          Open Link
                        </a>
                      ) : null}
                      <button
                        onClick={() => copyToClipboard(qrResult.data)}
                        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                      >
                        Copy Content
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        {totalScanned > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              QR codes scanned: <span className="font-semibold text-primary-600">{totalScanned}</span>
            </p>
          </div>
        )}
      </div>

      {/* Hidden Canvas for QR Detection */}
      <canvas ref={canvasRef} className="hidden" />

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Read QR Codes</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Our QR code reader allows you to scan and decode QR codes from uploaded images. Simply upload an image 
            containing a QR code, and our tool will automatically detect and decode the information stored in it.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            QR codes can contain various types of information including URLs, text, WiFi credentials, contact information, 
            and more. Our reader automatically identifies the type of content and displays it in a user-friendly format.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Supported QR Code Types</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong className="text-gray-900 dark:text-gray-100">🔗 URLs:</strong> Web links that open in your browser
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">📶 WiFi:</strong> Network credentials for automatic connection
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">📧 Email:</strong> Email addresses and mailto links
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">📞 Phone:</strong> Phone numbers for direct calling
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">💬 SMS:</strong> Text message content and recipients
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">📍 Location:</strong> Geographic coordinates
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">📝 Text:</strong> Plain text messages or information
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Tips for Best Results</h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Image Quality:</strong> Use clear, high-resolution images for best results. Blurry or low-quality images may not be detected.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>QR Code Size:</strong> Ensure the QR code is large enough and clearly visible in the image. Small or distorted QR codes may not be readable.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Contrast:</strong> QR codes with good contrast (dark on light background) are easier to detect than low-contrast codes.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Angle:</strong> Straight, front-facing images work best. Heavily angled or rotated QR codes may be harder to detect.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
              <span className="text-sm"><strong>Format:</strong> Supported formats include JPG, PNG, GIF, and WebP. Maximum file size is 10MB.</span>
            </li>
          </ul>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong className="text-gray-900 dark:text-gray-100">WiFi Connection:</strong> Scan WiFi QR codes to quickly connect to networks without manually entering credentials.
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">URL Access:</strong> Extract URLs from QR codes in printed materials, advertisements, or business cards.
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Contact Information:</strong> Read contact details, phone numbers, or email addresses stored in QR codes.
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Event Tickets:</strong> Decode QR codes from event tickets, boarding passes, or entry codes.
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Product Information:</strong> Scan QR codes on products to access manuals, reviews, or additional information.
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">Document Verification:</strong> Verify QR codes on documents, certificates, or identification cards.
            </div>
          </div>
        </section>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related QR Tools" />
      )}
    </Layout>
    </>
  )
}

