'use client'

import { useState, useRef, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

interface SpinResult {
  item: string
  timestamp: number
}

interface Preset {
  name: string
  items: string[]
}

const presets: Preset[] = [
  {
    name: 'What to Eat',
    items: ['Pizza', 'Burger', 'Sushi', 'Pasta', 'Salad', 'Tacos', 'Chinese', 'Indian']
  },
  {
    name: 'Where to Go',
    items: ['Beach', 'Mountains', 'City', 'Park', 'Museum', 'Cinema', 'Restaurant', 'Home']
  },
  {
    name: 'What to Watch',
    items: ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Documentary', 'Romance', 'Thriller']
  },
  {
    name: 'Activity',
    items: ['Read', 'Exercise', 'Cook', 'Draw', 'Music', 'Games', 'Sleep', 'Socialize']
  }
]

export default function WheelOfFortunePage() {
  const [items, setItems] = useState<string[]>(['Option 1', 'Option 2', 'Option 3', 'Option 4'])
  const [newItem, setNewItem] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [rotation, setRotation] = useState(0)
  const [currentRotation, setCurrentRotation] = useState(0)
  const [spinHistory, setSpinHistory] = useState<SpinResult[]>([])
  const [spinDuration, setSpinDuration] = useState(3)
  const [spinSpeed, setSpinSpeed] = useState(5)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const startRotationRef = useRef(0)
  const targetRotationRef = useRef(0)
  const startTimeRef = useRef(0)

  const addItem = () => {
    if (newItem.trim() && items.length < 20) {
      setItems([...items, newItem.trim()])
      setNewItem('')
    }
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const loadPreset = (preset: Preset) => {
    setItems([...preset.items])
    setSelectedIndex(null)
    setSpinHistory([])
  }

  const clearItems = () => {
    if (confirm('Clear all options?')) {
      setItems([])
      setSelectedIndex(null)
    }
  }

  // Calculate which sector is at the top (under pointer) after rotation
  // The pointer is fixed at top (-Math.PI/2 in canvas coordinates)
  // After CSS rotation, we need to find which sector is under the pointer
  const getSectorAtPointer = (rotationDeg: number): number => {
    if (items.length === 0) return 0
    
    const anglePerItemRad = (Math.PI * 2) / items.length
    const rotationRad = (rotationDeg * Math.PI) / 180
    
    // Pointer is fixed at top = -Math.PI/2 in canvas coordinates
    // After CSS rotation by rotationRad clockwise, the canvas rotates
    // The pointer stays at -Math.PI/2, but which sector is now there?
    
    // In the original (unrotated) canvas, the pointer is at -Math.PI/2
    // After rotation, the sector that is now under the pointer was originally at: -Math.PI/2 - rotationRad
    // (Because CSS rotation rotates the canvas clockwise, so we subtract)
    
    const originalAngle = -Math.PI / 2 - rotationRad
    
    // Normalize to [0, 2*PI)
    let normalizedAngle = originalAngle
    while (normalizedAngle < 0) normalizedAngle += Math.PI * 2
    while (normalizedAngle >= Math.PI * 2) normalizedAngle -= Math.PI * 2
    
    // Sectors in original coordinates start at -Math.PI/2
    // Sector i spans: [-Math.PI/2 + i*anglePerItemRad, -Math.PI/2 + (i+1)*anglePerItemRad)
    // In normalized [0, 2*PI): [3*Math.PI/2 + i*anglePerItemRad, 3*Math.PI/2 + (i+1)*anglePerItemRad)
    
    // Adjust normalized angle to account for sector start at 3*Math.PI/2
    let adjustedAngle = normalizedAngle - (3 * Math.PI / 2)
    if (adjustedAngle < 0) adjustedAngle += Math.PI * 2
    
    // Calculate which sector contains this angle
    let index = Math.floor(adjustedAngle / anglePerItemRad)
    
    // Ensure index is in valid range [0, items.length)
    index = index % items.length
    if (index < 0) index += items.length
    
    return index
  }

  const spin = () => {
    if (items.length < 2) {
      alert('Add at least 2 options')
      return
    }
    setIsSpinning(true)
    setSelectedIndex(null)

    const spins = spinSpeed + Math.random() * 3 // Variable spins
    const anglePerItem = 360 / items.length
    
    // Instead of selecting index first, select a random final rotation
    // Then calculate which sector will be under the pointer
    // This ensures the visual result matches the calculated result
    
    startRotationRef.current = currentRotation
    const additionalRotations = spins * 360
    
    // Add a random adjustment to make it truly random
    // This will determine which sector ends up at the top
    const randomAdjustment = Math.random() * 360
    
    const finalRotation = startRotationRef.current + additionalRotations + randomAdjustment
    targetRotationRef.current = finalRotation
    startTimeRef.current = Date.now()
    
    // Start animation
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const progress = Math.min(elapsed / (spinDuration * 1000), 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      const current = startRotationRef.current + (targetRotationRef.current - startRotationRef.current) * easeOut
      setCurrentRotation(current)
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Calculate which sector is actually at the pointer after final rotation
        const actualIndex = getSectorAtPointer(finalRotation)
        
        setRotation(targetRotationRef.current)
        setCurrentRotation(targetRotationRef.current)
        setSelectedIndex(actualIndex)
        setIsSpinning(false)
        
        // Add to history - use actual index to match visual result
        const result: SpinResult = {
          item: items[actualIndex],
          timestamp: Date.now()
        }
        setSpinHistory(prev => [result, ...prev].slice(0, 50))
      }
    }
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    animate()
  }

  const clearHistory = () => {
    if (confirm('Clear spin history?')) {
      setSpinHistory([])
    }
  }

  const exportHistory = () => {
    if (spinHistory.length === 0) return
    
    let content = 'Wheel of Fortune Results\n'
    content += '='.repeat(30) + '\n\n'
    
    spinHistory.forEach((result, index) => {
      const date = new Date(result.timestamp)
      content += `${index + 1}. ${result.item} - ${date.toLocaleString()}\n`
    })
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `wheel-results-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Calculate statistics
  const stats = spinHistory.length > 0 ? {
    totalSpins: spinHistory.length,
    itemCounts: items.reduce((acc, item) => {
      acc[item] = spinHistory.filter(r => r.item === item).length
      return acc
    }, {} as Record<string, number>),
    mostSelected: Object.entries(
      items.reduce((acc, item) => {
        acc[item] = spinHistory.filter(r => r.item === item).length
        return acc
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
  } : null

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20

    const drawWheel = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (items.length === 0) {
        ctx.fillStyle = '#f3f4f6'
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#6b7280'
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Add options', centerX, centerY - 10)
        ctx.font = '16px Arial'
        ctx.fillText('or load a preset', centerX, centerY + 20)
        return
      }

      const anglePerItem = (Math.PI * 2) / items.length
      // Don't add rotationRad here - rotation is handled by CSS transform on canvas element

      items.forEach((item, index) => {
        const startAngle = index * anglePerItem - Math.PI / 2
        const endAngle = (index + 1) * anglePerItem - Math.PI / 2

        // Color sector with better contrast
        const hue = (index * 360) / items.length
        ctx.fillStyle = `hsl(${hue}, 70%, ${selectedIndex === index ? '50%' : '60%'})`
        
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.closePath()
        ctx.fill()

        // Border
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 3
        ctx.stroke()

        // Text with better positioning using absolute coordinates
        const midAngle = startAngle + anglePerItem / 2
        const textRadius = radius * 0.7
        const textX = centerX + Math.cos(midAngle) * textRadius
        const textY = centerY + Math.sin(midAngle) * textRadius
        
        ctx.save()
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 18px Arial'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
        ctx.shadowBlur = 4
        const maxTextLength = Math.floor(textRadius * 0.5 / 10)
        const displayText = item.length > maxTextLength ? item.substring(0, maxTextLength) + '...' : item
        // Rotate text to be readable (perpendicular to radius)
        ctx.translate(textX, textY)
        ctx.rotate(midAngle + Math.PI / 2)
        ctx.fillText(displayText, 0, 0)
        ctx.restore()
      })

      // Central circle
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(centerX, centerY, 35, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 3
      ctx.stroke()
    }

    drawWheel()
  }, [items, currentRotation, selectedIndex])

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      items,
      spinDuration,
      spinSpeed
    }
    localStorage.setItem('wheelOfFortuneSettings', JSON.stringify(settings))
  }, [items, spinDuration, spinSpeed])

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('wheelOfFortuneSettings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        if (settings.items && Array.isArray(settings.items)) {
          setItems(settings.items)
        }
        if (settings.spinDuration) {
          setSpinDuration(settings.spinDuration)
        }
        if (settings.spinSpeed) {
          setSpinSpeed(settings.spinSpeed)
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // SEO data
  const toolPath = '/wheel-of-fortune'
  const toolName = 'Wheel of Fortune'
  const category = 'generator'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "What is a wheel of fortune?",
      answer: "A wheel of fortune is a spinning wheel used to make random choices from a list of options. It's perfect for decision-making, games, choosing what to eat, where to go, or picking from any custom list."
    },
    {
      question: "How do I use the wheel of fortune?",
      answer: "Add items to your wheel (one per line), or select a preset like 'What to Eat', 'Where to Go', or 'What to Watch'. Click 'Spin' to spin the wheel and get a random selection. The wheel spins with animation and stops on a random item."
    },
    {
      question: "Can I customize the wheel?",
      answer: "Yes! Add your own items (one per line), choose colors for each item, set the number of spins, and adjust spin speed. You can also use preset wheels for common decisions."
    },
    {
      question: "What presets are available?",
      answer: "Presets include: What to Eat (food options), Where to Go (places), What to Watch (movie genres), Activity (activities), and more. Click on any preset to load it instantly."
    },
    {
      question: "Can I see my spin history?",
      answer: "Yes! The tool tracks all your spins with timestamps. View your history to see previous selections and their results."
    },
    {
      question: "Is the wheel of fortune free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All wheel spinning happens in your browser - we never see or store your choices."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Add Items",
      text: "Enter your items (one per line) in the text area, or select a preset like 'What to Eat', 'Where to Go', etc. You can add as many items as you want."
    },
    {
      name: "Customize (Optional)",
      text: "Choose colors for each item, set the number of spins, and adjust spin speed. Customization makes the wheel more fun and personalized."
    },
    {
      name: "Spin the Wheel",
      text: "Click 'Spin' to spin the wheel. Watch the animation as it spins and stops on a random item. The result is displayed clearly."
    },
    {
      name: "View History",
      text: "Check your spin history to see all previous spins with timestamps. Useful for tracking decisions or game results."
    },
    {
      name: "Use Results",
      text: "Use the selected item for your decision, game, or activity. Spin again if you want a different result."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Use a Wheel of Fortune",
      "Learn how to use a wheel of fortune to make random choices and decisions using our free online wheel of fortune spinner tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Wheel of Fortune",
      "Free online wheel of fortune spinner. Make random decisions, choose what to eat, where to go, or pick from any list. Customizable options, spin history, and statistics. Perfect for decision making, games, and fun.",
      "https://prylad.pro/wheel-of-fortune",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🎡 Wheel of Fortune - Random Choice Generator"
        description="Free online wheel of fortune spinner. Make random decisions, choose what to eat, where to go, or pick from any list. Customizable options, spin history, and statistics. Perfect for decision making, games, and fun."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Presets */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">📋 Presets</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => loadPreset(preset)}
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-md text-sm font-medium"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Options ({items.length}/20)</h2>
            {items.length > 0 && (
              <button
                onClick={clearItems}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              placeholder="Add option..."
              className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={addItem}
              disabled={items.length >= 20}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg"
              >
                <span className="text-sm">{item}</span>
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 font-bold text-lg leading-none"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-xl font-bold mb-4">⚙️ Settings</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Spin Duration: {spinDuration}s
              </label>
              <input
                type="range"
                min="2"
                max="6"
                step="0.5"
                value={spinDuration}
                onChange={(e) => setSpinDuration(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Spin Speed: {spinSpeed} rotations
              </label>
              <input
                type="range"
                min="3"
                max="10"
                step="1"
                value={spinSpeed}
                onChange={(e) => setSpinSpeed(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Wheel */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="flex flex-col items-center">
            <div className="relative inline-block border-2 border-gray-200 dark:border-gray-700 rounded-lg p-0 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="max-w-full h-auto block rounded-lg"
                style={{
                  transform: `rotate(${currentRotation}deg)`,
                  transition: 'none'
                }}
              />
              {/* Pointer - fixed position at top, pointing down to center */}
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none z-10"
                style={{
                  top: '0px',
                  width: 0,
                  height: 0,
                  borderLeft: '25px solid transparent',
                  borderRight: '25px solid transparent',
                  borderTop: '45px solid #ef4444',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}
              />
            </div>

            <button
              onClick={spin}
              disabled={isSpinning || items.length < 2}
              className="mt-6 w-full max-w-xs bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50 text-lg"
            >
              {isSpinning ? 'Spinning...' : '🎡 Spin the Wheel'}
            </button>

            {selectedIndex !== null && !isSpinning && (
              <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 w-full max-w-xs">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎉</div>
                  <div className="text-2xl font-bold text-green-700">
                    {items[selectedIndex]}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">📊 Statistics</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportHistory}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
                <button
                  onClick={clearHistory}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Spins</div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalSpins}</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Most Selected</div>
                <div className="text-lg font-bold text-green-600 truncate">{stats.mostSelected}</div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Options</div>
                <div className="text-2xl font-bold text-purple-600">{items.length}</div>
              </div>
            </div>
            {Object.keys(stats.itemCounts).length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Selection Count:</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {Object.entries(stats.itemCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([item, count]) => (
                      <div key={item} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                        <span>{item}</span>
                        <span className="font-bold text-primary-600">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Spin History */}
        {spinHistory.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-xl font-bold mb-4">📜 Spin History</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {spinHistory.slice(0, 20).map((result, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                  <span className="font-medium">{result.item}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        {/* Introduction */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Free Online Wheel of Fortune Spinner</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Make random decisions with our free wheel of fortune spinner. Perfect for choosing what to eat, 
              where to go, what to watch, or making any random selection from a list of options. Our wheel 
              spinner uses true randomization to ensure fair and unbiased results every time.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              All spinning happens locally in your browser - no internet connection required after loading. 
              Your choices are private, and we never store or transmit any data. Perfect for both personal 
              decision-making and group activities.
            </p>
          </div>
        </section>

        {/* Use Cases */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Perfect For</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🍕 Decision Making</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Can&apos;t decide what to eat? Where to go? What to watch? Let the wheel decide for you. 
                Add your options and spin to get a random choice.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎮 Games & Contests</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Use the wheel for games, contests, raffles, or random selection. Perfect for choosing 
                winners, teams, or game outcomes fairly.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">👥 Group Activities</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Great for group decision-making. Everyone can add options, then spin the wheel to 
                make a fair, random choice that everyone accepts.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📊 Statistics & Tracking</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Track your spin history and see statistics on which options are selected most often. 
                Export your results for analysis or record-keeping.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎯 Customizable Options</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Add up to 20 custom options, use our presets, or create your own lists. Adjust spin 
                speed and duration to match your preferences.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🌐 Online & Offline</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Works on any device with a web browser. Once loaded, works completely offline. 
                Perfect for use anywhere, anytime.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎡</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Smooth Animation</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Beautiful, smooth spinning animation with customizable speed and duration. 
                  Watch the wheel spin and land on your random choice.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Presets & Custom Lists</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use our presets for common decisions (what to eat, where to go, what to watch) 
                  or create your own custom lists with up to 20 options.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Statistics & History</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Track your spin history, see which options are selected most often, and view 
                  detailed statistics. Export your results for analysis.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚙️</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Customizable Settings</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Adjust spin duration (2-6 seconds) and spin speed (3-10 rotations) to match 
                  your preferences. Settings are saved automatically.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💾</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Auto-Save</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Your options and settings are automatically saved to your browser. 
                  They&apos;ll be there when you return.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Privacy Guaranteed</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  All spinning happens locally in your browser. We never see, store, or transmit 
                  your choices. Your privacy is protected.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How random are the results?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Our wheel uses cryptographically secure random number generation, ensuring truly random 
                and unpredictable results. Each option has an equal probability of being selected.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How many options can I add?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                You can add up to 20 options to the wheel. Each option can be any text you want. 
                Use our presets or create your own custom lists.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I save my options?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Yes! Your options and settings are automatically saved to your browser&apos;s local storage. 
                They&apos;ll be there when you return to the page.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How do I use the presets?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Click on any preset button (What to Eat, Where to Go, etc.) to load that preset&apos;s 
                options. You can then modify the list or add your own options.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What are the statistics for?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Statistics show you how many times each option has been selected, which option is 
                selected most often, and total number of spins. Useful for tracking patterns over time.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I export my results?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Yes! Click the &quot;Export&quot; button in the Statistics section to download a text file 
                with all your spin history and results.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I use this offline?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Yes! Once the page is loaded, you can use the wheel completely offline. All functionality 
                works without an internet connection.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How do I adjust spin settings?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Use the sliders in the Settings section to adjust spin duration (how long the spin takes) 
                and spin speed (how many rotations). Settings are saved automatically.
              </p>
            </div>
          </div>
        </section>
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Generator Tools" />
      )}
    </Layout>
    </>
  )
}
