'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'

interface AgeResult {
  years: number
  months: number
  days: number
  totalDays: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
  nextBirthday: {
    date: string
    daysUntil: number
    dayOfWeek: string
  }
  birthDayOfWeek: string
  zodiacSign: string
  ageInWeeks: number
}

const zodiacSigns = [
  { name: 'Capricorn', start: [12, 22], end: [1, 19] },
  { name: 'Aquarius', start: [1, 20], end: [2, 18] },
  { name: 'Pisces', start: [2, 19], end: [3, 20] },
  { name: 'Aries', start: [3, 21], end: [4, 19] },
  { name: 'Taurus', start: [4, 20], end: [5, 20] },
  { name: 'Gemini', start: [5, 21], end: [6, 20] },
  { name: 'Cancer', start: [6, 21], end: [7, 22] },
  { name: 'Leo', start: [7, 23], end: [8, 22] },
  { name: 'Virgo', start: [8, 23], end: [9, 22] },
  { name: 'Libra', start: [9, 23], end: [10, 22] },
  { name: 'Scorpio', start: [10, 23], end: [11, 21] },
  { name: 'Sagittarius', start: [11, 22], end: [12, 21] },
]

const getZodiacSign = (month: number, day: number): string => {
  for (const sign of zodiacSigns) {
    const [startMonth, startDay] = sign.start
    const [endMonth, endDay] = sign.end
    
    if (startMonth === endMonth) {
      // Same month (Capricorn spans Dec 22 - Jan 19)
      if (month === startMonth && day >= startDay) return sign.name
      if (month === endMonth && day <= endDay) return sign.name
    } else {
      // Different months
      if (month === startMonth && day >= startDay) return sign.name
      if (month === endMonth && day <= endDay) return sign.name
    }
  }
  return 'Unknown'
}

export default function AgeCalculatorPage() {
  const [birthDate, setBirthDate] = useState('')
  const [compareDate, setCompareDate] = useState('')
  const [useCompareDate, setUseCompareDate] = useState(false)
  const [autoCalculate, setAutoCalculate] = useState(false)
  const [result, setResult] = useState<AgeResult | null>(null)
  const [totalCalculations, setTotalCalculations] = useState(0)

  const calculateAge = useCallback((birth: Date, reference: Date = new Date()): AgeResult | null => {
    if (birth > reference) {
      return null
    }

    let years = reference.getFullYear() - birth.getFullYear()
    let months = reference.getMonth() - birth.getMonth()
    let days = reference.getDate() - birth.getDate()

    if (days < 0) {
      months--
      const lastMonth = new Date(reference.getFullYear(), reference.getMonth(), 0)
      days += lastMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    const diffTime = reference.getTime() - birth.getTime()
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const totalHours = Math.floor(diffTime / (1000 * 60 * 60))
    const totalMinutes = Math.floor(diffTime / (1000 * 60))
    const totalSeconds = Math.floor(diffTime / 1000)
    const ageInWeeks = Math.floor(totalDays / 7)

    // Next birthday
    const currentYear = reference.getFullYear()
    let nextBirthday = new Date(currentYear, birth.getMonth(), birth.getDate())
    if (nextBirthday <= reference) {
      nextBirthday = new Date(currentYear + 1, birth.getMonth(), birth.getDate())
    }
    const daysUntil = Math.ceil((nextBirthday.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24))
    const nextBirthdayDayOfWeek = nextBirthday.toLocaleDateString('en-US', { weekday: 'long' })

    // Birth day of week
    const birthDayOfWeek = birth.toLocaleDateString('en-US', { weekday: 'long' })

    // Zodiac sign
    const zodiacSign = getZodiacSign(birth.getMonth() + 1, birth.getDate())

    return {
      years,
      months,
      days,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      nextBirthday: {
        date: nextBirthday.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        daysUntil,
        dayOfWeek: nextBirthdayDayOfWeek
      },
      birthDayOfWeek,
      zodiacSign,
      ageInWeeks
    }
  }, [])

  useEffect(() => {
    if (autoCalculate && birthDate) {
      const birth = new Date(birthDate)
      const reference = useCompareDate && compareDate ? new Date(compareDate) : new Date()
      const ageResult = calculateAge(birth, reference)
      if (ageResult) {
        setResult(ageResult)
        setTotalCalculations(prev => prev + 1)
      }
    }
  }, [autoCalculate, birthDate, compareDate, useCompareDate, calculateAge])

  const handleCalculate = () => {
    if (!birthDate) {
      setResult(null)
      return
    }

    const birth = new Date(birthDate)
    const reference = useCompareDate && compareDate ? new Date(compareDate) : new Date()

    if (birth > reference) {
      alert('Birth date cannot be after the reference date')
      return
    }

    const ageResult = calculateAge(birth, reference)
    if (ageResult) {
      setResult(ageResult)
      setTotalCalculations(prev => prev + 1)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.error('Failed to copy')
    }
  }

  const exportToFile = () => {
    if (!result || !birthDate) return
    
    const referenceDate = useCompareDate && compareDate ? compareDate : new Date().toISOString().split('T')[0]
    const content = `Age Calculation Report
====================

Birth Date: ${new Date(birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Reference Date: ${new Date(referenceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Age Breakdown:
- Years: ${result.years}
- Months: ${result.months}
- Days: ${result.days}

Total Time:
- Total Days: ${result.totalDays.toLocaleString()}
- Total Weeks: ${result.ageInWeeks.toLocaleString()}
- Total Hours: ${result.totalHours.toLocaleString()}
- Total Minutes: ${result.totalMinutes.toLocaleString()}
- Total Seconds: ${result.totalSeconds.toLocaleString()}

Additional Information:
- Born on: ${result.birthDayOfWeek}
- Zodiac Sign: ${result.zodiacSign}
- Next Birthday: ${result.nextBirthday.date} (${result.nextBirthday.dayOfWeek})
- Days Until Next Birthday: ${result.nextBirthday.daysUntil}

Generated: ${new Date().toLocaleString()}
`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `age-calculation-${Date.now()}.txt`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setBirthDate('')
    setCompareDate('')
    setResult(null)
    setUseCompareDate(false)
  }

  const getProgressToNextBirthday = (): number => {
    if (!result) return 0
    const totalDaysInYear = 365 // Simplified, doesn't account for leap years
    const daysSinceLastBirthday = totalDaysInYear - result.nextBirthday.daysUntil
    return (daysSinceLastBirthday / totalDaysInYear) * 100
  }

  return (
    <Layout
      title="📅 Age Calculator - Calculate Exact Age in Years, Months, Days"
      description="Calculate your exact age or age between two dates. Get detailed breakdown in years, months, days, hours, minutes, and seconds. Find your zodiac sign, next birthday, and more. Free online age calculator."
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Age Calculation</h2>
              {totalCalculations > 0 && (
                <div className="text-sm text-gray-500">
                  Calculated: <span className="font-semibold text-gray-900">{totalCalculations}</span>
                </div>
              )}
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Birth Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={useCompareDate && compareDate ? compareDate : new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Compare Date Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useCompareDate}
                onChange={(e) => setUseCompareDate(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Calculate age as of a specific date</span>
            </label>

            {/* Compare Date */}
            {useCompareDate && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reference Date
                </label>
                <input
                  type="date"
                  value={compareDate}
                  onChange={(e) => setCompareDate(e.target.value)}
                  min={birthDate}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Calculate age as of this date instead of today
                </p>
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
              <span className="text-sm text-gray-700">Auto-calculate as you change dates</span>
            </label>

            {!autoCalculate && (
              <button
                onClick={handleCalculate}
                disabled={!birthDate}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50"
              >
                Calculate Age
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportToFile}
                disabled={!result}
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
            <h2 className="text-xl font-bold">Age Results</h2>

            {result ? (
              <div className="space-y-6">
                {/* Main Age Display */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200 text-center">
                    <div className="text-4xl font-bold text-blue-600">{result.years}</div>
                    <div className="text-sm text-gray-600 mt-1">Years</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200 text-center">
                    <div className="text-4xl font-bold text-green-600">{result.months}</div>
                    <div className="text-sm text-gray-600 mt-1">Months</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200 text-center">
                    <div className="text-4xl font-bold text-purple-600">{result.days}</div>
                    <div className="text-sm text-gray-600 mt-1">Days</div>
                  </div>
                </div>

                {/* Next Birthday Progress */}
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">Progress to Next Birthday</h3>
                    <span className="text-xs text-gray-600">{getProgressToNextBirthday().toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all"
                      style={{ width: `${getProgressToNextBirthday()}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    {result.nextBirthday.daysUntil} days until {result.nextBirthday.date} ({result.nextBirthday.dayOfWeek})
                  </p>
                </div>

                {/* Detailed Statistics */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Total Time</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-xs font-medium text-gray-600">Days:</span>
                      <span className="text-sm font-bold text-gray-900">{result.totalDays.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-xs font-medium text-gray-600">Weeks:</span>
                      <span className="text-sm font-bold text-gray-900">{result.ageInWeeks.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-xs font-medium text-gray-600">Hours:</span>
                      <span className="text-sm font-bold text-gray-900">{result.totalHours.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-xs font-medium text-gray-600">Minutes:</span>
                      <span className="text-sm font-bold text-gray-900">{result.totalMinutes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded col-span-2">
                      <span className="text-xs font-medium text-gray-600">Seconds:</span>
                      <span className="text-sm font-bold text-gray-900">{result.totalSeconds.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-xs text-gray-600 mb-1">Born on</div>
                    <div className="font-semibold text-gray-900">{result.birthDayOfWeek}</div>
                  </div>
                  <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                    <div className="text-xs text-gray-600 mb-1">Zodiac Sign</div>
                    <div className="font-semibold text-gray-900">{result.zodiacSign}</div>
                  </div>
                </div>

                {/* Next Birthday Info */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xs text-gray-600 mb-1">Next Birthday</div>
                  <div className="font-semibold text-gray-900 mb-1">{result.nextBirthday.date}</div>
                  <div className="text-xs text-gray-600">
                    {result.nextBirthday.dayOfWeek} • {result.nextBirthday.daysUntil} days away
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => copyToClipboard(
                    `Age: ${result.years} years, ${result.months} months, ${result.days} days\n` +
                    `Total: ${result.totalDays} days, ${result.totalHours} hours, ${result.totalMinutes} minutes, ${result.totalSeconds} seconds`
                  )}
                  className="w-full px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Copy Age Summary
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg font-semibold mb-2">Enter your birth date to calculate age</p>
                <p className="text-sm">Results will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is an Age Calculator?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                An age calculator determines how old someone is based on their birth date. It calculates the exact age in 
                years, months, and days, as well as total time in days, hours, minutes, and seconds. Age calculators are 
                useful for verifying age, planning events, and understanding time elapsed since birth.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free age calculator provides detailed age information including your zodiac sign, day of week you were 
                born, days until your next birthday, and a visual progress bar. You can also calculate age as of a 
                specific date, not just today.
              </p>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use Our Age Calculator</h2>
            <div className="prose prose-gray max-w-none">
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li><strong>Enter Birth Date:</strong> Select your date of birth using the date picker.</li>
                <li><strong>Optional - Reference Date:</strong> Check &quot;Calculate age as of a specific date&quot; to see your age on any past date.</li>
                <li><strong>Auto-Calculate:</strong> Enable auto-calculate to see results update automatically as you change dates.</li>
                <li><strong>View Results:</strong> See your age in years, months, days, and total time units. Get zodiac sign, next birthday info, and more.</li>
                <li><strong>Export:</strong> Save your age calculation to a text file for records.</li>
              </ol>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎂 Birthday Planning</h3>
                <p className="text-gray-700 text-sm">
                  Find out exactly how many days until your next birthday, what day of the week it falls on, and plan 
                  celebrations accordingly.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 Age Verification</h3>
                <p className="text-gray-700 text-sm">
                  Verify exact age for legal purposes, age-restricted activities, or documentation. Get precise age in 
                  years, months, and days.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Historical Age</h3>
                <p className="text-gray-700 text-sm">
                  Calculate how old someone was on a specific date in the past. Useful for historical research, 
                  genealogy, or understanding age at specific life events.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🔮 Zodiac Sign</h3>
                <p className="text-gray-700 text-sm">
                  Discover your zodiac sign based on your birth date. Each sign has specific date ranges that determine 
                  astrological characteristics.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">⏱️ Time Statistics</h3>
                <p className="text-gray-700 text-sm">
                  See your age in various time units - total days lived, hours, minutes, and seconds. Interesting 
                  statistics about your lifetime.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📅 Event Planning</h3>
                <p className="text-gray-700 text-sm">
                  Calculate ages for event planning, milestone celebrations, or age-based activities. Know exact ages 
                  for invitations and planning.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Precise Calculation:</strong> Age in years, months, days with accurate month and leap year handling.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Multiple Time Units:</strong> Total days, weeks, hours, minutes, and seconds since birth.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Next Birthday Info:</strong> See when your next birthday is, what day of week, and days until.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Zodiac Sign:</strong> Automatically determine your zodiac sign based on birth date.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Date Comparison:</strong> Calculate age as of any past date, not just today.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Visual Progress:</strong> Progress bar showing how far through the year you are until next birthday.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Export Results:</strong> Save age calculation to a text file with all details.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How accurate is the age calculation?</h3>
                <p className="text-gray-700 text-sm">
                  Our calculator accounts for leap years, different month lengths, and handles edge cases accurately. 
                  The calculation is precise to the day, and time units (hours, minutes, seconds) are calculated from 
                  the exact time difference.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I calculate age for a past date?</h3>
                <p className="text-gray-700 text-sm">
                  Yes! Enable &quot;Calculate age as of a specific date&quot; and enter any past date. This shows how old someone 
                  was on that specific date, useful for historical calculations or understanding age at past events.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How are months calculated?</h3>
                <p className="text-gray-700 text-sm">
                  Months are calculated by counting full months between dates. If the current day is before the birth day 
                  in the month, we count back one month and adjust days accordingly. This ensures accurate month calculations.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What if I was born on February 29th (leap day)?</h3>
                <p className="text-gray-700 text-sm">
                  Our calculator handles leap day birthdays correctly. In non-leap years, your birthday is considered 
                  February 28th for age calculation purposes, and the next birthday is March 1st.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How is the zodiac sign determined?</h3>
                <p className="text-gray-700 text-sm">
                  Zodiac signs are determined by your birth date. Each sign has specific date ranges. For example, 
                  Aries is March 21 - April 19, Taurus is April 20 - May 20, etc. The calculator automatically 
                  determines your sign based on these ranges.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my birth date stored?</h3>
                <p className="text-gray-700 text-sm">
                  No, all calculations happen in your browser. We never see, store, or transmit your birth date or any 
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
