'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type Tab = 'date' | 'age'
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

interface AgeResult {
  years: number
  months: number
  days: number
  totalDays: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
  totalMilliseconds: number
  hoursInCurrentDay: number
  minutesInCurrentHour: number
  secondsInCurrentMinute: number
  nextBirthday: {
    date: string
    daysUntil: number
    hoursUntil: number
    minutesUntil: number
    secondsUntil: number
    dayOfWeek: string
  }
  birthDayOfWeek: string
  zodiacSign: string
  ageInWeeks: number
  ageInMonths: number
  percentageOfYear: number
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
      if (month === startMonth && day >= startDay) return sign.name
      if (month === endMonth && day <= endDay) return sign.name
    } else {
      if (month === startMonth && day >= startDay) return sign.name
      if (month === endMonth && day <= endDay) return sign.name
    }
  }
  return 'Unknown'
}

export default function DateCalculatorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('date')
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

  // Age Calculator state
  const [birthDate, setBirthDate] = useState('')
  const [compareDate, setCompareDate] = useState('')
  const [useCompareDate, setUseCompareDate] = useState(false)
  const [autoCalculateAge, setAutoCalculateAge] = useState(false)
  const [liveUpdate, setLiveUpdate] = useState(false)
  const [ageResult, setAgeResult] = useState<AgeResult | null>(null)
  const [totalAgeCalculations, setTotalAgeCalculations] = useState(0)

  // Check URL hash for tab switching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash === '#age') {
        setActiveTab('age')
      } else {
        setActiveTab('date')
      }
    }
  }, [])

  // Update URL hash when tab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = activeTab === 'age' ? '#age' : ''
      if (window.location.hash !== hash) {
        window.history.replaceState(null, '', hash || window.location.pathname)
      }
    }
  }, [activeTab])

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

  // Age Calculator functions
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
    const totalMilliseconds = diffTime
    const ageInWeeks = Math.floor(totalDays / 7)
    const ageInMonths = years * 12 + months

    const hoursInCurrentDay = reference.getHours()
    const minutesInCurrentHour = reference.getMinutes()
    const secondsInCurrentMinute = reference.getSeconds()

    const startOfYear = new Date(reference.getFullYear(), 0, 1)
    const endOfYear = new Date(reference.getFullYear() + 1, 0, 1)
    const daysInYear = Math.floor((endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
    const daysSinceYearStart = Math.floor((reference.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
    const percentageOfYear = (daysSinceYearStart / daysInYear) * 100

    const currentYear = reference.getFullYear()
    let nextBirthday = new Date(currentYear, birth.getMonth(), birth.getDate())
    if (nextBirthday <= reference) {
      nextBirthday = new Date(currentYear + 1, birth.getMonth(), birth.getDate())
    }
    const timeUntilBirthday = nextBirthday.getTime() - reference.getTime()
    const daysUntil = Math.floor(timeUntilBirthday / (1000 * 60 * 60 * 24))
    const hoursUntil = Math.floor((timeUntilBirthday % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutesUntil = Math.floor((timeUntilBirthday % (1000 * 60 * 60)) / (1000 * 60))
    const secondsUntil = Math.floor((timeUntilBirthday % (1000 * 60)) / 1000)
    const nextBirthdayDayOfWeek = nextBirthday.toLocaleDateString('en-US', { weekday: 'long' })
    const birthDayOfWeek = birth.toLocaleDateString('en-US', { weekday: 'long' })
    const zodiacSign = getZodiacSign(birth.getMonth() + 1, birth.getDate())

    return {
      years,
      months,
      days,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      totalMilliseconds,
      hoursInCurrentDay,
      minutesInCurrentHour,
      secondsInCurrentMinute,
      nextBirthday: {
        date: nextBirthday.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        daysUntil,
        hoursUntil,
        minutesUntil,
        secondsUntil,
        dayOfWeek: nextBirthdayDayOfWeek
      },
      birthDayOfWeek,
      zodiacSign,
      ageInWeeks,
      ageInMonths,
      percentageOfYear
    }
  }, [])

  useEffect(() => {
    if (autoCalculateAge && birthDate) {
      const birth = new Date(birthDate)
      const reference = useCompareDate && compareDate ? new Date(compareDate) : new Date()
      const ageResult = calculateAge(birth, reference)
      if (ageResult) {
        setAgeResult(ageResult)
        setTotalAgeCalculations(prev => prev + 1)
      }
    }
  }, [autoCalculateAge, birthDate, compareDate, useCompareDate, calculateAge])

  useEffect(() => {
    if (liveUpdate && birthDate && !useCompareDate) {
      const interval = setInterval(() => {
        const birth = new Date(birthDate)
        const ageResult = calculateAge(birth, new Date())
        if (ageResult) {
          setAgeResult(ageResult)
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [liveUpdate, birthDate, useCompareDate, calculateAge])

  const handleCalculateAge = () => {
    if (!birthDate) {
      setAgeResult(null)
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
      setAgeResult(ageResult)
      setTotalAgeCalculations(prev => prev + 1)
    }
  }

  const clearAgeAll = () => {
    setBirthDate('')
    setCompareDate('')
    setAgeResult(null)
    setUseCompareDate(false)
  }

  // SEO data
  const toolPath = '/date-calculator'
  const toolName = 'Date & Age Calculator'
  const category = 'converter'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  // FAQ data
  const faqs = [
    {
      question: "How do I calculate the difference between two dates?",
      answer: "Select the 'Date Difference' tab, choose your start and end dates, and the calculator automatically shows the difference in years, months, weeks, days, hours, minutes, and seconds with a detailed breakdown."
    },
    {
      question: "Can I add or subtract time from a date?",
      answer: "Yes! Use the 'Add/Subtract' tab to add or subtract years, months, weeks, or days from any date. Enter the base date, specify the amount to add or subtract, and see the result instantly."
    },
    {
      question: "How do I calculate someone's age?",
      answer: "Switch to the 'Age Calculator' tab, enter the birth date, optionally select a comparison date, and see the exact age in years, months, days, hours, minutes, and seconds. Enable live update to see age update in real-time."
    },
    {
      question: "What date formats are supported?",
      answer: "The calculator supports standard date formats. You can use date pickers or enter dates manually. The calculator handles leap years, different month lengths, and time zones correctly."
    },
    {
      question: "Can I see detailed breakdowns?",
      answer: "Yes! The calculator provides detailed breakdowns showing years, months, weeks, days, hours, minutes, and seconds. For age calculations, you also see total days lived, next birthday countdown, and day of week information."
    },
    {
      question: "Is the date calculator free?",
      answer: "Yes, completely free! No registration, no limits, no hidden fees. All calculations happen in your browser - we never see or store your data."
    }
  ]

  // HowTo steps
  const howToSteps = [
    {
      name: "Choose Calculation Type",
      text: "Select the tab for your calculation: Date Difference (calculate time between dates), Add/Subtract (add or subtract time from a date), or Age Calculator (calculate exact age)."
    },
    {
      name: "Enter Dates",
      text: "For date difference: select start and end dates. For add/subtract: enter base date and amount to add/subtract. For age: enter birth date and optional comparison date."
    },
    {
      name: "Configure Options",
      text: "For age calculator, enable 'Live Update' to see age update in real-time. For add/subtract, choose the unit (years, months, weeks, days) and operation (add or subtract)."
    },
    {
      name: "View Results",
      text: "See detailed results including years, months, weeks, days, hours, minutes, and seconds. For age, also see total days lived, next birthday, and day of week."
    },
    {
      name: "Use Results",
      text: "Use the calculated results for planning events, tracking milestones, calculating deadlines, or any date-related calculations you need."
    }
  ]

  // Structured data
  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Calculate Date Differences and Age",
      "Learn how to calculate the difference between dates, add/subtract time from dates, and calculate exact age using our free online date and age calculator.",
      howToSteps,
      "PT3M"
    ),
    generateSoftwareApplicationSchema(
      "Date & Age Calculator",
      "Free online date and age calculator. Calculate date differences, add/subtract time from dates, and calculate exact age in years, months, days, hours, minutes, and seconds. Detailed breakdowns and live updates.",
      "https://prylad.pro/date-calculator",
      "UtilityApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="📅 Date & Age Calculator - Calculate Date Differences & Age"
        description="Calculate the difference between two dates, add/subtract time from dates, and calculate exact age in years, months, days, hours, minutes, and seconds. Free online date and age calculator with detailed breakdowns."
        breadcrumbs={breadcrumbs}
      >
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Tabs */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('date')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'date'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Date Calculator
            </button>
            <button
              onClick={() => setActiveTab('age')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'age'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Age Calculator
            </button>
          </div>
        </div>

        {/* DATE CALCULATOR TAB */}
        {activeTab === 'date' && (
          <div className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Date Calculator</h2>
              {totalCalculations > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Calculated: <span className="font-semibold text-gray-900 dark:text-gray-100">{totalCalculations}</span>
                </div>
              )}
            </div>

            {/* Operation Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Operation:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setOperation('difference')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    operation === 'difference'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Difference
                </button>
                <button
                  onClick={() => setOperation('add')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    operation === 'add'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Add
                </button>
                <button
                  onClick={() => setOperation('subtract')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    operation === 'subtract'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date 1</label>
                    <input
                      type="date"
                      value={date1}
                      onChange={(e) => setDate1(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date 2</label>
                    <input
                      type="date"
                      value={date2}
                      onChange={(e) => setDate2(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Add/Subtract Mode */}
            {(operation === 'add' || operation === 'subtract') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Base Date</label>
                  <input
                    type="date"
                    value={baseDate}
                    onChange={(e) => setBaseDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quick Presets:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {datePresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className="px-3 py-2 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs transition-colors"
                      >
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{preset.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Years</label>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={addYears}
                      onChange={(e) => setAddYears(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Months</label>
                    <input
                      type="number"
                      min="0"
                      max="1200"
                      value={addMonths}
                      onChange={(e) => setAddMonths(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Weeks</label>
                    <input
                      type="number"
                      min="0"
                      max="5200"
                      value={addWeeks}
                      onChange={(e) => setAddWeeks(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Days</label>
                    <input
                      type="number"
                      min="0"
                      max="36500"
                      value={addDays}
                      onChange={(e) => setAddDays(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-calculate as you change values</span>
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
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Results</h2>

            {/* Difference Results */}
            {operation === 'difference' && difference && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 text-center">
                    <div className="text-3xl font-bold text-blue-600">{difference.years}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Years</div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 text-center">
                    <div className="text-3xl font-bold text-green-600">{difference.months}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Months</div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800 text-center">
                    <div className="text-3xl font-bold text-purple-600">{difference.days}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Days</div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Total Time</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Weeks:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{difference.weeks.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Days:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{difference.totalDays.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Hours:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{difference.totalHours.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Minutes:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{difference.totalMinutes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded col-span-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Seconds:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{difference.totalSeconds.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${difference.isPast ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`}>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
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
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {operation === 'add' ? 'Date After Adding' : 'Date After Subtracting'}
                  </div>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{result}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(result).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Calculation Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Base Date:</span>
                      <span className="font-medium">{new Date(baseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{operation === 'add' ? 'Added' : 'Subtracted'}:</span>
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
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <p className="text-lg font-semibold mb-2">Enter dates to calculate</p>
                <p className="text-sm">Results will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">What is a Date Calculator?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                A date calculator helps you perform calculations with dates. You can calculate the difference between two 
                dates in years, months, weeks, days, hours, minutes, and seconds. You can also add or subtract time 
                periods (years, months, weeks, days) from any date to find future or past dates.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our free date calculator provides detailed breakdowns of date differences and allows you to add or subtract 
                any combination of years, months, weeks, and days from a base date. Perfect for project planning, deadline 
                calculations, age calculations, and date arithmetic.
              </p>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How to Use Our Date Calculator</h2>
            <div className="prose prose-gray max-w-none">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Calculate Difference Between Dates:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                    <li>Select &quot;Difference&quot; operation</li>
                    <li>Enter Date 1 and Date 2</li>
                    <li>See detailed breakdown in years, months, weeks, days, and total time units</li>
                    <li>View which date comes first</li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Add or Subtract Time from a Date:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                    <li>Select &quot;Add&quot; or &quot;Subtract&quot; operation</li>
                    <li>Enter a base date (or use quick presets like &quot;Today&quot;, &quot;Tomorrow&quot;)</li>
                    <li>Enter years, months, weeks, and/or days to add or subtract</li>
                    <li>See the calculated result date with day of week</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📅 Project Planning</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Calculate project durations, deadlines, and milestones. Add weeks or months to start dates to find 
                  completion dates, or calculate time between project phases.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📆 Event Planning</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Plan events by calculating how many days until an event, or find dates for recurring events by adding 
                  weeks or months to a base date.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">⏰ Deadline Calculations</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Calculate how many days, weeks, or months until a deadline. Add time periods to current date to find 
                  when tasks should be started.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📊 Age Calculations</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Calculate age differences between people, or find someone&apos;s age on a specific date. Useful for 
                  legal, educational, or personal purposes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📝 Contract & Subscription</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Calculate subscription end dates, contract expiration dates, or trial periods by adding months or years 
                  to start dates.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">🗓️ Calendar Planning</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Plan schedules, appointments, and recurring events. Calculate dates for &quot;every 2 weeks&quot; or 
                  &quot;every 3 months&quot; from a starting date.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
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

          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How accurate is the date calculation?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our calculator accounts for leap years, different month lengths, and handles edge cases accurately. 
                  When adding months or years, it correctly handles month-end dates and leap years.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What happens if I add months to a date that doesn&apos;t have that day?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  For example, adding 1 month to January 31 results in February 28 (or 29 in leap years). The calculator 
                  automatically adjusts to the last valid day of the target month.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I calculate negative differences?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes! If Date 1 is after Date 2, the calculator shows the absolute difference and indicates which date 
                  comes first. All time units are positive, but the direction is clearly indicated.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How are weeks calculated in the difference?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Weeks are calculated as total days divided by 7 (rounded down). This gives you the number of complete 
                  weeks between the two dates.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Can I subtract time from a date?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Yes! Use the &quot;Subtract&quot; operation to subtract years, months, weeks, or days from a base date. 
                  This is useful for finding past dates or calculating &quot;X days ago&quot; scenarios.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Are my dates stored?</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No, all calculations happen in your browser. We never see, store, or transmit any of your dates or 
                  personal information. Your privacy is completely protected.
                </p>
              </div>
            </div>
          </section>
        </div>
          </div>
        )}

        {/* AGE CALCULATOR TAB */}
        {activeTab === 'age' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Age Calculation</h2>
                  {totalAgeCalculations > 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Calculated: <span className="font-semibold text-gray-900 dark:text-gray-100">{totalAgeCalculations}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Birth Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={useCompareDate && compareDate ? compareDate : new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCompareDate}
                    onChange={(e) => setUseCompareDate(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Calculate age as of a specific date</span>
                </label>

                {useCompareDate && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Reference Date
                    </label>
                    <input
                      type="date"
                      value={compareDate}
                      onChange={(e) => setCompareDate(e.target.value)}
                      min={birthDate}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCalculateAge}
                    onChange={(e) => setAutoCalculateAge(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Auto-calculate as you change dates</span>
                </label>

                {!useCompareDate && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={liveUpdate}
                      onChange={(e) => setLiveUpdate(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Live update (updates every second) {liveUpdate && <span className="text-green-600 dark:text-green-400">●</span>}
                    </span>
                  </label>
                )}

                {!autoCalculateAge && (
                  <button
                    onClick={handleCalculateAge}
                    disabled={!birthDate}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50"
                  >
                    Calculate Age
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={clearAgeAll}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Age Results</h2>

                {ageResult ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 text-center">
                        <div className="text-4xl font-bold text-blue-600">{ageResult.years}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Years</div>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 text-center">
                        <div className="text-4xl font-bold text-green-600">{ageResult.months}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Months</div>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800 text-center">
                        <div className="text-4xl font-bold text-purple-600">{ageResult.days}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Days</div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Total Time Since Birth</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Days:</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{ageResult.totalDays.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Hours:</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{ageResult.totalHours.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Minutes:</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{ageResult.totalMinutes.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Seconds:</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{ageResult.totalSeconds.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Born on</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{ageResult.birthDayOfWeek}</div>
                      </div>
                      <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Zodiac Sign</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{ageResult.zodiacSign}</div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Next Birthday</div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{ageResult.nextBirthday.date}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {ageResult.nextBirthday.daysUntil} days until next birthday
                      </div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(
                        `Age: ${ageResult.years} years, ${ageResult.months} months, ${ageResult.days} days\n` +
                        `Total: ${ageResult.totalDays} days, ${ageResult.totalHours} hours, ${ageResult.totalMinutes} minutes, ${ageResult.totalSeconds} seconds`
                      )}
                      className="w-full px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Copy Age Summary
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <p className="text-lg font-semibold mb-2">Enter your birth date to calculate age</p>
                    <p className="text-sm">Results will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <RelatedTools tools={relatedTools} title="Related Converter Tools" />
      )}
    </Layout>
    </>
  )
}
