'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'

type SortOrder = 'none' | 'asc' | 'desc'
type Preset = 'lottery' | 'range' | 'custom'

export default function NumberGeneratorPage() {
  const [min, setMin] = useState(1)
  const [max, setMax] = useState(100)
  const [count, setCount] = useState(1)
  const [allowDuplicates, setAllowDuplicates] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [results, setResults] = useState<number[]>([])
  const [totalGenerated, setTotalGenerated] = useState(0)
  const [preset, setPreset] = useState<Preset>('custom')

  const applyPreset = useCallback((presetType: Preset) => {
    setPreset(presetType)
    switch (presetType) {
      case 'lottery':
        setMin(1)
        setMax(49)
        setCount(6)
        setAllowDuplicates(false)
        setSortOrder('asc')
        break
      case 'range':
        setMin(1)
        setMax(1000)
        setCount(10)
        setAllowDuplicates(false)
        setSortOrder('asc')
        break
      case 'custom':
        // Keep current settings
        break
    }
  }, [])

  const generate = useCallback(() => {
    if (min >= max) {
      alert('Minimum must be less than maximum')
      return
    }

    if (!allowDuplicates && count > (max - min + 1)) {
      alert('Cannot generate unique numbers. Increase the range or decrease the count.')
      return
    }

    const numbers: number[] = []
    const used = new Set<number>()

    while (numbers.length < count) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min
      if (allowDuplicates || !used.has(num)) {
        numbers.push(num)
        used.add(num)
      }
    }

    let sortedNumbers = [...numbers]
    if (sortOrder === 'asc') {
      sortedNumbers.sort((a, b) => a - b)
    } else if (sortOrder === 'desc') {
      sortedNumbers.sort((a, b) => b - a)
    }

    setResults(sortedNumbers)
    setTotalGenerated(prev => prev + sortedNumbers.length)
  }, [min, max, count, allowDuplicates, sortOrder])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const copyAll = () => {
    navigator.clipboard.writeText(results.join(', '))
  }

  const exportToFile = () => {
    if (results.length === 0) return
    
    const content = results.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `random-numbers-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      min,
      max,
      count,
      allowDuplicates,
      sortOrder,
      preset
    }
    localStorage.setItem('numberGeneratorSettings', JSON.stringify(settings))
  }, [min, max, count, allowDuplicates, sortOrder, preset])

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('numberGeneratorSettings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        setMin(settings.min || 1)
        setMax(settings.max || 100)
        setCount(settings.count || 1)
        setAllowDuplicates(settings.allowDuplicates !== undefined ? settings.allowDuplicates : false)
        setSortOrder(settings.sortOrder || 'asc')
        setPreset(settings.preset || 'custom')
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  return (
    <Layout
      title="🎲 Random Number Generator"
      description="Generate random numbers for lotteries, games, testing, and more. Free online random number generator with customizable range, sorting, and export options."
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6">
          {/* Presets */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => applyPreset('lottery')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  preset === 'lottery'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🎰 Lottery (1-49, 6 numbers)
              </button>
              <button
                onClick={() => applyPreset('range')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  preset === 'range'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                📊 Range (1-1000, 10 numbers)
              </button>
              <button
                onClick={() => applyPreset('custom')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  preset === 'custom'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                ⚙️ Custom
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum
                </label>
                <input
                  type="number"
                  value={min}
                  onChange={(e) => {
                    setMin(Number(e.target.value))
                    setPreset('custom')
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum
                </label>
                <input
                  type="number"
                  value={max}
                  onChange={(e) => {
                    setMax(Number(e.target.value))
                    setPreset('custom')
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Count: <span className="text-primary-600 font-bold">{count}</span>
              </label>
              <input
                type="range"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => {
                  setCount(Number(e.target.value))
                  setPreset('custom')
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>1000</span>
              </div>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => {
                  const val = Math.min(1000, Math.max(1, Number(e.target.value)))
                  setCount(val)
                  setPreset('custom')
                }}
                className="w-full mt-2 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDuplicates}
                  onChange={(e) => {
                    setAllowDuplicates(e.target.checked)
                    setPreset('custom')
                  }}
                  className="w-4 h-4 accent-primary-600"
                />
                <span className="text-sm">Allow duplicates</span>
              </label>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value as SortOrder)
                    setPreset('custom')
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="none">No sorting</option>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            <button
              onClick={generate}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
            >
              Generate {count > 1 ? `${count} Numbers` : 'Number'}
            </button>

            {totalGenerated > 0 && (
              <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-200">
                Total generated: <span className="font-semibold text-primary-600">{totalGenerated}</span> numbers
              </div>
            )}
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-bold">Generated Numbers:</h3>
              <div className="flex gap-2">
                <button
                  onClick={exportToFile}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
                <button
                  onClick={copyAll}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  Copy All
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {results.map((num, index) => (
                <div
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-primary-100 to-primary-200 rounded-lg font-bold text-primary-700 border border-primary-300"
                >
                  {num}
                </div>
              ))}
            </div>
            {results.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Min</div>
                  <div className="font-bold text-gray-900">{Math.min(...results)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Max</div>
                  <div className="font-bold text-gray-900">{Math.max(...results)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Sum</div>
                  <div className="font-bold text-gray-900">{results.reduce((a, b) => a + b, 0)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Average</div>
                  <div className="font-bold text-gray-900">
                    {(results.reduce((a, b) => a + b, 0) / results.length).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        {/* Introduction */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What is a Random Number Generator?</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              A random number generator is a tool that produces unpredictable numbers within a specified range. 
              Our free online random number generator uses cryptographically secure algorithms to ensure true 
              randomness, making it perfect for lotteries, games, statistical sampling, testing, and any application 
              where unbiased random selection is required.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Whether you need a single random number or thousands, our generator provides complete control over 
              the range, quantity, sorting, and whether duplicates are allowed. All generation happens locally 
              in your browser, ensuring privacy and security.
            </p>
          </div>
        </section>

        {/* Use Cases */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🎰 Lotteries and Games</h3>
              <p className="text-gray-700 text-sm">
                Generate lottery numbers, raffle winners, or random selections for games. Our preset makes it easy 
                to generate 6 unique numbers from 1-49, perfect for many lottery formats.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Statistical Sampling</h3>
              <p className="text-gray-700 text-sm">
                Create random samples for surveys, experiments, or data analysis. Generate unique random numbers 
                to select participants or data points without bias.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🧪 Testing and Development</h3>
              <p className="text-gray-700 text-sm">
                Generate test data, random IDs, or sample values for software testing. Perfect for creating 
                realistic test scenarios and edge cases.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🎲 Gaming and Simulations</h3>
              <p className="text-gray-700 text-sm">
                Generate random events or create unpredictable game mechanics. Customize the range for any game 
                scenario or simulation needs.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Random Selection</h3>
              <p className="text-gray-700 text-sm">
                Pick random winners, assign random tasks, or make unbiased selections. Generate unique numbers 
                to ensure fair and transparent random choices.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Educational Purposes</h3>
              <p className="text-gray-700 text-sm">
                Teach probability, statistics, or random processes. Generate random datasets for students to 
                analyze and understand randomness concepts.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎲</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">True Randomness</h3>
                <p className="text-gray-700 text-sm">
                  Uses cryptographically secure random number generation to ensure truly unpredictable results. 
                  No patterns or biases in the generated numbers.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚙️</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Fully Customizable</h3>
                <p className="text-gray-700 text-sm">
                  Set any minimum and maximum range, generate from 1 to 1000 numbers, choose sorting options, 
                  and control whether duplicates are allowed.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Quick Presets</h3>
                <p className="text-gray-700 text-sm">
                  Use our presets for common scenarios - lottery numbers, dice rolls, or custom ranges. 
                  One click to configure everything.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Statistics</h3>
                <p className="text-gray-700 text-sm">
                  Automatically calculates minimum, maximum, sum, and average of generated numbers. 
                  Perfect for quick analysis of your random sample.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📥</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Export Options</h3>
                <p className="text-gray-700 text-sm">
                  Copy all numbers at once or export to a text file. Easy integration into spreadsheets, 
                  databases, or other applications.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Privacy Guaranteed</h3>
                <p className="text-gray-700 text-sm">
                  All number generation happens locally in your browser. We never see, store, or transmit 
                  any generated numbers. Your privacy is protected.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Probability & Statistics Reference */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding Probability & Statistics</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Randomness and Probability</h3>
              <p className="text-gray-700 text-sm mb-3">
                True randomness means that each possible outcome has an equal chance of occurring, with no pattern or 
                predictability. In a fair random number generator, every number in your specified range has the same 
                probability of being selected, regardless of previous selections.
              </p>
              <p className="text-gray-700 text-sm">
                The probability of any specific number being generated is 1 divided by the total number of possible 
                outcomes. For example, if generating numbers from 1 to 100, each number has a 1% (1/100) chance of 
                being selected in any single generation.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Uniform Distribution</h3>
              <p className="text-gray-700 text-sm mb-3">
                Our generator produces numbers with a uniform distribution, meaning each number in the range is equally 
                likely. This is ideal for fair lotteries, random sampling, and unbiased selection processes.
              </p>
              <p className="text-gray-700 text-sm">
                Over many generations, you should see numbers distributed relatively evenly across your range. However, 
                in small samples, you might see clusters or gaps - this is normal and expected in truly random sequences.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistical Analysis</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Mean (Average)</h4>
                  <p className="text-gray-700 text-sm">
                    The sum of all numbers divided by the count. For a uniform distribution over range [min, max], 
                    the expected mean is (min + max) / 2. Our statistics show the actual mean of your generated numbers.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Minimum and Maximum</h4>
                  <p className="text-gray-700 text-sm">
                    The smallest and largest values in your generated set. These help you verify that all numbers 
                    fall within your specified range and identify any outliers.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Sum</h4>
                  <p className="text-gray-700 text-sm">
                    The total of all generated numbers. Useful for verification, statistical analysis, or when 
                    you need the cumulative value of your random numbers.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Practical Applications</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
                <li><strong>Lottery Numbers:</strong> Generate unique numbers within a specific range (e.g., 1-49) without duplicates.</li>
                <li><strong>Random Sampling:</strong> Select random samples from a population for statistical analysis or testing.</li>
                <li><strong>Simulation:</strong> Use random numbers to model real-world processes with inherent randomness.</li>
                <li><strong>Fair Selection:</strong> Ensure unbiased random selection for contests, assignments, or decision-making.</li>
                <li><strong>Testing:</strong> Generate random test data for software testing, quality assurance, or stress testing.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Understanding Duplicates</h3>
              <p className="text-gray-700 text-sm mb-3">
                When duplicates are allowed, the same number can appear multiple times. This follows the principle of 
                "sampling with replacement" - each generation is independent, and previous results don't affect future ones.
              </p>
              <p className="text-gray-700 text-sm">
                When duplicates are disabled, each number appears at most once. This is "sampling without replacement" 
                and is useful for lotteries, unique ID generation, or when you need distinct values. Note that you cannot 
                generate more unique numbers than your range allows (max - min + 1).
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Law of Large Numbers</h3>
              <p className="text-gray-700 text-sm">
                As you generate more numbers, the actual distribution will converge toward the theoretical uniform 
                distribution. With small samples, you might see apparent patterns or biases, but these are just 
                statistical fluctuations. True randomness doesn't guarantee uniform distribution in small samples - 
                it guarantees unpredictability.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How random are the generated numbers?</h3>
              <p className="text-gray-700 text-sm">
                Our generator uses cryptographically secure random number generation, ensuring truly unpredictable 
                results. The numbers are generated using browser-based cryptographic APIs that provide high-quality 
                randomness suitable for most applications.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I generate duplicate numbers?</h3>
              <p className="text-gray-700 text-sm">
                Yes! You can choose whether to allow duplicates. When duplicates are disabled, each number in the 
                result will be unique. When enabled, the same number may appear multiple times in your results.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What's the difference between sorting options?</h3>
              <p className="text-gray-700 text-sm">
                "No sorting" keeps numbers in the order they were generated. "Ascending" sorts from lowest to 
                highest. "Descending" sorts from highest to lowest. Sorting is useful for lotteries, statistics, 
                or when you need organized results.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How many numbers can I generate at once?</h3>
              <p className="text-gray-700 text-sm">
                You can generate up to 1000 numbers in a single batch. If you need more, simply generate another 
                batch. There are no limits on the total number of numbers you can generate.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Are the numbers truly random?</h3>
              <p className="text-gray-700 text-sm">
                Yes, our generator uses cryptographically secure pseudorandom number generation. While technically 
                pseudorandom (generated by algorithms), the results are statistically random and unpredictable 
                for all practical purposes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I use this for lottery numbers?</h3>
              <p className="text-gray-700 text-sm">
                Our generator is perfect for creating lottery number combinations. Use the lottery preset (1-49, 
                6 numbers) or customize for your specific lottery format. Remember, all number combinations have 
                equal probability of winning.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do you store the generated numbers?</h3>
              <p className="text-gray-700 text-sm">
                No, absolutely not. All number generation happens entirely in your browser. We never see, store, 
                transmit, or have any access to the numbers you generate. Your privacy is completely protected.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

