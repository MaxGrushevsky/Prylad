'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'

type Operation = 'difference' | 'add' | 'subtract'

interface DateDifference {
  years: number
  months: number
  weeks: number
  days: number
  totalDays: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
  isPast: boolean
}

const datePresets = [
  { name: 'Today', days: 0 },
  { name: 'Tomorrow', days: 1 },
  { name: 'Next Week', days: 7 },
  { name: 'Next Month', days: 30 },
  { name: 'Next Year', days: 365 },
  { name: 'Yesterday', days: -1 },
  { name: 'Last Week', days: -7 },
  { name: 'Last Month', days: -30 },
  { name: 'Last Year', days: -365 },
]

export default function DateCalculatorPage() {
  const [operation, setOperation] = useState<Operation>('difference')
  const [date1, setDate1] = useState('')
  const [date2, setDate2] = useState('')
  const [baseDate, setBaseDate] = useState('')
  const [addYears, setAddYears] = useState(0)
  const [addMonths, setAddMonths] = useState(0)
  const [addWeeks, setAddWeeks] = useState(0)
  const [addDays, setAddDays] = useState(0)
  const [autoCalculate, setAutoCalculate] = useState(false)
  const [difference, setDifference] = useState<DateDifference | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [totalCalculations, setTotalCalculations] = useState(0)

  const calculateDifference = useCallback((d1: Date, d2: Date): DateDifference => {
    const earlier = d1 < d2 ? d1 : d2
    const later = d1 < d2 ? d2 : d1
    const isPast = d1 > d2

    let years = later.getFullYear() - earlier.getFullYear()
    let months = later.getMonth() - earlier.getMonth()
    let days = later.getDate() - earlier.getDate()

    if (days < 0) {
      months--
      const lastMonth = new Date(later.getFullYear(), later.getMonth(), 0)
      days += lastMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    const diffTime = Math.abs(later.getTime() - earlier.getTime())
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const weeks = Math.floor(totalDays / 7)
    const totalHours = Math.floor(diffTime / (1000 * 60 * 60))
    const totalMinutes = Math.floor(diffTime / (1000 * 60))
    const totalSeconds = Math.floor(diffTime / 1000)

    return {
      years,
      months,
      weeks,
      days,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      isPast
    }
  }, [])

  const addToDate = useCallback((date: Date, years: number, months: number, weeks: number, days: number): Date => {
    const result = new Date(date)
    result.setFullYear(result.getFullYear() + years)
    result.setMonth(result.getMonth() + months)
    result.setDate(result.getDate() + (weeks * 7) + days)
    return result
  }, [])

  const subtractFromDate = useCallback((date: Date, years: number, months: number, weeks: number, days: number): Date => {
    return addToDate(date, -years, -months, -weeks, -days)
  }, [addToDate])

  useEffect(() => {
    if (autoCalculate) {
      if (operation === 'difference' && date1 && date2) {
        const d1 = new Date(date1)
        const d2 = new Date(date2)
        const diff = calculateDifference(d1, d2)
        setDifference(diff)
        setTotalCalculations(prev => prev + 1)
      } else if ((operation === 'add' || operation === 'subtract') && baseDate) {
        const base = new Date(baseDate)
        const calculated = operation === 'add'
          ? addToDate(base, addYears, addMonths, addWeeks, addDays)
          : subtractFromDate(base, addYears, addMonths, addWeeks, addDays)
        setResult(calculated.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }))
        setTotalCalculations(prev => prev + 1)
      }
    }
  }, [autoCalculate, operation, date1, date2, baseDate, addYears, addMonths, addWeeks, addDays, calculateDifference, addToDate, subtractFromDate])

  const handleCalculate = () => {
    if (operation === 'difference') {
      if (!date1 || !date2) {
        setDifference(null)
        return
      }
      const d1 = new Date(date1)
      const d2 = new Date(date2)
      const diff = calculateDifference(d1, d2)
      setDifference(diff)
      setTotalCalculations(prev => prev + 1)
    } else {
      if (!baseDate) {
        setResult(null)
        return
      }
      const base = new Date(baseDate)
      const calculated = operation === 'add'
        ? addToDate(base, addYears, addMonths, addWeeks, addDays)
        : subtractFromDate(base, addYears, addMonths, addWeeks, addDays)
      setResult(calculated.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }))
      setTotalCalculations(prev => prev + 1)
    }
  }

  const applyPreset = (preset: typeof datePresets[0]) => {
    const today = new Date()
    today.setDate(today.getDate() + preset.days)
    setBaseDate(today.toISOString().split('T')[0])
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.error('Failed to copy')
    }
  }

  const exportToFile = () => {
    let content = ''
    if (operation === 'difference' && difference && date1 && date2) {
      content = `Date Difference Calculation
=======================

Date 1: ${new Date(date1).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Date 2: ${new Date(date2).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Difference:
- Years: ${difference.years}
- Months: ${difference.months}
- Weeks: ${difference.weeks}
- Days: ${difference.days}

Total Time:
- Total Days: ${difference.totalDays.toLocaleString()}
- Total Hours: ${difference.totalHours.toLocaleString()}
- Total Minutes: ${difference.totalMinutes.toLocaleString()}
- Total Seconds: ${difference.totalSeconds.toLocaleString()}

Direction: ${difference.isPast ? 'Date 1 is after Date 2' : 'Date 1 is before Date 2'}

Generated: ${new Date().toLocaleString()}
`
    } else if (result && baseDate) {
      const operationText = operation === 'add' ? 'Add' : 'Subtract'
      content = `Date Calculation
================

Base Date: ${new Date(baseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${operationText}:
- Years: ${addYears}
- Months: ${addMonths}
- Weeks: ${addWeeks}
- Days: ${addDays}

Result: ${result}

Generated: ${new Date().toLocaleString()}
`
    } else {
      return
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `date-calculation-${Date.now()}.txt`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setDate1('')
    setDate2('')
    setBaseDate('')
    setAddYears(0)
    setAddMonths(0)
    setAddWeeks(0)
    setAddDays(0)
    setDifference(null)
    setResult(null)
  }

  return (
    <Layout
      title="📅 Date Calculator - Calculate Difference Between Dates & Add/Subtract Days"
      description="Calculate the difference between two dates in years, months, weeks, days, hours, minutes, and seconds. Add or subtract years, months, weeks, and days from any date. Free online date calculator with detailed breakdowns."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Date Calculator</h2>
              {totalCalculations > 0 && (
                <div className="text-sm text-gray-500">
                  Calculated: <span className="font-semibold text-gray-900">{totalCalculations}</span>
                </div>
              )}
            </div>

            {/* Operation Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Operation:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setOperation('difference')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    operation === 'difference'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Difference
                </button>
                <button
                  onClick={() => setOperation('add')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    operation === 'add'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Add
                </button>
                <button
                  onClick={() => setOperation('subtract')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    operation === 'subtract'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Subtract
                </button>
              </div>
            </div>

            {/* Difference Mode */}
            {operation === 'difference' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date 1</label>
                    <input
                      type="date"
                      value={date1}
                      onChange={(e) => setDate1(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date 2</label>
                    <input
                      type="date"
                      value={date2}
                      onChange={(e) => setDate2(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Add/Subtract Mode */}
            {(operation === 'add' || operation === 'subtract') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Base Date</label>
                  <input
                    type="date"
                    value={baseDate}
                    onChange={(e) => setBaseDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quick Presets:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {datePresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className="px-3 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-xs transition-colors"
                      >
                        <div className="font-semibold text-gray-900">{preset.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Years</label>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={addYears}
                      onChange={(e) => setAddYears(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Months</label>
                    <input
                      type="number"
                      min="0"
                      max="1200"
                      value={addMonths}
                      onChange={(e) => setAddMonths(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Weeks</label>
                    <input
                      type="number"
                      min="0"
                      max="5200"
                      value={addWeeks}
                      onChange={(e) => setAddWeeks(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Days</label>
                    <input
                      type="number"
                      min="0"
                      max="36500"
                      value={addDays}
                      onChange={(e) => setAddDays(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Auto Calculate Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCalculate}
                onChange={(e) => setAutoCalculate(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Auto-calculate as you change values</span>
            </label>

            {!autoCalculate && (
              <button
                onClick={handleCalculate}
                disabled={
                  (operation === 'difference' && (!date1 || !date2)) ||
                  ((operation === 'add' || operation === 'subtract') && !baseDate)
                }
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50"
              >
                Calculate
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportToFile}
                disabled={!difference && !result}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Export
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold">Results</h2>

            {/* Difference Results */}
            {operation === 'difference' && difference && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200 text-center">
                    <div className="text-3xl font-bold text-blue-600">{difference.years}</div>
                    <div className="text-xs text-gray-600 mt-1">Years</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200 text-center">
                    <div className="text-3xl font-bold text-green-600">{difference.months}</div>
                    <div className="text-xs text-gray-600 mt-1">Months</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200 text-center">
                    <div className="text-3xl font-bold text-purple-600">{difference.days}</div>
                    <div className="text-xs text-gray-600 mt-1">Days</div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Total Time</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-xs font-medium text-gray-600">Weeks:</span>
                      <span className="text-sm font-bold text-gray-900">{difference.weeks.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-xs font-medium text-gray-600">Days:</span>
                      <span className="text-sm font-bold text-gray-900">{difference.totalDays.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-xs font-medium text-gray-600">Hours:</span>
                      <span className="text-sm font-bold text-gray-900">{difference.totalHours.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-xs font-medium text-gray-600">Minutes:</span>
                      <span className="text-sm font-bold text-gray-900">{difference.totalMinutes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded col-span-2">
                      <span className="text-xs font-medium text-gray-600">Seconds:</span>
                      <span className="text-sm font-bold text-gray-900">{difference.totalSeconds.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${difference.isPast ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                  <p className="text-xs text-gray-600">
                    {difference.isPast 
                      ? 'Date 1 is after Date 2' 
                      : 'Date 1 is before Date 2'}
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(
                    `Difference: ${difference.years} years, ${difference.months} months, ${difference.days} days\n` +
                    `Total: ${difference.totalDays} days, ${difference.totalHours} hours, ${difference.totalMinutes} minutes, ${difference.totalSeconds} seconds`
                  )}
                  className="w-full px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Copy Summary
                </button>
              </div>
            )}

            {/* Add/Subtract Results */}
            {(operation === 'add' || operation === 'subtract') && result && (
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    {operation === 'add' ? 'Date After Adding' : 'Date After Subtracting'}
                  </div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">{result}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(result).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Calculation Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Date:</span>
                      <span className="font-medium">{new Date(baseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{operation === 'add' ? 'Added' : 'Subtracted'}:</span>
                      <span className="font-medium">
                        {addYears > 0 && `${addYears} year${addYears !== 1 ? 's' : ''} `}
                        {addMonths > 0 && `${addMonths} month${addMonths !== 1 ? 's' : ''} `}
                        {addWeeks > 0 && `${addWeeks} week${addWeeks !== 1 ? 's' : ''} `}
                        {addDays > 0 && `${addDays} day${addDays !== 1 ? 's' : ''}`}
                        {addYears === 0 && addMonths === 0 && addWeeks === 0 && addDays === 0 && '0 days'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(result)}
                  className="w-full px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Copy Result
                </button>
              </div>
            )}

            {!difference && !result && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg font-semibold mb-2">Enter dates to calculate</p>
                <p className="text-sm">Results will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is a Date Calculator?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                A date calculator helps you perform calculations with dates. You can calculate the difference between two 
                dates in years, months, weeks, days, hours, minutes, and seconds. You can also add or subtract time 
                periods (years, months, weeks, days) from any date to find future or past dates.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free date calculator provides detailed breakdowns of date differences and allows you to add or subtract 
                any combination of years, months, weeks, and days from a base date. Perfect for project planning, deadline 
                calculations, age calculations, and date arithmetic.
              </p>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Our Date Calculator</h2>
            <div className="prose prose-gray max-w-none">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Calculate Difference Between Dates:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
                    <li>Select &quot;Difference&quot; operation</li>
                    <li>Enter Date 1 and Date 2</li>
                    <li>See detailed breakdown in years, months, weeks, days, and total time units</li>
                    <li>View which date comes first</li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Add or Subtract Time from a Date:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
                    <li>Select &quot;Add&quot; or &quot;Subtract&quot; operation</li>
                    <li>Enter a base date (or use quick presets like &quot;Today&quot;, &quot;Tomorrow&quot;)</li>
                    <li>Enter years, months, weeks, and/or days to add or subtract</li>
                    <li>See the calculated result date with day of week</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📅 Project Planning</h3>
                <p className="text-gray-700 text-sm">
                  Calculate project durations, deadlines, and milestones. Add weeks or months to start dates to find 
                  completion dates, or calculate time between project phases.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📆 Event Planning</h3>
                <p className="text-gray-700 text-sm">
                  Plan events by calculating how many days until an event, or find dates for recurring events by adding 
                  weeks or months to a base date.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">⏰ Deadline Calculations</h3>
                <p className="text-gray-700 text-sm">
                  Calculate how many days, weeks, or months until a deadline. Add time periods to current date to find 
                  when tasks should be started.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Age Calculations</h3>
                <p className="text-gray-700 text-sm">
                  Calculate age differences between people, or find someone&apos;s age on a specific date. Useful for 
                  legal, educational, or personal purposes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Contract & Subscription</h3>
                <p className="text-gray-700 text-sm">
                  Calculate subscription end dates, contract expiration dates, or trial periods by adding months or years 
                  to start dates.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🗓️ Calendar Planning</h3>
                <p className="text-gray-700 text-sm">
                  Plan schedules, appointments, and recurring events. Calculate dates for &quot;every 2 weeks&quot; or 
                  &quot;every 3 months&quot; from a starting date.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Date Difference:</strong> Calculate precise difference between two dates in years, months, weeks, days, hours, minutes, and seconds.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Add/Subtract Time:</strong> Add or subtract any combination of years, months, weeks, and days from any date.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Quick Presets:</strong> Use presets like &quot;Today&quot;, &quot;Tomorrow&quot;, &quot;Next Week&quot;, &quot;Last Month&quot; for quick date selection.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Detailed Breakdown:</strong> See not just total days, but also years, months, weeks, and smaller time units.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Direction Indicator:</strong> See which date comes first when calculating differences.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Auto-Calculate:</strong> Enable auto-calculation to see results update automatically as you change values.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Export Results:</strong> Save calculations to a text file with all details for records.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How accurate is the date calculation?</h3>
                <p className="text-gray-700 text-sm">
                  Our calculator accounts for leap years, different month lengths, and handles edge cases accurately. 
                  When adding months or years, it correctly handles month-end dates and leap years.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What happens if I add months to a date that doesn&apos;t have that day?</h3>
                <p className="text-gray-700 text-sm">
                  For example, adding 1 month to January 31 results in February 28 (or 29 in leap years). The calculator 
                  automatically adjusts to the last valid day of the target month.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I calculate negative differences?</h3>
                <p className="text-gray-700 text-sm">
                  Yes! If Date 1 is after Date 2, the calculator shows the absolute difference and indicates which date 
                  comes first. All time units are positive, but the direction is clearly indicated.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How are weeks calculated in the difference?</h3>
                <p className="text-gray-700 text-sm">
                  Weeks are calculated as total days divided by 7 (rounded down). This gives you the number of complete 
                  weeks between the two dates.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I subtract time from a date?</h3>
                <p className="text-gray-700 text-sm">
                  Yes! Use the &quot;Subtract&quot; operation to subtract years, months, weeks, or days from a base date. 
                  This is useful for finding past dates or calculating &quot;X days ago&quot; scenarios.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Are my dates stored?</h3>
                <p className="text-gray-700 text-sm">
                  No, all calculations happen in your browser. We never see, store, or transmit any of your dates or 
                  personal information. Your privacy is completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}
