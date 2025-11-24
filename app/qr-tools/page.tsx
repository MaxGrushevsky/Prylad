'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import QRCodeGenerator from '@/components/QRCodeGenerator'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import FileDropZone from '@/components/FileDropZone'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'
import jsQR from 'jsqr'
import { useCallback, useRef } from 'react'

interface QRResult {
  data: string
  location: {
    topLeftCorner: { x: number; y: number }
    topRightCorner: { x: number; y: number }
    bottomLeftCorner: { x: number; y: number }
    bottomRightCorner: { x: number; y: number }
  }
}

export default function QRToolsPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'read'>('generate')
  const [image, setImage] = useState<string | null>(null)
  const [qrResult, setQrResult] = useState<QRResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [totalScanned, setTotalScanned] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  // Check URL hash for tab switching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash === '#read') {
        setActiveTab('read')
      } else if (hash === '#generate') {
        setActiveTab('generate')
      }
    }
  }, [])

  // Update URL hash when tab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = activeTab === 'generate' ? '' : '#read'
      if (window.location.hash !== hash) {
        window.history.replaceState(null, '', hash || window.location.pathname)
      }
    }
  }, [activeTab])

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

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        let code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        })

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
  const toolPath = '/qr-tools'
  const toolName = 'QR Code Tools'
  const category = 'qr'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "Are the QR codes generated here free to use?",
      answer: "Yes, absolutely! All QR codes generated with our tool are completely free to use for personal or commercial purposes. There are no hidden fees, subscriptions, or usage limits."
    },
    {
      question: "Do you store or track my QR codes?",
      answer: "No, we don't store, track, or have access to any QR codes you generate or scan. All processing happens locally in your browser, ensuring complete privacy and security of your data."
    },
    {
      question: "How do I scan a QR code from an image?",
      answer: "Upload an image file containing a QR code (drag and drop or click to select), and the reader automatically detects and decodes the QR code. The decoded data is displayed immediately."
    },
    {
      question: "What types of data can QR codes contain?",
      answer: "QR codes can contain various types of data including plain text, URLs, WiFi network credentials (SSID, password, security type), email addresses, phone numbers, contact information (vCard), and more."
    },
    {
      question: "Can I add a logo to my QR code?",
      answer: "Yes! You can upload your logo or brand image and it will be placed in the center of the QR code. When a logo is added, the error correction level is automatically set to H (Maximum) to ensure the QR code remains scannable."
    },
    {
      question: "What image formats are supported for scanning?",
      answer: "The QR reader supports common image formats including JPG, JPEG, PNG, GIF, and WebP. The image should contain a clear, readable QR code for best results."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Choose Tool",
      text: "Select between Generate (create QR codes) or Read (scan QR codes from images) using the tabs."
    },
    {
      name: "Generate QR Code",
      text: "For generation: Choose QR code type (Text, URL, WiFi, Email), enter content, customize appearance, and download."
    },
    {
      name: "Read QR Code",
      text: "For reading: Upload an image containing a QR code, and the tool automatically detects and decodes it."
    },
    {
      name: "Use Results",
      text: "Copy decoded data, open URLs directly, or use WiFi credentials to connect to networks."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Use QR Code Tools",
      "Learn how to generate and read QR codes using our free online QR code tools. Create custom QR codes or scan QR codes from images.",
      howToSteps,
      "PT3M"
    ),
    generateSoftwareApplicationSchema(
      "QR Code Tools",
      "Free online QR code generator and reader. Create custom QR codes for text, URLs, WiFi networks, and email addresses. Scan QR codes from uploaded images.",
      "https://prylad.pro/qr-tools",
      "UtilityApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="📱 QR Code Tools - Generator & Reader"
        description="Generate and read QR codes online for free. Create custom QR codes for text, URLs, WiFi networks, and email addresses. Scan QR codes from uploaded images."
        breadcrumbs={breadcrumbs}
      >
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 mb-6 border border-gray-100 dark:border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('generate')}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'generate'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Generate QR Code
              </button>
              <button
                onClick={() => setActiveTab('read')}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'read'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Read QR Code
              </button>
            </div>
          </div>

          {/* Generate Tab */}
          {activeTab === 'generate' && (
            <div>
              <QRCodeGenerator />
            </div>
          )}

          {/* Read Tab */}
          {activeTab === 'read' && (
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
          )}

          {/* Stats */}
          {activeTab === 'read' && totalScanned > 0 && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                QR codes scanned: <span className="font-semibold text-primary-600">{totalScanned}</span>
              </p>
            </div>
          )}
        </div>

        {/* Hidden Canvas for QR Detection */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <RelatedTools tools={relatedTools} title="Related Tools" />
        )}
      </Layout>
    </>
  )
}


