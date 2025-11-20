'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import FileDropZone from '@/components/FileDropZone'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type ColorBlindnessType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia'

export default function ColorBlindnessSimulatorPage() {
  const [image, setImage] = useState<string | null>(null)
  const [type, setType] = useState<ColorBlindnessType>('normal')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Color blindness filters (simplified matrices)
  const getFilterMatrix = (type: ColorBlindnessType): number[] => {
    switch (type) {
      case 'protanopia':
        // Red-green color blindness (protanopia)
        return [
          0.567, 0.433, 0, 0, 0,
          0.558, 0.442, 0, 0, 0,
          0, 0.242, 0.758, 0, 0,
          0, 0, 0, 1, 0
        ]
      case 'deuteranopia':
        // Red-green color blindness (deuteranopia)
        return [
          0.625, 0.375, 0, 0, 0,
          0.7, 0.3, 0, 0, 0,
          0, 0.3, 0.7, 0, 0,
          0, 0, 0, 1, 0
        ]
      case 'tritanopia':
        // Blue-yellow color blindness (tritanopia)
        return [
          0.95, 0.05, 0, 0, 0,
          0, 0.433, 0.567, 0, 0,
          0, 0.475, 0.525, 0, 0,
          0, 0, 0, 1, 0
        ]
      default:
        // Normal vision
        return [
          1, 0, 0, 0, 0,
          0, 1, 0, 0, 0,
          0, 0, 1, 0, 0,
          0, 0, 0, 1, 0
        ]
    }
  }

  const applyFilter = useCallback(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      if (type !== 'normal') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const matrix = getFilterMatrix(type)

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          data[i] = Math.min(255, Math.max(0, 
            r * matrix[0] + g * matrix[1] + b * matrix[2] + matrix[4] * 255
          ))
          data[i + 1] = Math.min(255, Math.max(0,
            r * matrix[5] + g * matrix[6] + b * matrix[7] + matrix[9] * 255
          ))
          data[i + 2] = Math.min(255, Math.max(0,
            r * matrix[10] + g * matrix[11] + b * matrix[12] + matrix[14] * 255
          ))
        }

        ctx.putImageData(imageData, 0, 0)
      }
    }
    img.src = image
  }, [image, type])

  useEffect(() => {
    applyFilter()
  }, [applyFilter])

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImage(result)
    }
    reader.onerror = () => {
    }
    reader.readAsDataURL(file)
  }, [])

  const downloadImage = () => {
    if (!canvasRef.current) return
    
    canvasRef.current.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `color-blind-${type}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
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
      answer: "Color blindness (color vision deficiency) is a condition where people have difficulty distinguishing certain colors. The most common types are Protanopia (red-green), Deuteranopia (red-green), and Tritanopia (blue-yellow)."
    },
    {
      question: "Why should I test images for color blindness?",
      answer: "Testing images for color blindness ensures your designs are accessible to all users. Approximately 8% of men and 0.5% of women have some form of color vision deficiency. Accessible designs improve user experience for everyone."
    },
    {
      question: "What types of color blindness can I simulate?",
      answer: "Three types: Protanopia (red-green color blindness, difficulty seeing red), Deuteranopia (red-green color blindness, difficulty seeing green), and Tritanopia (blue-yellow color blindness, difficulty seeing blue)."
    },
    {
      question: "How do I use the color blindness simulator?",
      answer: "Upload your image, select a color blindness type (Protanopia, Deuteranopia, or Tritanopia), and see how the image appears to people with that type of color vision deficiency. Compare with the normal view."
    },
    {
      question: "What should I look for when testing?",
      answer: "Check if important information relies solely on color. Ensure text is readable, buttons are distinguishable, and information is conveyed through shapes, patterns, or text labels in addition to color."
    },
    {
      question: "Is the color blindness simulator free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All image processing happens in your browser - we never see or store your images."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Upload Image",
      text: "Upload your image by dragging and dropping it or clicking to select. Supported formats: JPEG, PNG, WebP. The image loads instantly for simulation."
    },
    {
      name: "Select Color Blindness Type",
      text: "Choose a color blindness type: Protanopia (red-green, difficulty seeing red), Deuteranopia (red-green, difficulty seeing green), or Tritanopia (blue-yellow, difficulty seeing blue)."
    },
    {
      name: "View Simulation",
      text: "See how your image appears to people with the selected type of color vision deficiency. The simulation applies color filters to approximate the visual experience."
    },
    {
      name: "Compare Views",
      text: "Switch between 'Normal' and color blindness types to compare how the image looks. This helps identify potential accessibility issues."
    },
    {
      name: "Make Improvements",
      text: "If important information is lost in the simulation, improve your design by adding text labels, patterns, or shapes in addition to color to convey information."
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
      "Free online color blindness simulator. Test images for accessibility by simulating Protanopia, Deuteranopia, and Tritanopia color vision deficiencies. Perfect for web designers and developers.",
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
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Color Blindness Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => setType('normal')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    type === 'normal'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setType('protanopia')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    type === 'protanopia'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Protanopia
                </button>
                <button
                  onClick={() => setType('deuteranopia')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    type === 'deuteranopia'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Deuteranopia
                </button>
                <button
                  onClick={() => setType('tritanopia')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    type === 'tritanopia'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Tritanopia
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {type === 'protanopia' && 'Red-green color blindness (cannot see red light)'}
                {type === 'deuteranopia' && 'Red-green color blindness (cannot see green light)'}
                {type === 'tritanopia' && 'Blue-yellow color blindness (cannot see blue light)'}
                {type === 'normal' && 'Normal color vision'}
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
            </div>

            {/* Preview */}
            {image && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Preview ({type})
                  </label>
                  <button
                    onClick={downloadImage}
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

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">About Color Blindness</h3>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <p>
                  <strong>Protanopia:</strong> Red-green color blindness where red cones are missing. Affects ~1% of males.
                </p>
                <p>
                  <strong>Deuteranopia:</strong> Red-green color blindness where green cones are missing. Affects ~1% of males.
                </p>
                <p>
                  <strong>Tritanopia:</strong> Blue-yellow color blindness where blue cones are missing. Very rare, affects ~0.01% of population.
                </p>
                <p className="mt-2">
                  Use this tool to test your designs for accessibility and ensure information is conveyed through more than just color.
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
            <li>Upload a screenshot, UI mockup, or illustration that you want to test.</li>
            <li>Select the color vision deficiency: Protanopia, Deuteranopia, or Tritanopia.</li>
            <li>Review the preview canvas to see how users with each condition perceive your design.</li>
            <li>Download the processed preview to share with teammates or attach to QA reports.</li>
          </ol>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Tip: Test critical flows (forms, buttons, alerts) to ensure color alone isn&rsquo;t conveying important information.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 dark:text-white mb-4">Color Blindness Types Explained</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 dark:text-white mb-2">Protanopia</h3>
              <p>Red cones missing. Reds look darker and blend with greens. Affects ~1% of males.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 dark:text-white mb-2">Deuteranopia</h3>
              <p>Green cones missing. Greens fade toward beige. Also affects ~1% of males.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 dark:text-white mb-2">Tritanopia</h3>
              <p>Blue cones missing. Blues and yellows shift dramatically. Rare (&lt;0.01% population).</p>
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

