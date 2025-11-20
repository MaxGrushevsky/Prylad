'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

interface Dice {
  sides: number
  count: number
  bonus: number
}

interface RollResult {
  rolls: number[]
  total: number
  bonus: number
  timestamp: number
}

interface RollHistory {
  dice: Dice
  result: RollResult
}

const standardDice = [4, 6, 8, 10, 12, 20, 100]

type Preset = 'custom'

export default function DiceRollerPage() {
  const [dice, setDice] = useState<Dice[]>([
    { sides: 20, count: 1, bonus: 0 }
  ])
  const [results, setResults] = useState<RollResult[]>([])
  const [resultDice, setResultDice] = useState<Dice[]>([]) // Store dice config for results
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null)
  const [coinHistory, setCoinHistory] = useState<Array<'heads' | 'tails'>>([])
  const [rollHistory, setRollHistory] = useState<RollHistory[]>([])
  const [preset, setPreset] = useState<Preset>('custom')
  const [totalRolls, setTotalRolls] = useState(0)

  const rollDice = useCallback((sides: number, count: number, bonus: number): RollResult => {
    const rolls: number[] = []
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1)
    }
    const total = rolls.reduce((sum, roll) => sum + roll, 0) + bonus
    return { rolls, total, bonus, timestamp: Date.now() }
  }, [])

  const quickRoll = useCallback((sides: number) => {
    const diceConfig = { sides, count: 1, bonus: 0 }
    const result = rollDice(sides, 1, 0)
    setResults([result])
    setResultDice([diceConfig])
    setTotalRolls(prev => prev + 1)
    setRollHistory(prev => [{
      dice: diceConfig,
      result
    }, ...prev].slice(0, 50))
  }, [rollDice])

  const rollAll = useCallback(() => {
    const newResults = dice.map(d => rollDice(d.sides, d.count, d.bonus))
    setResults(newResults)
    setResultDice([...dice])
    setTotalRolls(prev => prev + 1)
    
    // Add to history
    dice.forEach((d, index) => {
      setRollHistory(prev => [{
        dice: { ...d },
        result: newResults[index]
      }, ...prev].slice(0, 50)) // Keep last 50 rolls
    })
  }, [dice, rollDice])

  const addDice = () => {
    setDice([...dice, { sides: 20, count: 1, bonus: 0 }])
  }

  const removeDice = (index: number) => {
    if (dice.length > 1) {
      setDice(dice.filter((_, i) => i !== index))
    }
  }

  const updateDice = (index: number, field: keyof Dice, value: number) => {
    const newDice = [...dice]
    newDice[index] = { ...newDice[index], [field]: value }
    setDice(newDice)
  }

  const flipCoin = () => {
    const result: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails'
    setCoinResult(result)
    setCoinHistory(prev => [result, ...prev].slice(0, 20)) // Keep last 20 flips
  }

  const clearHistory = () => {
    setRollHistory([])
    setCoinHistory([])
  }

  const exportResults = () => {
    if (rollHistory.length === 0 && coinHistory.length === 0) return
    
    let content = 'Dice Roll History\n'
    content += '='.repeat(30) + '\n\n'
    
    if (rollHistory.length > 0) {
      content += 'Dice Rolls:\n'
      rollHistory.forEach((entry, index) => {
        const diceStr = `${entry.dice.count}d${entry.dice.sides}${entry.dice.bonus !== 0 ? (entry.dice.bonus > 0 ? '+' : '') + entry.dice.bonus : ''}`
        content += `${index + 1}. ${diceStr}: [${entry.result.rolls.join(', ')}] = ${entry.result.total}\n`
      })
      content += '\n'
    }
    
    if (coinHistory.length > 0) {
      content += 'Coin Flips:\n'
      coinHistory.forEach((result, index) => {
        content += `${index + 1}. ${result}\n`
      })
    }
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dice-rolls-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const totalResult = results.reduce((sum, r) => sum + r.total, 0)

  // Calculate statistics
  const stats = rollHistory.length > 0 ? {
    totalRolls: rollHistory.length,
    averageRoll: rollHistory.reduce((sum, entry) => sum + entry.result.total, 0) / rollHistory.length,
    minRoll: Math.min(...rollHistory.map(e => e.result.total)),
    maxRoll: Math.max(...rollHistory.map(e => e.result.total)),
    natural20s: rollHistory.filter(e => e.dice.sides === 20 && e.result.rolls.some(r => r === 20)).length,
    natural1s: rollHistory.filter(e => e.dice.sides === 20 && e.result.rolls.some(r => r === 1)).length
  } : null

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      dice,
      preset
    }
    localStorage.setItem('diceRollerSettings', JSON.stringify(settings))
  }, [dice, preset])

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('diceRollerSettings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        if (settings.dice) {
          setDice(settings.dice)
        }
        if (settings.preset) {
          setPreset(settings.preset)
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  // SEO data
  const toolPath = '/dice-roller'
  const toolName = 'Dice Roller'
  const category = 'generator'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "How do I roll dice?",
      answer: "Add dice to your roll by clicking 'Add Die', select the number of sides (4, 6, 8, 10, 12, 20, 100, or custom), set the count (how many dice), add a bonus if needed, then click 'Roll All' to roll all dice at once."
    },
    {
      question: "What dice types are supported?",
      answer: "Standard dice: d4, d6, d8, d10, d12, d20, d100. You can also create custom dice with any number of sides. Perfect for D&D, Pathfinder, and other tabletop RPGs."
    },
    {
      question: "Can I add bonuses to dice rolls?",
      answer: "Yes! Set a bonus value for each die. The bonus is added to the total roll result. This is useful for D&D ability modifiers, skill bonuses, and other game mechanics."
    },
    {
      question: "What statistics are tracked?",
      answer: "The tool tracks: total rolls, average roll, highest roll, lowest roll, and roll distribution. Statistics are calculated for all dice types you've rolled."
    },
    {
      question: "Can I see my roll history?",
      answer: "Yes! The roll history shows all your previous rolls with timestamps. You can see the individual dice results, totals, and bonuses for each roll."
    },
    {
      question: "Is the dice roller free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All dice rolling happens in your browser - we never see or store your rolls."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Add Dice",
      text: "Click 'Add Die' to add a die to your roll. Select the number of sides (4, 6, 8, 10, 12, 20, 100, or custom), set the count (how many dice of this type), and add a bonus if needed."
    },
    {
      name: "Configure Dice",
      text: "For each die, set the number of sides, count (how many dice), and bonus (optional modifier). You can add multiple dice types to roll them all together."
    },
    {
      name: "Roll Dice",
      text: "Click 'Roll All' to roll all dice at once. See the individual results for each die, the total, and any bonuses applied."
    },
    {
      name: "View Statistics",
      text: "See statistics for your rolls: total rolls, average, highest, lowest, and distribution. Statistics help you track your rolling patterns."
    },
    {
      name: "Check History",
      text: "View your roll history to see all previous rolls with timestamps. Useful for tracking game sessions or analyzing results."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Roll Dice Online",
      "Learn how to roll dice online for D&D, tabletop games, and more using our free online dice roller tool.",
      howToSteps,
      "PT2M"
    ),
    generateSoftwareApplicationSchema(
      "Dice Roller",
      "Free online dice roller. Roll dice for D&D, tabletop games, and more. Multiple dice types, bonuses, history tracking, and statistics. Perfect for D&D 5e, Pathfinder, and other RPGs.",
      "https://prylad.pro/dice-roller",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🎲 Dice Roller & Coin Flip"
        description="Roll dice for D&D, tabletop games, and more. Free online dice roller with multiple dice types, bonuses, history tracking, and statistics. Perfect for D&D 5e, Pathfinder, and other RPGs."
        breadcrumbs={breadcrumbs}
      >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Quick Roll Dice */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
            Quick Roll
          </label>
          <div className="flex flex-wrap gap-2 justify-center">
            {[2, 3, 4, 6, 8, 10, 12, 20, 100].map(sides => (
              <button
                key={sides}
                onClick={() => quickRoll(sides)}
                className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                d{sides}
              </button>
            ))}
          </div>
        </div>

        {/* Coin */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">🪙 Coin Flip</h2>
            {coinHistory.length > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                History: {coinHistory.filter(h => h === 'heads').length}H / {coinHistory.filter(h => h === 'tails').length}T
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={flipCoin}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-4xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              {coinResult === null ? '🪙' : coinResult === 'heads' ? '👑' : '⚫'}
            </button>
            {coinResult && (
              <div className="text-2xl font-bold">
                {coinResult === 'heads' ? 'Heads!' : 'Tails!'}
              </div>
            )}
            {coinHistory.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {coinHistory.slice(0, 10).map((result, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      result === 'heads' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {result === 'heads' ? 'H' : 'T'}
                  </span>
                ))}
                {coinHistory.length > 10 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">+{coinHistory.length - 10} more</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dice */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-bold">🎲 Dice</h2>
            <div className="flex gap-2">
              {totalRolls > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  Total rolls: <span className="font-semibold text-primary-600 ml-1">{totalRolls}</span>
                </div>
              )}
              <button
                onClick={addDice}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                + Add Dice
              </button>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {dice.map((d, index) => (
              <div key={index} className="flex flex-wrap gap-3 items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Count:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={d.count}
                    onChange={(e) => updateDice(index, 'count', Math.max(1, Number(e.target.value)))}
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <span className="text-lg font-bold">d</span>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Sides:</label>
                  <select
                    value={d.sides}
                    onChange={(e) => updateDice(index, 'sides', Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    {standardDice.map(s => (
                      <option key={s} value={s}>d{s}</option>
                    ))}
                    <option value="2">d2</option>
                    <option value="3">d3</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Bonus:</label>
                  <input
                    type="number"
                    value={d.bonus}
                    onChange={(e) => updateDice(index, 'bonus', Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                {dice.length > 1 && (
                  <button
                    onClick={() => removeDice(index)}
                    className="ml-auto text-red-600 hover:text-red-700 dark:text-red-400 font-bold"
                    title="Remove dice"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={rollAll}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
          >
            Roll All Dice
          </button>

          {results.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-bold">Results:</h3>
              {results.map((result, index) => {
                const diceConfig = resultDice[index] || dice[index] || { count: 1, sides: 20, bonus: 0 }
                return (
                  <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">
                          {diceConfig.count}d{diceConfig.sides}
                          {diceConfig.bonus !== 0 && (
                            <span className={diceConfig.bonus > 0 ? 'text-green-600' : 'text-red-600 dark:text-red-400'}>
                              {diceConfig.bonus > 0 ? '+' : ''}{diceConfig.bonus}
                            </span>
                          )}
                        </span>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Rolls: {result.rolls.join(', ')} = {result.total - result.bonus}
                          {result.bonus !== 0 && (
                            <span className={result.bonus > 0 ? 'text-green-600' : 'text-red-600 dark:text-red-400'}>
                              {result.bonus > 0 ? ' +' : ' '}{result.bonus}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary-600">
                        {result.total}
                      </div>
                    </div>
                  </div>
                )
              })}
              {results.length > 1 && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-300">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total:</span>
                    <span className="text-3xl font-bold text-purple-600">{totalResult}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Statistics */}
        {stats && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">📊 Statistics</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportResults}
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
                  Clear History
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Rolls</div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalRolls}</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Average</div>
                <div className="text-2xl font-bold text-green-600">{stats.averageRoll.toFixed(1)}</div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">Min / Max</div>
                <div className="text-2xl font-bold text-purple-600">{stats.minRoll} / {stats.maxRoll}</div>
              </div>
              {stats.natural20s > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Natural 20s</div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.natural20s}</div>
                </div>
              )}
              {stats.natural1s > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Natural 1s</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.natural1s}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Roll History */}
        {rollHistory.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-xl font-bold mb-4">📜 Roll History</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {rollHistory.slice(0, 20).map((entry, index) => {
                const diceStr = `${entry.dice.count}d${entry.dice.sides}${entry.dice.bonus !== 0 ? (entry.dice.bonus > 0 ? '+' : '') + entry.dice.bonus : ''}`
                return (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                    <span className="font-mono">{diceStr}: [{entry.result.rolls.join(', ')}] = {entry.result.total}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(entry.result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto mt-16 space-y-8">
        {/* Introduction */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Online Dice Roller for Tabletop Games</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Our free online dice roller is perfect for D&D, Pathfinder, and other tabletop role-playing games. 
              Roll multiple dice types simultaneously, add bonuses, track your roll history, and view statistics. 
              Whether you&apos;re playing D&D 5e, rolling for attacks, skill checks, or damage, our dice roller has you covered.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              All dice rolling happens locally in your browser - no internet connection required after loading. 
              Your rolls are private, and we never store or transmit any data. Perfect for both online and offline gaming sessions.
            </p>
          </div>
        </section>

        {/* Use Cases */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Perfect For</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎲 D&D 5e</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Roll d20 for attacks and skill checks, d6 for damage, or any combination. Our presets make it easy 
                to roll common D&D combinations with bonuses already applied.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">⚔️ Pathfinder</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Roll multiple dice types simultaneously for complex attacks and spells. Track your roll history 
                to analyze your luck throughout the session.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🎯 Board Games</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Need dice for board games? Roll standard d6 dice or any custom combination. Perfect for games 
                that require multiple dice or special dice types.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🪙 Decision Making</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Use our coin flip feature for quick decisions. Track your flip history to see patterns or just 
                make random choices fairly.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📊 Statistics & Analysis</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                View statistics on your rolls including averages, min/max values, and count natural 20s and 1s. 
                Export your roll history for analysis or record-keeping.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🌐 Online Gaming</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Perfect for online D&D sessions, virtual tabletop games, or when you don&apos;t have physical dice. 
                Works on any device with a web browser.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎲</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Multiple Dice Types</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Roll d4, d6, d8, d10, d12, d20, d100, or any custom number of sides. Roll multiple dice 
                  simultaneously and combine results.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">➕</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Bonuses & Modifiers</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Add positive or negative modifiers to your rolls. Perfect for D&D ability modifiers, 
                  proficiency bonuses, or any game mechanics.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Quick Presets</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Use our presets for common D&D rolls - d20, d6, attack rolls, or skill checks. One click 
                  to configure everything.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Statistics & History</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Track your roll history, view statistics, and see natural 20s and 1s. Export your history 
                  for analysis or record-keeping.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🪙</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Coin Flip</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Flip a virtual coin for quick decisions. Track your flip history to see heads/tails distribution.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Privacy Guaranteed</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  All dice rolling happens locally in your browser. We never see, store, or transmit your rolls. 
                  Your gaming privacy is protected.
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
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How random are the dice rolls?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Our dice roller uses cryptographically secure random number generation, ensuring truly random 
                and unpredictable results. Each roll is independent and has equal probability for all outcomes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I roll multiple dice at once?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Yes! You can add multiple dice sets and roll them all simultaneously. Each dice set can have 
                different sides, count, and bonuses. Perfect for complex D&D attacks or spells.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What dice types are supported?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                We support standard dice: d2, d3, d4, d6, d8, d10, d12, d20, and d100. You can also create 
                custom dice with any number of sides using the bonus field or by modifying the sides directly.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How do bonuses work?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Bonuses are added to the total of all dice rolls. Positive bonuses add to the result, negative 
                bonuses subtract. Perfect for D&D ability modifiers, proficiency bonuses, or weapon bonuses.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Is my roll history stored?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Roll history is stored locally in your browser&apos;s memory and is cleared when you close the tab 
                or clear your browser data. We never transmit or store your rolls on our servers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I use this offline?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Yes! Once the page is loaded, you can use the dice roller completely offline. All functionality 
                works without an internet connection.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What&apos;s the difference between presets?</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Presets configure common dice combinations: d20 for basic rolls, d6 for damage, D&D Attack for 
                attack rolls with +5 bonus, and D&D Skill for skill checks with +3 bonus. Custom lets you 
                configure everything manually.
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
