'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import Layout from '@/components/Layout'
type AnimationType = 'fade' | 'slide' | 'rotate' | 'scale' | 'bounce' | 'custom'
type Easing = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'cubic-bezier'

interface Preset {
  name: string
  type: AnimationType
  keyframes: string
}

const presets: Preset[] = [
  {
    name: 'Fade In',
    type: 'fade',
    keyframes: 'from { opacity: 0; }\nto { opacity: 1; }'
  },
  {
    name: 'Fade Out',
    type: 'fade',
    keyframes: 'from { opacity: 1; }\nto { opacity: 0; }'
  },
  {
    name: 'Slide In Right',
    type: 'slide',
    keyframes: 'from { transform: translateX(100%); }\nto { transform: translateX(0); }'
  },
  {
    name: 'Slide In Left',
    type: 'slide',
    keyframes: 'from { transform: translateX(-100%); }\nto { transform: translateX(0); }'
  },
  {
    name: 'Rotate',
    type: 'rotate',
    keyframes: 'from { transform: rotate(0deg); }\nto { transform: rotate(360deg); }'
  },
  {
    name: 'Scale Up',
    type: 'scale',
    keyframes: 'from { transform: scale(0); }\nto { transform: scale(1); }'
  },
  {
    name: 'Bounce',
    type: 'bounce',
    keyframes: '0%, 100% { transform: translateY(0); }\n50% { transform: translateY(-20px); }'
  }
]

export default function CSSAnimationGeneratorPage() {
  const [animationName, setAnimationName] = useState('myAnimation')
  const [keyframes, setKeyframes] = useState('from { opacity: 0; }\nto { opacity: 1; }')
  const [duration, setDuration] = useState(1)
  const [delay, setDelay] = useState(0)
  const [iteration, setIteration] = useState<number | 'infinite'>(1)
  const [direction, setDirection] = useState<'normal' | 'reverse' | 'alternate' | 'alternate-reverse'>('normal')
  const [easing, setEasing] = useState<Easing>('ease')
  const [fillMode, setFillMode] = useState<'none' | 'forwards' | 'backwards' | 'both'>('none')
  const [playState, setPlayState] = useState<'running' | 'paused'>('running')
  const cssCode = useMemo(() => {
    const animationValue = `${animationName} ${duration}s ${easing} ${delay}s ${iteration} ${direction} ${fillMode} ${playState}`
    return `@keyframes ${animationName} {\n${keyframes}\n}\n\n.element {\n  animation: ${animationValue};\n}`
  }, [animationName, keyframes, duration, delay, iteration, direction, easing, fillMode, playState])

  const applyPreset = useCallback((preset: Preset) => {
    setKeyframes(preset.keyframes)
    setAnimationName(preset.name.toLowerCase().replace(/\s+/g, '-'))
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Silent fail
    }
  }

  // Inject keyframes dynamically
  useEffect(() => {
    const styleId = 'dynamic-keyframes'
    let styleElement = document.getElementById(styleId) as HTMLStyleElement
    
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }
    
    styleElement.textContent = `@keyframes ${animationName} {\n${keyframes}\n}`
    
    return () => {
      // Cleanup on unmount
      const element = document.getElementById(styleId)
      if (element) {
        element.remove()
      }
    }
  }, [animationName, keyframes])

  return (
    <Layout
      title="🎬 CSS Animation Generator"
      description="Generate CSS animations and keyframes online. Create fade, slide, rotate, scale, and bounce animations."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6">
          <div className="space-y-6">
            {/* Preview */}
            <div className="flex items-center justify-center p-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-xl">
              <div
                className="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg shadow-lg"
                style={{
                  animation: `${animationName} ${duration}s ${easing} ${delay}s ${iteration} ${direction} ${fillMode} ${playState}`,
                  animationName: animationName
                }}
              />
            </div>

            {/* Animation Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Animation Name
              </label>
              <input
                type="text"
                value={animationName}
                onChange={(e) => setAnimationName(e.target.value.replace(/\s+/g, '-'))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
              />
            </div>

            {/* Presets */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Quick Presets
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyframes Editor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Keyframes
              </label>
              <textarea
                value={keyframes}
                onChange={(e) => setKeyframes(e.target.value)}
                placeholder="from { opacity: 0; }\nto { opacity: 1; }"
                className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use CSS keyframe syntax: from/to or 0%/50%/100%
              </p>
            </div>

            {/* Animation Properties */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Duration: {duration}s
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={duration}
                  onChange={(e) => setDuration(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Delay: {delay}s
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={delay}
                  onChange={(e) => setDelay(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Iteration Count
                </label>
                <select
                  value={iteration}
                  onChange={(e) => setIteration(e.target.value === 'infinite' ? 'infinite' : parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value="infinite">Infinite</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Direction
                </label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as typeof direction)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="normal">Normal</option>
                  <option value="reverse">Reverse</option>
                  <option value="alternate">Alternate</option>
                  <option value="alternate-reverse">Alternate Reverse</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Easing
                </label>
                <select
                  value={easing}
                  onChange={(e) => setEasing(e.target.value as Easing)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="ease">Ease</option>
                  <option value="ease-in">Ease In</option>
                  <option value="ease-out">Ease Out</option>
                  <option value="ease-in-out">Ease In Out</option>
                  <option value="linear">Linear</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Fill Mode
                </label>
                <select
                  value={fillMode}
                  onChange={(e) => setFillMode(e.target.value as typeof fillMode)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="none">None</option>
                  <option value="forwards">Forwards</option>
                  <option value="backwards">Backwards</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Play State
                </label>
                <select
                  value={playState}
                  onChange={(e) => setPlayState(e.target.value as typeof playState)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="running">Running</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            {/* CSS Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  CSS Code
                </label>
                <button
                  onClick={() => copyToClipboard(cssCode)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Copy CSS
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
                  <code>{cssCode}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 mt-10">
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Use the CSS Animation Generator</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            <li>Pick a preset (Fade, Slide, Rotate, Scale, Bounce) or edit the keyframes manually.</li>
            <li>Adjust the animation name, duration, delay, iteration count, direction, easing, fill mode, and play state.</li>
            <li>Watch the live preview update in real time as you tweak the parameters.</li>
            <li>Copy the generated CSS code and paste it into your project&rsquo;s stylesheet.</li>
          </ol>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Tip: Rename the animation to something descriptive (e.g., <code className="font-mono">hero-fade-in</code>) before exporting.
          </p>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Supported Animation Types</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Visual Presets</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Fade In / Fade Out</li>
                <li>Slide In (Left / Right)</li>
                <li>Rotate loops</li>
                <li>Scale Up / Down</li>
                <li>Bouncing motion</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Custom Keyframes</h3>
              <p className="leading-relaxed">
                Craft bespoke animations by mixing <code className="font-mono">from / to</code> or percentage-based keyframes. Add transforms, opacity changes, or any CSS property supported inside <code className="font-mono">@keyframes</code>.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Best Practices</h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed list-disc list-inside">
            <li>Keep animations short (<code className="font-mono">0.3s – 1s</code>) for UI interactions to avoid sluggish interfaces.</li>
            <li>Use <code className="font-mono">ease-in-out</code> for natural movement and <code className="font-mono">linear</code> for continuous loops.</li>
            <li>Combine <code className="font-mono">fill-mode: both</code> with delays to keep elements in their final state.</li>
            <li>Disable or reduce animations for users who prefer reduced motion (use the <code className="font-mono">@media (prefers-reduced-motion)</code> media query).</li>
          </ul>
        </section>
      </div>

      </Layout>
  )
}

